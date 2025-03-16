// src/app/(admin)/admin/articles/[id]/delete/page.js
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

export default function DeleteArticlePage({ params }) {
  const { id } = params;
  const router = useRouter();
  
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Error fetching article');
        }
        
        setArticle(data.article);
      } catch (err) {
        setError(err.message || 'Error fetching article');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArticle();
  }, [id]);
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error deleting article');
      }
      
      // Redirect to articles list
      router.push('/admin/articles');
    } catch (err) {
      setError(err.message || 'Error deleting article');
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
          onClick={() => router.push('/admin/articles')}
        >
          Back to Articles
        </Button>
      </AdminDashboardWrapper>
    );
  }
  
  return (
    <AdminDashboardWrapper>
      <Typography variant="h4" component="h1" gutterBottom>
        Delete Article
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Are you sure you want to delete this article?
        </Typography>
        
        <Typography variant="body1" paragraph>
          <strong>Title:</strong> {article.title}
        </Typography>
        
        {article.shortDescription && (
          <Typography variant="body1" paragraph>
            <strong>Description:</strong> {article.shortDescription}
          </Typography>
        )}
        
        <Typography variant="body2" color="error" paragraph>
          This action cannot be undone. All data associated with this article will be permanently deleted.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/admin/articles')}
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