// src/app/admin/chats/[id]/delete/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react'; // Add React import for React.use()
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

export default function DeleteChatPage({ params }) {
  // Use React.use() to unwrap the params Promise
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  
  const router = useRouter();
  
  const [conversation, setConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch conversation data
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await fetch(`/api/chat/conversations/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Error fetching conversation');
        }
        
        setConversation(data.conversation);
      } catch (err) {
        setError(err.message || 'Error fetching conversation');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversation();
  }, [id]);
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/chat/conversations/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error deleting conversation');
      }
      
      // Redirect to chat list
      router.push('/admin/chats');
    } catch (err) {
      setError(err.message || 'Error deleting conversation');
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
          onClick={() => router.push('/admin/chats')}
        >
          Back to Chat History
        </Button>
      </AdminDashboardWrapper>
    );
  }
  
  return (
    <AdminDashboardWrapper>
      <Typography variant="h4" component="h1" gutterBottom>
        Delete Conversation
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Are you sure you want to delete this conversation?
        </Typography>
        
        <Typography variant="body1" paragraph>
          <strong>Title:</strong> {conversation.title}
        </Typography>
        
        <Typography variant="body1" paragraph>
          <strong>Date:</strong> {new Date(conversation.createdAt).toLocaleString()}
        </Typography>
        
        <Typography variant="body2" color="error" paragraph>
          This action cannot be undone. All messages in this conversation will be permanently deleted.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/admin/chats')}
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