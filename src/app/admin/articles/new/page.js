// src/app/admin/articles/new/page.js
import { connectToDatabase } from '@/lib/mongoose';
import ArticleCategory from '@/models/ArticleCategory';
import AdminDashboardWrapper from '@/components/admin/AdminDashboardWrapper';
import { Typography, Box } from '@mui/material';
import ArticleForm from '@/components/admin/ArticleForm';
import { serializeDocuments } from '@/lib/utils';
import KnowledgeArticle from '@/models/KnowledgeArticle';

export const metadata = {
  title: 'Create New Article - LightningHire Support',
  description: 'Create a new knowledge base article',
};

export default async function NewArticlePage() {
  await connectToDatabase();
  
  // Get all categories
  const categoriesData = await ArticleCategory.find({ isActive: true })
    .sort({ name: 1 })
    .lean();
  
  // Get all existing tags for autocomplete
  const tagsData = await KnowledgeArticle.distinct('tags');
  const allTags = tagsData.filter(tag => tag && tag.trim() !== '');
  
  // Serialize MongoDB documents
  const categories = serializeDocuments(categoriesData);
  
  return (
    <AdminDashboardWrapper>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Article
        </Typography>
      </Box>
      
      <ArticleForm 
        categories={categories} 
        allTags={allTags}
      />
    </AdminDashboardWrapper>
  );
}