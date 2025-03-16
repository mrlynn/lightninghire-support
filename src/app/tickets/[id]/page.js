'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Chip,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Stack,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon
} from '@mui/icons-material';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';

const statusColors = {
  open: 'info',
  'in-progress': 'warning',
  resolved: 'success',
  closed: 'default',
};

const priorityColors = {
  low: 'success',
  medium: 'info',
  high: 'warning',
  urgent: 'error',
};

export default function TicketDetailPage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    // Fetch ticket when component mounts
    if (status === 'authenticated') {
      fetchTicket();
    }
  }, [status, params.id]);
  
  const fetchTicket = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tickets/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ticket');
      }
      
      const data = await response.json();
      setTicket(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching ticket:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };
  
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      return;
    }
    
    setCommentLoading(true);
    try {
      const response = await fetch(`/api/tickets/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: comment })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      // Clear comment field and refresh ticket data
      setComment('');
      fetchTicket();
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment: ' + err.message);
    } finally {
      setCommentLoading(false);
    }
  };
  
  // Handle loading state
  if (status === 'loading' || loading) {
    return (
      <PageLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <PageLayout>
        <Container maxWidth="lg">
          <Box sx={{ py: 5 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Button
              component={Link}
              href="/tickets"
              startIcon={<ArrowBackIcon />}
            >
              Back to Tickets
            </Button>
          </Box>
        </Container>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Button
              component={Link}
              href="/tickets"
              startIcon={<ArrowBackIcon />}
              sx={{ mr: 2 }}
            >
              Back to Tickets
            </Button>
            <Typography variant="h4" component="h1" noWrap sx={{ flex: 1 }}>
              Ticket: {ticket?.title}
            </Typography>
            <Chip 
              label={ticket?.status} 
              color={statusColors[ticket?.status] || 'default'} 
              sx={{ ml: 2 }}
            />
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {/* Ticket description */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {ticket?.description}
                  </Typography>
                </Box>
              </Paper>
              
              {/* Comments */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Comments
                </Typography>
                
                {ticket?.comments && ticket.comments.length > 0 ? (
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    {ticket.comments.map((comment) => (
                      <Card key={comment._id} variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', mb: 1 }}>
                            <Avatar 
                              sx={{ width: 32, height: 32, mr: 1 }}
                              src={comment.createdBy?.image}
                            >
                              {comment.createdBy?.name?.charAt(0) || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">
                                {comment.createdBy?.name || 'User'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(comment.createdAt).toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {comment.content}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    No comments yet.
                  </Typography>
                )}
                
                {/* Comment form */}
                <Box component="form" onSubmit={handleSubmitComment} noValidate>
                  <TextField
                    fullWidth
                    label="Add a comment"
                    multiline
                    rows={3}
                    value={comment}
                    onChange={handleCommentChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={commentLoading || !comment.trim()}
                      startIcon={commentLoading ? <CircularProgress size={24} /> : <SendIcon />}
                    >
                      {commentLoading ? 'Sending...' : 'Add Comment'}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              {/* Ticket info */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Ticket Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip 
                      label={ticket?.status} 
                      color={statusColors[ticket?.status] || 'default'} 
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Priority
                    </Typography>
                    <Chip 
                      label={ticket?.priority} 
                      color={priorityColors[ticket?.priority] || 'default'} 
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body2">
                      {ticket?.category?.name || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created By
                    </Typography>
                    <Typography variant="body2">
                      {ticket?.requestor?.name || 'You'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created On
                    </Typography>
                    <Typography variant="body2">
                      {ticket && new Date(ticket.createdAt).toLocaleString()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {ticket && new Date(ticket.updatedAt).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </PageLayout>
  );
} 