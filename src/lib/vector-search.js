// src/lib/vector-search.js
import { connectToDatabase } from '@/lib/mongoose';
import KnowledgeArticle from '@/models/KnowledgeArticle';
import { OpenAIEmbeddings } from '@/lib/openai';

/**
 * MongoDB Vector Search Utilities
 * This file contains helper functions for vector search operations
 */

/**
 * Create a vector search index for knowledge articles
 * 
 * This function is intended to be run from a script, not during normal operation
 */
export async function createVectorSearchIndex() {
  try {
    await connectToDatabase();
    
    // Get the MongoDB database instance
    const { connection } = await connectToDatabase();
    const db = connection.db;
    
    console.log('Creating vector search index for knowledge articles...');
    
    // Create the vector search index
    const result = await db.command({
      createIndexes: 'knowledgearticles', // collection name (lowercase as used by MongoDB)
      indexes: [
        {
          name: 'knowledgearticles_vector_index',
          type: 'vectorSearch',
          definition: {
              fields: [{
                type: "vector",
                numDimensions: 1536,
                path: "embedding",
                similarity: "cosine",
              }]
          }
        }
      ]
    });
    
    console.log('Vector search index created:', result);
    return result;
  } catch (error) {
    console.error('Error creating vector search index:', error);
    throw error;
  }
}

/**
 * Search for articles using vector similarity
 */
export async function searchArticlesByVector(query, options = {}) {
  try {
    await connectToDatabase();
    
    const { limit = 5, minScore = 0.7, onlyPublished = true } = options;
    
    // Generate embedding for the query
    const embedding = await OpenAIEmbeddings.createEmbedding(query);
    
    // Perform vector search
    const articles = await KnowledgeArticle.aggregate([
      {
        $vectorSearch: {
          queryVector: embedding,
          path: 'embedding',
          numCandidates: limit * 10, // Retrieve more candidates for better results
          limit: limit,
          index: 'knowledgearticles_vector_index',
          filter: { status: { $eq: 'published' } }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          shortDescription: 1,
          content: 1,
          category: 1,
          tags: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ]);
    
    // Filter out low-scoring results
    return articles.filter(article => article.score >= minScore);
  } catch (error) {
    console.error('Error searching articles by vector:', error);
    throw error;
  }
}

/**
 * Hybrid search combining vector search and text search
 */
export async function hybridSearchArticles(query, options = {}) {
  try {
    await connectToDatabase();
    
    const { 
      limit = 10, 
      vectorWeight = 0.7,
      textWeight = 0.3,
      onlyPublished = true,
      category = null
    } = options;
    
    // Build match query
    const matchQuery = { status: 'published' };
    
    if (category) {
      matchQuery.category = category;
    }
    
    // Generate embedding for vector search
    const embedding = await OpenAIEmbeddings.createEmbedding(query);
    
    // Perform hybrid search
    const articles = await KnowledgeArticle.aggregate([
      {
        $match: matchQuery
      },
      {
        $vectorSearch: {
          queryVector: embedding,
          path: 'embedding',
          numCandidates: limit * 10,
          limit: limit * 2, // Get more results to combine with text search
          index: 'knowledgearticles_vector_index',
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          shortDescription: 1,
          content: 1,
          category: 1,
          tags: 1,
          publishedDate: 1,
          viewCount: 1,
          vectorScore: { $meta: 'vectorSearchScore' }
        }
      },
      // Add text search score
      {
        $match: {
          $text: { $search: query }
        }
      },
      {
        $addFields: {
          textScore: { $meta: 'textScore' },
          // Normalize scores between 0 and 1
          normalizedVectorScore: { $divide: ['$vectorScore', 1] },
          normalizedTextScore: { $divide: [{ $meta: 'textScore' }, 1.5] }
        }
      },
      // Calculate combined score
      {
        $addFields: {
          combinedScore: {
            $add: [
              { $multiply: ['$normalizedVectorScore', vectorWeight] },
              { $multiply: ['$normalizedTextScore', textWeight] }
            ]
          }
        }
      },
      // Sort by combined score
      {
        $sort: { combinedScore: -1 }
      },
      // Limit results
      {
        $limit: limit
      }
    ]);
    
    return articles;
  } catch (error) {
    console.error('Error in hybrid search:', error);
    throw error;
  }
}

/**
 * Create or update MongoDB vector search index
 */
export async function setupVectorSearch() {
    try {
      await connectToDatabase();
      const db = mongoose.connection.db;
      
      // Check if the vector index already exists
      const indexes = await db.collection('knowledgearticles').indexes();
      const hasVectorIndex = indexes.some(index => index.name === 'article_embeddings');
      
      if (hasVectorIndex) {
        console.log('Vector search index already exists');
        return { success: true, message: 'Vector search index already exists' };
      }
      
      // Create the vector search index
      const result = await db.collection('knowledgearticles').createIndex(
        { embedding: "vector" },
        {
          name: "article_embeddings",
          vectorSearchDefinition: {
            dimension: 1536, // Dimensions for OpenAI embeddings
            similarity: "cosine"
          }
        }
      );
      
      console.log('Vector search index created:', result);
      return { success: true, message: 'Vector search index created successfully' };
    } catch (error) {
      console.error('Error creating vector search index:', error);
      return { success: false, message: error.message };
    }
  }
  /**
 * Find similar documents using vector search
 */
export async function findSimilarDocuments(embedding, limit = 5) {
    try {
      await connectToDatabase();
      const db = mongoose.connection.db;
      
      const pipeline = [
        {
          $vectorSearch: {
            index: 'article_embeddings',
            path: 'embedding',
            queryVector: embedding,
            numCandidates: 100,
            limit: limit
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
      
      const results = await db.collection('knowledgearticles').aggregate(pipeline).toArray();
      return results;
    } catch (error) {
      console.error('Error finding similar documents:', error);
      throw error;
    }
  }
export default {
    setupVectorSearch,
    findSimilarDocuments,
    createVectorSearchIndex,
    searchArticlesByVector,
    hybridSearchArticles
}
