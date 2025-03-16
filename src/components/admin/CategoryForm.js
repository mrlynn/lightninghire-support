// src/components/admin/CategoryForm.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

export default function CategoryForm({ category }) {
  const router = useRouter();
  const isEditMode = Boolean(category?._id);
  
  // Form state
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [description, setDescription] = useState(category?.description || '');
  const [order, setOrder] = useState(category?.order || 0);
  const [isActive, setIsActive] = useState(category?.isActive !== false);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Generate slug from name
  useEffect(() => {
    if (!isEditMode || !slug) {
      setSlug(name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
      );
    }
  }, [name, isEditMode, slug]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const categoryData = {
        name,
        slug,
        description,
        order: parseInt(order),
        isActive
      };
      
      const url = isEditMode 
        ? `/api/categories/${category._id}` 
        : `/api/categories`;
        
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error saving category');
      }
      
      setSuccess(`Category successfully ${isEditMode ? 'updated' : 'created'}!`);
      
      // Redirect after successful save
      setTimeout(() => {
        router.push('/admin/categories');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Error saving the category');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
      {/* Success/Error messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/admin/categories')}
        >
          Back to Categories
        </Button>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          fullWidth
          required
          sx={{ mb: 3 }}
          helperText="This will be used in the URL"
        />
        
        <TextField
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Display Order"
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
          helperText="Lower numbers appear first"
        />
        
        <FormControlLabel
          control={
            <Switch 
              checked={isActive} 
              onChange={(e) => setIsActive(e.target.checked)}
            />
          }
          label="Active"
        />
      </Paper>
      
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          disabled={isSubmitting || !name}
        >
          {isSubmitting ? 'Saving...' : 'Save Category'}
        </Button>
      </Box>
    </Box>
  );
}