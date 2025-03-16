// src/services/articleService.js
import { connectToDatabase } from '@/lib/mongoose';
import KnowledgeArticle from '@/models/KnowledgeArticle';
import { OpenAIEmbeddings } from '@/lib/openai';

export const articleService = {
  /**
   * Get all published articles
   */
  async getAllPublishedArticles(options = {}) {
    await connectToDatabase();
    
    const { 
      page = 1, 
      limit = 10, 
      category = null,
      tag = null,
      sort = { publishedDate: -1 } 
    } = options;
    
    const query = { status: 'published' };
    
    if (category) {
      query.category = category;
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    const skip = (page - 1) * limit;
    
    const articles = await KnowledgeArticle.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('title shortDescription slug category tags publishedDate viewCount')
      .populate('category', 'name slug');
      
    const total = await KnowledgeArticle.countDocuments(query);
    
    return {
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },
  
  /**
   * Get article by slug
   */
  async getArticleBySlug(slug) {
    await connectToDatabase();
    
    const article = await KnowledgeArticle.findOne({ 
      slug, 
      status: 'published' 
    })
    .populate('category', 'name slug')
    .populate('relatedArticles', 'title slug shortDescription');
    
    if (!article) {
      return null;
    }
    
    // Increment view count
    await KnowledgeArticle.findByIdAndUpdate(
      article._id,
      { $inc: { viewCount: 1 } }
    );
    
    return article;
  },
  
  /**
   * Create a new article
   */
  async createArticle(articleData, userId) {
    await connectToDatabase();
    
    // Add the author
    articleData.author = userId;
    
    // Create the article
    const article = await KnowledgeArticle.create(articleData);
    
    // Generate and save embedding if content is available
    if (article.content && article.status === 'published') {
      await this.generateArticleEmbedding(article._id);
    }
    
    return article;
  },
  
  /**
   * Update an article
   */
  async updateArticle(id, articleData) {
    await connectToDatabase();
    
    // Update the article
    const article = await KnowledgeArticle.findByIdAndUpdate(
      id,
      articleData,
      { new: true }
    );
    
    if (!article) {
      return null;
    }
    
    // Update embedding if content changed and article is published
    if (articleData.content && article.status === 'published') {
      await this.generateArticleEmbedding(article._id);
    }
    
    return article;
  },
  
  /**
   * Generate embedding for an article
   */
  async generateArticleEmbedding(articleId) {
    await connectToDatabase();
    
    const article = await KnowledgeArticle.findById(articleId);
    
    if (!article) {
      throw new Error(`Article with ID ${articleId} not found`);
    }
    
    // Create content for embedding
    const content = `${article.title}\n${article.shortDescription}\n${article.content}`;
    
    try {
      // Generate embedding
      const embedding = await OpenAIEmbeddings.createEmbedding(content);
      
      // Save embedding
      article.embedding = embedding;
      await article.save();
      
      return article;
    } catch (error) {
      console.error(`Error generating embedding for article ${articleId}:`, error);
      throw error;
    }
  },
  
  /**
   * Regenerate embeddings for all published articles
   */
  async regenerateAllEmbeddings() {
    await connectToDatabase();
    
    const articles = await KnowledgeArticle.find({ 
      status: 'published'
    });
    
    console.log(`Regenerating embeddings for ${articles.length} articles`);
    
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    for (const article of articles) {
      try {
        await this.generateArticleEmbedding(article._id);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          articleId: article._id,
          title: article.title,
          error: error.message
        });
      }
    }
    
    return results;
  },
  
  /**
   * Find similar articles
   */
  async findSimilarArticles(articleId, limit = 3) {
    await connectToDatabase();
    
    const article = await KnowledgeArticle.findById(articleId);
    
    if (!article || !article.embedding) {
      return [];
    }
    
    // Using the correct vectorSearch syntax
    try {
      const pipeline = [
        {
          $vectorSearch: {
            index: 'knowledgearticles_vector_index', // Make sure this matches your actual index name
            path: 'embedding',
            queryVector: article.embedding,
            numCandidates: 100,
            limit: limit + 1, // Get one extra to filter out the current article
            filter: {
              status: 'published'
            }
          }
        },
        {
          $match: {
            _id: { $ne: article._id } // Filter out the current article
          }
        },
        {
          $limit: limit
        },
        {
          $project: {
            _id: 1,
            title: 1,
            slug: 1,
            shortDescription: 1,
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ];
      
      const similarArticles = await KnowledgeArticle.aggregate(pipeline);
      return similarArticles;
    } catch (error) {
      console.error('Error finding similar articles:', error);
      
      // Fallback to basic query
      try {
        const fallbackArticles = await KnowledgeArticle.find(
          { 
            _id: { $ne: article._id },
            status: 'published',
            category: article.category
          }
        )
          .limit(limit);
          
        return fallbackArticles;
      } catch (fallbackError) {
        console.error('Fallback query failed:', fallbackError);
        return [];
      }
    }
  },
  
  /**
   * Rate an article (helpful/unhelpful)
   */
  async rateArticle(articleId, isHelpful) {
    await connectToDatabase();
    
    const updateField = isHelpful ? 'helpfulCount' : 'unhelpfulCount';
    
    const article = await KnowledgeArticle.findByIdAndUpdate(
      articleId,
      { $inc: { [updateField]: 1 } },
      { new: true }
    );
    
    return article;
  }
};

export default articleService;