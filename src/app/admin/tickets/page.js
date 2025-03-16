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
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import AdminDashboardWrapper from '@/components/admin/AdminDashboardWrapper';
import Link from 'next/link';

// Utility function to format dates
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
    waiting_for_customer: 'Waiting',
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

export default function TicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    assignee: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    // Fetch tickets when component mounts or filters change
    if (status === 'authenticated') {
      fetchTickets();
      fetchCategories();
    }
  }, [status, page, rowsPerPage, filters]);
  
  const fetchTickets = async () => {
    setLoading(true);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams({
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage
      });
      
      // Add any active filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
      
      const response = await fetch(`/api/tickets?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      const data = await response.json();
      setTickets(data.tickets);
      setTotalCount(data.pagination.totalCount);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };
  
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
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset to first page when filters change
    setPage(0);
  };
  
  const handleClearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: '',
      assignee: '',
      search: ''
    });
    setPage(0);
  };
  
  const handleDeleteTicket = async (ticketId) => {
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
      
      // Refresh the ticket list
      fetchTickets();
    } catch (err) {
      console.error('Error deleting ticket:', err);
      alert('Failed to delete ticket: ' + err.message);
    }
  };
  
  // If loading and not authenticated yet
  if (status === 'loading') {
    return (
      <AdminDashboardWrapper>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </AdminDashboardWrapper>
    );
  }
  
  return (
    <AdminDashboardWrapper>
      <Container maxWidth={false}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Support Tickets
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              component={Link}
              href="/admin/tickets/new"
            >
              New Ticket
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Box>
          
          {/* Filters */}
          {showFilters && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      label="Status"
                      value={filters.status}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="open">Open</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="waiting_for_customer">Waiting for Customer</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Priority</InputLabel>
                    <Select
                      name="priority"
                      label="Priority"
                      value={filters.priority}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      label="Category"
                      value={filters.category}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat._id} value={cat.name}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    InputProps={{
                      startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    placeholder="Search tickets..."
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={handleClearFilters}
                    startIcon={<ClearIcon />}
                    fullWidth
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}
          
          {/* Error message if any */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {/* Tickets table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={30} />
                      </TableCell>
                    </TableRow>
                  ) : tickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                        No tickets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    tickets.map((ticket) => (
                      <TableRow key={ticket._id} hover>
                        <TableCell>
                          {ticket._id.substring(ticket._id.length - 6).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/tickets/${ticket._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                              {ticket.title}
                            </Typography>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <StatusChip status={ticket.status} />
                        </TableCell>
                        <TableCell>
                          <PriorityChip priority={ticket.priority} />
                        </TableCell>
                        <TableCell>{ticket.category}</TableCell>
                        <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                        <TableCell>{formatDate(ticket.updatedAt)}</TableCell>
                        <TableCell align="right">
                          <IconButton 
                            component={Link} 
                            href={`/admin/tickets/${ticket._id}`}
                            size="small"
                            title="View"
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            component={Link} 
                            href={`/admin/tickets/${ticket._id}/edit`}
                            size="small"
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDeleteTicket(ticket._id)}
                            size="small"
                            title="Delete"
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </Paper>
        </Box>
      </Container>
    </AdminDashboardWrapper>
  );
} 