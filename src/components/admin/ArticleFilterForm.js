// src/components/admin/ArticleFilterForm.js
'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Box, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Paper,
  Grid
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

export default function ArticleFilterForm({ 
  initialSearch = '', 
  initialStatus = 'all', 
  initialCategoryId = '',
  categories = [],
  statusOptions = []
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status !== 'all') params.set('status', status);
    if (categoryId) params.set('category', categoryId);
    params.set('page', '1'); // Reset to first page on filter change
    
    router.push(`${pathname}?${params.toString()}`);
  };
  
  const handleReset = () => {
    setSearch('');
    setStatus('all');
    setCategoryId('');
    
    router.push(pathname);
  };
  
  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Search Articles"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title or description"
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryId}
              label="Category"
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map(category => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              type="submit"
              variant="contained" 
              fullWidth
            >
              Filter
            </Button>
            <Button 
              type="button" 
              variant="outlined" 
              fullWidth
              onClick={handleReset}
              startIcon={<ClearIcon />}
            >
              Reset
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}