// src/app/search/page.js
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Container, 
  Typography, 
  Box, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Paper,
  Alert,
  CircularProgress,
  Pagination
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import CategoryIcon from '@mui/icons-material/Category';
import SearchBar from '@/components/search/SearchBar';
import Link from 'next/link';
import { useSearchTracking } from '@/hooks/useSearchTracking';

const ITEMS_PER_PAGE = 10;

// Loading component for Suspense fallback
function SearchPageLoading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Search Results
        </Typography>
      </Box>
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    </Container>
  );
}

// Component that uses useSearchParams
function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const trackSearch = useSearchTracking();

  // Function to fetch search results
  const fetchSearchResults = useCallback(async () => {
    if (!query) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Make API call to search endpoint
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}&limit=${ITEMS_PER_PAGE}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      
      const data = await response.json();
      
      // Update results
      setResults(data.results || []);
      setTotalPages(Math.ceil((data.total || 0) / ITEMS_PER_PAGE));
      
      // Track the search with the result count
      await trackSearch(query, data.total || 0);
      
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, page, trackSearch]);
  
  // Fetch results when query or page changes
  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults, query, page]);
  
  // Handle pagination change
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Search Results
        </Typography>
        <SearchBar initialQuery={query} fullWidth />
      </Box>
      
      {query && (
        <Typography variant="subtitle1" gutterBottom>
          {isLoading 
            ? 'Searching...' 
            : `${results.length ? `Results for "${query}"` : `No results found for "${query}"`}`}
        </Typography>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      {isLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : results.length > 0 ? (
        <>
          <List sx={{ mb: 3 }}>
            {results.map((result, index) => (
              <Paper 
                key={index}
                elevation={1}
                sx={{ 
                  mb: 2, 
                  p: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
              >
                <ListItem 
                  component={Link}
                  href={`/${result.type === 'article' ? 'articles' : 'categories'}/${result.slug}`}
                  sx={{ 
                    p: 0, 
                    color: 'inherit', 
                    textDecoration: 'none',
                    display: 'block'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {result.type === 'article' ? (
                        <ArticleIcon color="primary" />
                      ) : (
                        <CategoryIcon color="secondary" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="h6" component="h2">
                          {result.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {result.excerpt || result.description}
                          </Typography>
                          <Box mt={1}>
                            {result.tags?.map((tag, idx) => (
                              <Typography 
                                key={idx} 
                                component="span" 
                                variant="caption"
                                sx={{
                                  bgcolor: 'action.hover',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  mr: 1
                                }}
                              >
                                {tag}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                  </Box>
                </ListItem>
              </Paper>
            ))}
          </List>
          
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      ) : query ? (
        <Box my={4} textAlign="center">
          <Typography variant="body1" paragraph>
            No results found for your search.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try different keywords or browse our categories.
          </Typography>
        </Box>
      ) : (
        <Box my={4} textAlign="center">
          <Typography variant="body1">
            Enter a search term to find help articles.
          </Typography>
        </Box>
      )}
    </Container>
  );
}

// Main page component with Suspense boundary
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchPageContent />
    </Suspense>
  );
}