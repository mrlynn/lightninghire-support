'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  Stack,
  Menu,
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
  ListItemAvatar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  AssignmentInd as AssignmentIndIcon,
  Block as BlockIcon,
  Check as CheckIcon,
  Timer as TimerIcon,
  Download as DownloadIcon,
  Attachment as AttachmentIcon,
  Add as AddIcon
} from '@mui/icons-material';
import AdminDashboardWrapper from '@/components/admin/AdminDashboardWrapper';
import Link from 'next/link';

// Helper functions
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Status chip component with appropriate colors
const StatusChip = ({ status }) => {
  const statusColors = {
    open: 'info',
    in_progress: 'warning',
    waiting_for_customer: 'secondary',
    resolved: 'success',
    closed: 'default'
  };

  const statusLabels = {
    open: 'Open',
    in_progress: 'In Progress',
    waiting_for_customer: 'Waiting for Customer',
    resolved: 'Resolved',
    closed: 'Closed'
  };

  return (
    <Chip 
      label={statusLabels[status] || status} 
      color={statusColors[status] || 'default'} 
      size="small" 
    />
  );
};

// Priority chip component with appropriate colors
const PriorityChip = ({ priority }) => {
  const priorityColors = {
    low: 'success',
    medium: 'info',
    high: 'warning',
    urgent: 'error'
  };

  return (
    <Chip 
      label={priority.charAt(0).toUpperCase() + priority.slice(1)} 
      color={priorityColors[priority] || 'default'} 
      size="small" 
      variant="outlined"
    />
  );
};

