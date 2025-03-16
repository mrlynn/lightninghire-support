// src/app/(admin)/admin/articles/[id]/edit/page.js
import { connectToDatabase } from '@/lib/mongoose';
import ArticleCategory from '@/models/ArticleCategory';
import KnowledgeArticle from '@/models/KnowledgeArticle';
import AdminDashboardWrapper from '@/components/admin/AdminDashboardWrapper';
import ArticleForm from '@/components/admin/ArticleForm';
import { Typography } from '@mui/material';
import { notFound } from 'next/navigation';

export default async function EditArticlePage({ params }) {
  const { id } = params;
  
  await connectToDatabase();
  
  // Get the article
  const article = await KnowledgeArticle.findById(id).lean();
  
  if (!article) {
    notFound();
  }
  
  // Get categories for the form
  const categories = await ArticleCategory.find({ isActive: true })
    .sort({ name: 1 })
    .lean();
  
  // Get all tags for autocomplete
  const articles = await KnowledgeArticle.find()
    .select('tags')
    .lean();
    
  const allTags = [...new Set(articles.flatMap(article => article.tags || []))];
  
  return (
    <AdminDashboardWrapper>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Article: {article.title}
      </Typography>
      
      <ArticleForm 
        article={article} 
        categories={categories} 
        allTags={allTags}
      />
    </AdminDashboardWrapper>
  );
}