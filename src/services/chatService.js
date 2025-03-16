// src/services/chatService.js
import { connectToDatabase } from '@/lib/mongoose';
import ChatConversation from '@/models/ChatConversation';
import ChatMessage from '@/models/ChatMessage';
import KnowledgeArticle from '@/models/KnowledgeArticle';
import { OpenAIEmbeddings } from '@/lib/openai';

export const chatService = {
  /**
   * Generate a response to a user message using RAG (Retrieval Augmented Generation)
   */
  async generateResponse(conversationId, userMessage, sessionId, userId, metadata) {
    try {
      await connectToDatabase();
      
      // Step 1: Create or get conversation
      let conversation;
      if (conversationId) {
        conversation = await ChatConversation.findById(conversationId);
        if (!conversation) {
          throw new Error('Conversation not found');
        }
      } else {
        // Create a new conversation
        conversation = await ChatConversation.create({
          userId,
          sessionId,
          title: this.generateConversationTitle(userMessage),
          metadata
        });
      }
      
      // Step 2: Save user message
      const userChatMessage = await ChatMessage.create({
        conversationId: conversation._id,
        role: 'user',
        content: userMessage
      });
      
      // Step 3: Generate embeddings for the user query
      const embedding = await OpenAIEmbeddings.createEmbedding(userMessage);
      
      // Step 4: Retrieve relevant context using vector search
      const relevantArticles = await this.findRelevantArticles(embedding, userMessage);
      
      // Step 5: Generate AI response using retrieved context
      const aiResponse = await this.generateAIResponse(userMessage, relevantArticles, conversation._id);
      
      // Step 6: Save AI response
      const sources = relevantArticles.map(article => ({
        articleId: article._id,
        title: article.title,
        slug: article.slug,
        score: article.score || 1.0 // Provide a default score if not available
      }));
      
      const assistantMessage = await ChatMessage.create({
        conversationId: conversation._id,
        role: 'assistant',
        content: aiResponse,
        sources,
        metadata: {
          tokensUsed: 0, // Would calculate actual tokens in production
          processingTime: 0,
          promptTokens: 0,
          completionTokens: 0
        }
      });
      
      // Step 7: Update conversation lastMessageAt
      await ChatConversation.findByIdAndUpdate(
        conversation._id,
        { lastMessageAt: new Date() }
      );
      
      // Return response
      return {
        answer: aiResponse,
        sources,
        conversationId: conversation._id,
        messageId: assistantMessage._id
      };
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  },
  
  /**
   * Find relevant articles using vector search
   */
  async findRelevantArticles(embedding, originalQuery) {
    try {
      await connectToDatabase();
      
      // Attempt vector search first
      try {
        const pipeline = [
          {
            $vectorSearch: {
              index: 'knowledgearticles_vector_index', // Make sure this matches your actual index name
              path: 'embedding',
              queryVector: embedding,
              numCandidates: 100,
              limit: 5,
              filter: {
                status: 'published'
              }
            }
          },
          {
            $project: {
              _id: 1,
              title: 1,
              content: 1,
              slug: 1,
              score: { $meta: 'vectorSearchScore' }
            }
          }
        ];
        
        const articles = await KnowledgeArticle.aggregate(pipeline);
        
        // If we got results from vector search, return them
        if (articles && articles.length > 0) {
          console.log(`Found ${articles.length} relevant articles using vector search`);
          return articles;
        } else {
          // If no results from vector search, try text search
          console.log('No results from vector search, trying text search');
          return await this.fallbackTextSearch(originalQuery);
        }
      } catch (error) {
        console.error('Vector search error:', error);
        // If vector search fails, try text search
        return await this.fallbackTextSearch(originalQuery);
      }
    } catch (error) {
      console.error('Error in findRelevantArticles:', error);
      return [];
    }
  },
  
  /**
   * Fallback to basic text search if vector search fails
   * Important: This uses the original query string, not the embedding
   */
  async fallbackTextSearch(originalQuery) {
    try {
      // Make sure originalQuery is a string
      if (typeof originalQuery !== 'string') {
        console.error('originalQuery is not a string:', typeof originalQuery);
        return [];
      }
      
      console.log(`Performing text search with query: "${originalQuery}"`);
      
      // Basic text search as fallback using the original text query
      const articles = await KnowledgeArticle.find(
        { 
          status: 'published',
          $text: { $search: originalQuery } 
        },
        { 
          score: { $meta: 'textScore' },
          title: 1,
          content: 1,
          slug: 1,
          _id: 1
        }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(5);
      
      console.log(`Found ${articles.length} articles using text search`);
      return articles;
    } catch (error) {
      console.error('Text search error:', error);
      // If everything fails, make a simple query to at least return some articles
      try {
        const lastResortArticles = await KnowledgeArticle.find({ status: 'published' })
          .select('_id title content slug')
          .sort({ viewCount: -1 })
          .limit(3);
        console.log(`Returning ${lastResortArticles.length} popular articles as last resort`);
        return lastResortArticles;
      } catch (lastError) {
        console.error('Last resort query failed:', lastError);
        return [];
      }
    }
  },
  
  /**
   * Generate a response from OpenAI using retrieved context
   */
  async generateAIResponse(userMessage, relevantArticles, conversationId) {
    try {
      if (!relevantArticles || relevantArticles.length === 0) {
        return "I'm sorry, I couldn't find any relevant information to answer your question. Please try rephrasing your question or contact support for further assistance.";
      }
      
      // Prepare context from relevant articles
      let context = '';
      
      // Include metadata and content from relevant articles
      relevantArticles.forEach((article, index) => {
        // Limit the amount of text from each article to avoid exceeding token limits
        const truncatedContent = article.content.length > 1500 
          ? article.content.substring(0, 1500) + '...' 
          : article.content;
        
        context += `ARTICLE ${index + 1}: "${article.title}"
  ${truncatedContent}
  
  `;
      });
      
      // Import OpenAI from lib
      const openai = (await import('@/lib/openai')).default;
      
      // Create the prompt with user question and context
      const systemPrompt = `You are a helpful support assistant for Lightning Hire, an AI-powered resume evaluation system. 
  Answer the user's question based on the context provided. 
  If the answer is not in the context, say that you don't have that information and suggest contacting support.
  
  Format your answer in Markdown for readability:
  - Use headings with ## and ### for organization
  - Use bullet points or numbered lists where appropriate
  - Use **bold** for emphasis
  - When referencing articles, DO NOT create your own links. The system will automatically add source links.
  
  Keep your answers concise and helpful. If referencing a specific article, mention it by name only.`;
      
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Or whichever model you're using
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `CONTEXT:
  ${context}
  
  QUESTION: ${userMessage}` }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
      
      // Extract and return the assistant's message
      const aiResponse = response.choices[0].message.content;
      
      // Always add a formatted section at the end with article links
      let articleLinks = '\n\n---\n**Sources:**\n';
      relevantArticles.slice(0, 3).forEach((article) => {
        articleLinks += `- [${article.title}](/articles/${article.slug})\n`;
      });
      
      return aiResponse + articleLinks;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "I'm sorry, I encountered an error while generating a response. Please try again later.";
    }
  },
  /**
   * Generate a title for a new conversation based on the first message
   */
  generateConversationTitle(message) {
    // Truncate message to create a title
    const titleMaxLength = 50;
    let title = message.slice(0, titleMaxLength);
    
    if (message.length > titleMaxLength) {
      title += '...';
    }
    
    return title;
  }
};

export default chatService;