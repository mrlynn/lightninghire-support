'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Box, TextField, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useSearchTracking } from '@/hooks/useSearchTracking';

export default function SearchBar({ placeholder = 'Search for help articles...', initialQuery = '', fullWidth = false }) {
  const [query, setQuery] = useState(initialQuery || '');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const trackSearch = useSearchTracking();

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Track the search query (resultsCount will be updated after results load)
      await trackSearch(query, 0);
      
      // Redirect to search results page
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [query, router, trackSearch]);

  // Clear search input
  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      sx={{ 
        display: 'flex',
        width: fullWidth ? '100%' : { xs: '100%', sm: '400px', md: '500px' },
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isLoading ? (
                <CircularProgress size={20} />
              ) : query ? (
                <IconButton
                  aria-label="clear search"
                  onClick={clearSearch}
                  edge="end"
                  size="small"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              ) : null}
            </InputAdornment>
          ),
          sx: { 
            borderRadius: '50px',
            bgcolor: 'background.paper',
            '&.MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'divider',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            }
          }
        }}
        size="small"
      />
    </Box>
  );
} 