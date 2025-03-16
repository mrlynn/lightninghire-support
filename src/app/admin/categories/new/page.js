// src/app/(admin)/admin/categories/new/page.js
import AdminDashboardWrapper from '@/components/admin/AdminDashboardWrapper';
import CategoryForm from '@/components/admin/CategoryForm';
import { Typography } from '@mui/material';

export default function NewCategoryPage() {
  return (
    <AdminDashboardWrapper>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Category
      </Typography>
      
      <CategoryForm />
    </AdminDashboardWrapper>
  );
}