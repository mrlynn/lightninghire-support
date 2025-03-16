// src/app/(admin)/admin/categories/[id]/delete/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Alert, 
  CircularProgress 
} from '@mui/material';
import { 
  DeleteForever as DeleteIcon, 
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import AdminDashboardWrapper from '@/components/admin/AdminDashboardWrapper';

export default function DeleteCategoryPage({ params }) {
  const { id } = params;
  const router = useRouter();
  
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Error fetching category');
        }
        
        setCategory(data.category);
      } catch (err) {
        setError(err.message || 'Error fetching category');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategory();
  }, [id]);
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error deleting category');
      }
      
      // Redirect to categories list
      router.push('/admin/categories');
    } catch (err) {
      setError(err.message || 'Error deleting category');
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return (
      <AdminDashboardWrapper>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </AdminDashboardWrapper>
    );
  }
  
  if (error) {
    return (
      <AdminDashboardWrapper>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/admin/categories')}
        >
          Back to Categories
        </Button>
      </AdminDashboardWrapper>
    );
  }
  
  return (
    <AdminDashboardWrapper>
      <Typography variant="h4" component="h1" gutterBottom>
        Delete Category
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Are you sure you want to delete this category?
        </Typography>
        
        <Typography variant="body1" paragraph>
          <strong>Name:</strong> {category.name}
        </Typography>
        
        {category.description && (
          <Typography variant="body1" paragraph>
            <strong>Description:</strong> {category.description}
          </Typography>
        )}
        
        <Typography variant="body2" color="error" paragraph>
          This action cannot be undone. All articles in this category will be left without a category.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/admin/categories')}
          >
            Cancel
          </Button>
          
          <Button
            variant="contained"
            color="error"
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </Box>
      </Paper>
    </AdminDashboardWrapper>
  );
}