export default function TicketDetailsPage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const ticketId = params.id;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isInternal, setIsInternal] = useState(false);
  
  // Fetch ticket data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated') {
      fetchTicket();
      fetchUsers();
    }
  }, [status, ticketId]);
  
  // Fetch ticket details
  const fetchTicket = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ticket: ${response.statusText}`);
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
  
  // Fetch users for assignment dropdown
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsersData(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };
  
  // Update ticket status
  const updateTicketStatus = async (newStatus) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update ticket status');
      }
      
      // Refresh ticket data
      fetchTicket();
      
      handleCloseMenu();
    } catch (err) {
      console.error('Error updating ticket status:', err);
      alert('Failed to update ticket status: ' + err.message);
    }
  };
  
  // Update ticket assignment
  const assignTicket = async (userId) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assignee: userId,
          status: userId ? 'in_progress' : 'open' // Auto-update status when assigning
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign ticket');
      }
      
      // Refresh ticket data
      fetchTicket();
      
      handleCloseMenu();
    } catch (err) {
      console.error('Error assigning ticket:', err);
      alert('Failed to assign ticket: ' + err.message);
    }
  };
  
  // Handle menu open/close
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  // Delete the ticket
  const handleDeleteTicket = async () => {
    if (!confirm('Are you sure you want to delete this ticket?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete ticket');
      }
      
      router.push('/admin/tickets');
    } catch (err) {
      console.error('Error deleting ticket:', err);
      alert('Failed to delete ticket: ' + err.message);
    }
  };
  
  // Add a comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      return;
    }
    
    setCommentLoading(true);
    setCommentError(null);
    
    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: comment,
          isInternal
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      // Clear the comment field
      setComment('');
      setIsInternal(false);
      
      // Refresh ticket data to show the new comment
      fetchTicket();
    } catch (err) {
      setCommentError(err.message);
      console.error('Error adding comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };
  
  // If loading and not authenticated yet
  if (status === 'loading' || loading) {
    return (
      <AdminDashboardWrapper>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </AdminDashboardWrapper>
    );
  }
  
  // If error fetching ticket
  if (error) {
    return (
      <AdminDashboardWrapper>
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Button
              component={Link}
              href="/admin/tickets"
              startIcon={<ArrowBackIcon />}
              sx={{ mb: 3 }}
            >
              Back to Tickets
            </Button>
            
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          </Box>
        </Container>
      </AdminDashboardWrapper>
    );
  }
  
  if (!ticket) {
    return (
      <AdminDashboardWrapper>
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Button
              component={Link}
              href="/admin/tickets"
              startIcon={<ArrowBackIcon />}
              sx={{ mb: 3 }}
            >
              Back to Tickets
            </Button>
            
            <Typography variant="h5" component="h1" align="center" sx={{ mt: 6 }}>
              Ticket not found
            </Typography>
          </Box>
        </Container>
      </AdminDashboardWrapper>
    );
  }
  
  return (
    <AdminDashboardWrapper>
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          {/* Header with navigation & actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Button
              component={Link}
              href="/admin/tickets"
              startIcon={<ArrowBackIcon />}
            >
              Back to Tickets
            </Button>
            
            <Box>
              <Button
                component={Link}
                href={`/admin/tickets/${ticketId}/edit`}
                startIcon={<EditIcon />}
                variant="outlined"
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              
              <Button
                onClick={handleMenuClick}
                variant="contained"
                endIcon={<MoreVertIcon />}
              >
                Actions
              </Button>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
              >
                <MenuItem onClick={() => updateTicketStatus('in_progress')}>
                  <ListItemIcon>
                    <TimerIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Mark In Progress</ListItemText>
                </MenuItem>
                
                <MenuItem onClick={() => updateTicketStatus('waiting_for_customer')}>
                  <ListItemIcon>
                    <TimerIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Waiting for Customer</ListItemText>
                </MenuItem>
                
                <MenuItem onClick={() => updateTicketStatus('resolved')}>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Mark Resolved</ListItemText>
                </MenuItem>
                
                <MenuItem onClick={() => updateTicketStatus('closed')}>
                  <ListItemIcon>
                    <BlockIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Close Ticket</ListItemText>
                </MenuItem>
                
                <Divider />
                
                <MenuItem>
                  <ListItemIcon>
                    <AssignmentIndIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Assign to</ListItemText>
                </MenuItem>
                
                {usersData.map(user => (
                  <MenuItem 
                    key={user._id} 
                    onClick={() => assignTicket(user._id)}
                    sx={{ pl: 4 }}
                  >
                    {user.name}
                    {ticket.assignee && ticket.assignee._id === user._id && (
                      <CheckIcon fontSize="small" sx={{ ml: 1, color: 'success.main' }} />
                    )}
                  </MenuItem>
                ))}
                
                <MenuItem onClick={() => assignTicket(null)} sx={{ pl: 4 }}>
                  Unassign
                </MenuItem>
                
                <Divider />
                
                <MenuItem onClick={handleDeleteTicket} sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Delete Ticket</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
          
          {/* Ticket header */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 'medium' }}>
                {ticket.title}
              </Typography>
              
              <Box>
                <StatusChip status={ticket.status} />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Chip 
                label={`ID: ${ticket._id.substring(ticket._id.length - 6).toUpperCase()}`} 
                variant="outlined" 
              />
              <PriorityChip priority={ticket.priority} />
              <Chip 
                label={`Category: ${ticket.category}`} 
                variant="outlined" 
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
              {ticket.description}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', mt: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Created by: {ticket.requestor?.name || 'Unknown'} 
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created: {formatDate(ticket.createdAt)}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Assigned to: {ticket.assignee?.name || 'Unassigned'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last updated: {formatDate(ticket.updatedAt)}
                </Typography>
              </Box>
            </Box>
          </Paper>
          
          {/* Attachments section */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Attachments
              </Typography>
              
              <Grid container spacing={2}>
                {ticket.attachments.map((attachment, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachmentIcon sx={{ mr: 1 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" noWrap>
                            {attachment.fileName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {Math.round(attachment.fileSize / 1024)} KB
                          </Typography>
                        </Box>
                        <IconButton 
                          component="a" 
                          href={attachment.fileUrl} 
                          target="_blank" 
                          size="small"
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                >
                  Add Attachment
                  <input
                    type="file"
                    hidden
                    // TODO: Implement file upload handler
                  />
                </Button>
              </Box>
            </Paper>
          )}
          
          {/* Comments section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Comments
            </Typography>
            
            {ticket.comments && ticket.comments.length > 0 ? (
              <List>
                {ticket.comments.map((comment, index) => (
                  <ListItem 
                    key={index}
                    alignItems="flex-start"
                    sx={{ 
                      mb: 2, 
                      backgroundColor: comment.isInternal ? 'rgba(255, 244, 229, 0.3)' : 'transparent',
                      borderRadius: 1,
                      border: comment.isInternal ? '1px dashed rgba(255, 167, 38, 0.4)' : 'none'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        {comment.createdBy?.name?.charAt(0) || '?'}
                      </Avatar>
                    </ListItemAvatar>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle2">
                          {comment.createdBy?.name || 'Unknown User'}
                          {comment.isInternal && (
                            <Chip 
                              label="Internal Note" 
                              size="small" 
                              color="warning" 
                              variant="outlined" 
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(comment.createdAt)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {comment.content}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No comments yet
              </Typography>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            {/* Add comment form */}
            <form onSubmit={handleAddComment}>
              <TextField
                label="Add a comment"
                multiline
                rows={3}
                fullWidth
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                margin="normal"
                disabled={commentLoading}
                error={Boolean(commentError)}
                helperText={commentError}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      label="Internal Note"
                      color={isInternal ? "warning" : "default"}
                      variant={isInternal ? "filled" : "outlined"}
                      onClick={() => setIsInternal(!isInternal)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Box>
                </FormControl>
                
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<SendIcon />}
                  disabled={!comment.trim() || commentLoading}
                >
                  {commentLoading ? 'Sending...' : 'Add Comment'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>
      </Container>
    </AdminDashboardWrapper>
  );
} 