'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import Link from 'next/link';

export default function TicketForm({ ticketId, isEdit = false }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    category: '',
    assignee: '',
    requestor: ''
  });
  
  // Form metadata
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [validation, setValidation] = useState({
    title: { error: false, message: '' },
    description: { error: false, message: '' },
    category: { error: false, message: '' }
  });
  
  // Fetch data when component mounts
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    if (status === 'authenticated') {
      fetchCategories();
      fetchUsers();
      
      // If we're editing an existing ticket, fetch its data
      if (isEdit && ticketId) {
        fetchTicket();
      } else {
        // If creating a new ticket, set the current user as requestor
        setFormData(prev => ({
          ...prev,
          requestor: session.user.id
        }));
      }
    }
  }, [status, isEdit, ticketId]);
  
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };
  
  // Fetch users for assignment
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };
  
  // Fetch ticket if editing
  const fetchTicket = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ticket');
      }
      
      const ticket = await response.json();
      
      // Format the data for the form
      setFormData({
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        assignee: ticket.assignee?._id || '',
        requestor: ticket.requestor?._id || session.user.id
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching ticket:', err);
    } finally {
      setLoading(false);
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
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Prepare request based on whether we're creating or editing
      const url = isEdit ? `/api/tickets/${ticketId}` : '/api/tickets';
      const method = isEdit ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save ticket');
      }
      
      const data = await response.json();
      
      // Redirect to the ticket details page
      router.push(`/admin/tickets/${data._id}`);
    } catch (err) {
      setError(err.message);
      console.error('Error saving ticket:', err);
      window.scrollTo(0, 0); // Scroll to top to show error
    } finally {
      setSubmitting(false);
    }
  };
  
  // Loading state
  if (status === 'loading' || (isEdit && loading)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {isEdit ? 'Edit Ticket' : 'Create New Ticket'}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={validation.title.error}
              helperText={validation.title.message}
              disabled={submitting}
            />
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
              rows={5}
              error={validation.description.error}
              helperText={validation.description.message}
              disabled={submitting}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth required error={validation.category.error}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Category"
                disabled={submitting}
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
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                label="Priority"
                disabled={submitting}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {isEdit && (
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                  disabled={submitting}
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="waiting_for_customer">Waiting for Customer</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Assign To</InputLabel>
              <Select
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                label="Assign To"
                disabled={submitting}
              >
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Hidden requestor field, already set in useEffect */}
          <input type="hidden" name="requestor" value={formData.requestor} />
        </Grid>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          component={Link}
          href={isEdit ? `/admin/tickets/${ticketId}` : '/admin/tickets'}
          variant="outlined"
          startIcon={<CancelIcon />}
          disabled={submitting}
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={submitting}
        >
          {submitting ? 'Saving...' : (isEdit ? 'Update Ticket' : 'Create Ticket')}
        </Button>
      </Box>
    </Box>
  );
} 