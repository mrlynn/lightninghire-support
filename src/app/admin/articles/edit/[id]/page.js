// src/app/admin/articles/edit/[id]/page.js
import { connectToDatabase } from '@/lib/mongoose';
import KnowledgeArticle from '@/models/KnowledgeArticle';
import ArticleCategory from '@/models/ArticleCategory';
import AdminDashboardWrapper from '@/components/admin/AdminDashboardWrapper';
import { Typography, Box, Alert } from '@mui/material';
import ArticleForm from '@/components/admin/ArticleForm';
import { serializeDocument, serializeDocuments } from '@/lib/utils';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Article - Lightning Hire Support',
  description: 'Edit knowledge base article',
};

export default async function EditArticlePage({ params }) {
  const { id } = params;
  
  await connectToDatabase();
  
  // Get article
  const article = await KnowledgeArticle.findById(id).lean();
  
  if (!article) {
    notFound();
  }
  
  // Get all categories
  const categoriesData = await ArticleCategory.find({ isActive: true })
    .sort({ name: 1 })
    .lean();
  
  // Get all existing tags from articles for suggestions
  const tagsData = await KnowledgeArticle.distinct('tags');
  const allTags = tagsData.filter(tag => tag && tag.trim() !== '');
  
  // Ensure proper serialization of MongoDB documents
  const serializedArticle = serializeDocument(article);
  const categories = serializeDocuments(categoriesData);
  
  return (
    <AdminDashboardWrapper>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Article
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Last updated: {new Date(article.updatedAt).toLocaleString()}
        </Typography>
        
        {article.status === 'published' && article.publishedDate && (
          <Alert severity="info" sx={{ mt: 2 }}>
            This article was published on {new Date(article.publishedDate).toLocaleDateString()}.
            Any changes you make will be immediately visible to users.
          </Alert>
        )}
      </Box>
      
      <ArticleForm 
        categories={categories} 
        initialData={serializedArticle}
        allTags={allTags}
      />
    </AdminDashboardWrapper>
  );
}