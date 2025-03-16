// src/app/(admin)/admin/categories/[id]/edit/page.js
import { connectToDatabase } from '@/lib/mongoose';
import ArticleCategory from '@/models/ArticleCategory';
import AdminDashboardWrapper from '@/components/admin/AdminDashboardWrapper';
import CategoryForm from '@/components/admin/CategoryForm';
import { Typography } from '@mui/material';
import { notFound } from 'next/navigation';

export default async function EditCategoryPage({ params }) {
  const { id } = params;
  
  await connectToDatabase();
  
  // Get the category
  const category = await ArticleCategory.findById(id).lean();
  
  if (!category) {
    notFound();
  }
  
  return (
    <AdminDashboardWrapper>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Category: {category.name}
      </Typography>
      
      <CategoryForm category={category} />
    </AdminDashboardWrapper>
  );
}