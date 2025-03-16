// src/lib/openai.js
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: './.env.local' });

if (!process.env.OPENAI_API_KEY) {
  console.warn('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const OpenAIEmbeddings = {
  /**
   * Create an embedding for the given text
   * @param {string} text - The text to create an embedding for
   * @returns {Promise<number[]>} The embedding vector
   */
  async createEmbedding(text) {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text.replace(/\n/g, " "),
        encoding_format: "float"
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error creating embedding:', error);
      throw error;
    }
  }
};

export default openai;