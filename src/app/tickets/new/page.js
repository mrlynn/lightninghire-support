'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserActivity } from '@/context/UserActivityContext';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';

export default function NewTicketPage() {
  const { data: session, status } = useSession();
  const { trackTicketCreation } = useUserActivity();
  const router = useRouter();
  
  // Redirect if user is not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/tickets/new');
    }
  }, [status, router]);
  
  // Form state - removed requestor and email as they're handled automatically now
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    category: ''
  });
  
  // Form metadata
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [validation, setValidation] = useState({
    title: { error: false, message: '' },
    description: { error: false, message: '' },
    category: { error: false, message: '' }
  });
  
  // Fetch data when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      
      // Ensure that categories is always an array
      if (Array.isArray(data)) {
        setCategories(data);
      } else if (data && typeof data === 'object' && data.categories && Array.isArray(data.categories)) {
        // If the API returns an object with a categories array property
        setCategories(data.categories);
      } else {
        console.error('Invalid categories data format:', data);
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation errors when user types
    if (validation[name]) {
      setValidation(prev => ({
        ...prev,
        [name]: { error: false, message: '' }
      }));
    }
  };
  
  // Validate the form
  const validateForm = () => {
    let valid = true;
    const newValidation = { ...validation };
    
    // Check required fields
    if (!formData.title.trim()) {
      newValidation.title = { error: true, message: 'Title is required' };
      valid = false;
    }
    
    if (!formData.description.trim()) {
      newValidation.description = { error: true, message: 'Description is required' };
      valid = false;
    }
    
    if (!formData.category) {
      newValidation.category = { error: true, message: 'Category is required' };
      valid = false;
    }
    
    setValidation(newValidation);
    return valid;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Return early if user is not authenticated
    if (status !== 'authenticated') {
      setError('You must be logged in to submit a ticket');
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit ticket');
      }
      
      // Get the created ticket data
      const ticketData = await response.json();
      
      // Track the ticket creation in user activity
      if (ticketData.ticket && ticketData.ticket._id) {
        await trackTicketCreation(ticketData.ticket._id, formData.title);
      }
      
      // Show success message
      setSuccess(true);
      
      // Clear the form
      setFormData({
        title: '',
        description: '',
        status: 'open',
        priority: 'medium',
        category: ''
      });
      
      // Auto-redirect after a delay
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err) {
      setError(err.message);
      console.error('Error submitting ticket:', err);
      window.scrollTo(0, 0); // Scroll to top to show error
    } finally {
      setSubmitting(false);
    }
  };
  
  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <PageLayout>
        <Container maxWidth="md">
          <Box sx={{ py: 5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Loading...
            </Typography>
          </Box>
        </Container>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <Container maxWidth="md">
        <Box sx={{ py: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Button
              component={Link}
              href="/"
              startIcon={<ArrowBackIcon />}
              sx={{ mr: 2 }}
            >
              Back to Home
            </Button>
            <Typography variant="h4" component="h1">
              Submit a Support Ticket
            </Typography>
          </Box>
          
          {success ? (
            <Card sx={{ backgroundColor: 'success.light', color: 'success.contrastText', mb: 4 }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Ticket Submitted Successfully!
                </Typography>
                <Typography variant="body1">
                  Thank you for your submission. Our support team will review your ticket and respond as soon as possible.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  component={Link}
                  href="/"
                >
                  Return to Home
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              {/* Display a message showing the user is logged in */}
              {session?.user && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  You are submitting this ticket as {session.user.name} ({session.user.email})
                </Alert>
              )}
              
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Ticket Details
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="title"
                      name="title"
                      label="Ticket Title"
                      value={formData.title}
                      onChange={handleChange}
                      error={validation.title.error}
                      helperText={validation.title.error && validation.title.message}
                      disabled={submitting}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth required error={validation.category.error}>
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        label="Category"
                        disabled={submitting}
                      >
                        {Array.isArray(categories) && categories.length > 0 ? (
                          categories.map(category => (
                            <MenuItem key={category._id} value={category._id}>
                              {category.name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled value="">
                            No categories available
                          </MenuItem>
                        )}
                      </Select>
                      {validation.category.error && (
                        <FormHelperText>{validation.category.message}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="description"
                      name="description"
                      label="Description"
                      multiline
                      rows={6}
                      value={formData.description}
                      onChange={handleChange}
                      error={validation.description.error}
                      helperText={validation.description.error && validation.description.message}
                      disabled={submitting}
                    />
                  </Grid>
                </Grid>
              </Paper>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  component={Link}
                  href="/"
                  disabled={submitting}
                  startIcon={<ArrowBackIcon />}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={24} /> : <SaveIcon />}
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </PageLayout>
  );
} 