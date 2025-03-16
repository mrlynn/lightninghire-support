// src/components/admin/ArticlesTable.js
'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import Link from 'next/link';

// Define status colors
const statusColors = {
  published: 'success',
  draft: 'warning',
  archived: 'error'
};

export default function ArticlesTable({ 
  articles, 
  totalArticles, 
  initialPage = 0, 
  initialLimit = 10 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialLimit);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  const handleMenuOpen = (event, article) => {
    setAnchorEl(event.currentTarget);
    setSelectedArticle(article);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedArticle(null);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    
    // Update URL to reflect pagination
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage + 1);
    router.push(`${pathname}?${params.toString()}`);
  };
  
  const handleChangeRowsPerPage = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setRowsPerPage(newLimit);
    setPage(0); // Reset to first page
    
    // Update URL to reflect pagination changes
    const params = new URLSearchParams(searchParams);
    params.set('limit', newLimit);
    params.set('page', 1);
    router.push(`${pathname}?${params.toString()}`);
  };
  
  const handleViewArticle = (slug) => {
    window.open(`/articles/${slug}`, '_blank');
    handleMenuClose();
  };
  
  const handleEditArticle = (articleId) => {
    router.push(`/admin/articles/edit/${articleId}`);
    handleMenuClose();
  };
  
  const handleDeleteArticle = async (articleId) => {
    if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/articles/${articleId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete article');
        }
        
        // Refresh the page to show updated list
        router.refresh();
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Error deleting article: ' + error.message);
      }
    }
    
    handleMenuClose();
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Published</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.length > 0 ? (
              articles.map((article) => (
                <TableRow key={article._id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {article.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {article.slug}
                    </Typography>
                  </TableCell>
                  <TableCell>{article.category?.name || 'Uncategorized'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={article.status.toUpperCase()} 
                      color={statusColors[article.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(article.createdAt)}</TableCell>
                  <TableCell>{formatDate(article.publishedDate)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, article)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No articles found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={totalArticles}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
      
      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedArticle && selectedArticle.status === 'published' && (
          <MenuItem onClick={() => handleViewArticle(selectedArticle.slug)}>
            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
            View
          </MenuItem>
        )}
        <MenuItem onClick={() => handleEditArticle(selectedArticle?._id)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDeleteArticle(selectedArticle?._id)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}