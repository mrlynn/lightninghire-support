'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  SupportAgent as SupportAgentIcon,
  LiveHelp as LiveHelpIcon,
  Email as EmailIcon,
  ContactSupport as ContactSupportIcon
} from '@mui/icons-material';
import PageLayout from '@/components/layout/PageLayout';

export default function SupportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });
  
  // Form metadata
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [validation, setValidation] = useState({
    title: { error: false, message: '' },
    description: { error: false, message: '' },
    category: { error: false, message: '' }
  });
  
  // Fetch categories when component mounts
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
      // Extract the categories array from the response
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
        console.error('Invalid categories data structure:', data);
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
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Check if user is logged in
      if (!session) {
        throw new Error('You must be logged in to submit a support ticket');
      }
      
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          requestor: session.user.id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit ticket');
      }
      
      // Reset form on success
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium'
      });
      
      setSuccess(true);
      window.scrollTo(0, 0); // Scroll to top to show success message
    } catch (err) {
      setError(err.message);
      console.error('Error submitting ticket:', err);
      window.scrollTo(0, 0); // Scroll to top to show error
    } finally {
      setLoading(false);
    }
  };
  
  const faqItems = [
    {
      question: 'How long does it typically take to get a response?',
      answer: 'We aim to respond to all support tickets within 24 hours. For urgent matters, responses may be faster. Complex issues might require additional time for investigation.'
    },
    {
      question: 'Can I track the status of my support ticket?',
      answer: 'Yes, once you submit a ticket, you\'ll receive an email confirmation with a ticket ID. You can use this ID to check the status of your ticket by logging into your account and visiting the "My Tickets" section.'
    },
    {
      question: 'What information should I include in my support request?',
      answer: 'To help us resolve your issue quickly, please include: a clear description of the problem, any error messages you received, steps to reproduce the issue, and any screenshots that might help illustrate the problem.'
    },
    {
      question: 'How do I update my existing ticket with new information?',
      answer: 'If you need to add information to an existing ticket, you can log into your account, navigate to "My Tickets," find your ticket, and add a comment with the new information.'
    },
    {
      question: 'What are your support hours?',
      answer: 'Our support team is available Monday through Friday, 9:00 AM to 6:00 PM Eastern Time. While we monitor for critical issues 24/7, routine tickets submitted outside these hours will be addressed on the next business day.'
    }
  ];
  
  return (
    <PageLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 6 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            align="center" 
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Support Center
          </Typography>
          
          <Typography 
            variant="h5" 
            component="h2" 
            align="center" 
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            We're here to help with any questions or issues
          </Typography>
          
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <LiveHelpIcon color="primary" sx={{ fontSize: 50 }} />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Knowledge Base
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Find answers to common questions in our comprehensive knowledge base.
                  </Typography>
                  <Button
                    variant="outlined"
                    href="/articles"
                  >
                    Browse Articles
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <SupportAgentIcon color="primary" sx={{ fontSize: 50 }} />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Live Chat
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Chat with our support agents for immediate assistance with simple questions.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => {/* TODO: Implement chat functionality */}}
                  >
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'primary.light' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <ContactSupportIcon sx={{ fontSize: 50, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                    Submit a Ticket
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: 'white' }}>
                    Need more help? Submit a support ticket and we'll get back to you soon.
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    href="#submit-ticket"
                  >
                    Submit Ticket
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Frequently Asked Questions
            </Typography>
            
            {faqItems.map((item, index) => (
              <Accordion key={index} sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {item.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1">
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
          
          <Box id="submit-ticket" sx={{ scrollMarginTop: '100px' }}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h4" component="h2" gutterBottom>
                Submit a Support Ticket
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Please fill out the form below with details about your issue. Our support team will respond as soon as possible.
              </Typography>
              
              {success && (
                <Alert severity="success" sx={{ mb: 4 }}>
                  Your support ticket has been submitted successfully! We'll get back to you as soon as possible.
                </Alert>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                  {error}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Subject"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      error={validation.title.error}
                      helperText={validation.title.message}
                      disabled={loading}
                      placeholder="Brief description of your issue"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={validation.category.error}>
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        label="Category"
                        disabled={loading}
                      >
                        <MenuItem value="">
                          <em>Select a category</em>
                        </MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category._id} value={category.name}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {validation.category.error && (
                        <FormHelperText>{validation.category.message}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        label="Priority"
                        disabled={loading}
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="urgent">Urgent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      multiline
                      rows={8}
                      error={validation.description.error}
                      helperText={validation.description.message}
                      disabled={loading}
                      placeholder="Please provide as much detail as possible, including steps to reproduce the issue, error messages, etc."
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                    disabled={loading}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    {loading ? 'Submitting...' : 'Submit Ticket'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
          
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Need immediate assistance?
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Contact us directly via email or phone
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
              <Button
                startIcon={<EmailIcon />}
                href="mailto:support@lightninghire.com"
              >
                support@lightninghire.com
              </Button>
              <Button
                startIcon={<SupportAgentIcon />}
                href="tel:+18001234567"
              >
                1-800-123-4567
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </PageLayout>
  );
} 