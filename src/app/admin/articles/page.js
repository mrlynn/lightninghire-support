// src/app/admin/articles/page.js
import { connectToDatabase } from '@/lib/mongoose';
import KnowledgeArticle from '@/models/KnowledgeArticle';
import ArticleCategory from '@/models/ArticleCategory';
import AdminDashboardWrapper from '@/components/admin/AdminDashboardWrapper';
import ArticlesTable from '@/components/admin/ArticlesTable'; 
import ArticleFilterForm from '@/components/admin/ArticleFilterForm';
import { 
  Typography, 
  Box,
  Button
} from '@mui/material';
import { 
  Add as AddIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { serializeDocuments } from '@/lib/utils';

export default async function AdminArticlesPage({ searchParams }) {
  // Get query parameters for filtering and pagination
  const page = Number(searchParams?.page || 1);
  const limit = Number(searchParams?.limit || 10);
  const search = searchParams?.search || '';
  const status = searchParams?.status || 'all';
  const categoryId = searchParams?.category || '';
  
  await connectToDatabase();
  
  // Build query
  const query = {};
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status !== 'all') {
    query.status = status;
  }
  
  if (categoryId) {
    query.category = categoryId;
  }
  
  // Get articles with pagination
  const skip = (page - 1) * limit;
  
  const articlesData = await KnowledgeArticle.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('category', 'name')
    .lean();
  
  // Get total count for pagination
  const total = await KnowledgeArticle.countDocuments(query);
  
  // Get categories for filter
  const categoriesData = await ArticleCategory.find({ isActive: true })
    .sort({ name: 1 })
    .lean();
  
  // Serialize the MongoDB documents to avoid errors
  const articles = serializeDocuments(articlesData);
  const categories = serializeDocuments(categoriesData);
  
  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' }
  ];
  
  return (
    <AdminDashboardWrapper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Knowledge Articles
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          component={Link}
          href="/admin/articles/new"
        >
          Create Article
        </Button>
      </Box>
      
      {/* Use client component for filters */}
      <ArticleFilterForm
        initialSearch={search}
        initialStatus={status}
        initialCategoryId={categoryId}
        categories={categories}
        statusOptions={statusOptions}
      />
      
      {/* Use client component for the table */}
      <ArticlesTable 
        articles={articles} 
        totalArticles={total}
        initialPage={page - 1} 
        initialLimit={limit}
      />
    </AdminDashboardWrapper>
  );
}