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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Pagination,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
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

export default function TicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    // Fetch tickets when component mounts or page changes
    if (status === 'authenticated') {
      fetchTickets();
    }
  }, [status, page]);
  
  const fetchTickets = async () => {
    setLoading(true);
    try {
      // Build query string 
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        requestor: session.user.id
      });
      
      const response = await fetch(`/api/tickets?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      const data = await response.json();
      setTickets(data.tickets);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle loading state
  if (status === 'loading') {
    return (
      <PageLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1">
              My Support Tickets
            </Typography>
            <Button
              component={Link}
              href="/tickets/new"
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
            >
              New Ticket
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : tickets.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                You haven't submitted any tickets yet
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Create a new ticket to get help from our support team.
              </Typography>
              <Button
                component={Link}
                href="/tickets/new"
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
              >
                Submit Your First Ticket
              </Button>
            </Paper>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket._id} hover>
                        <TableCell component="th" scope="row">
                          {ticket._id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{ticket.title}</TableCell>
                        <TableCell>
                          <Chip 
                            label={ticket.status} 
                            color={statusColors[ticket.status] || 'default'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={ticket.priority} 
                            color={priorityColors[ticket.priority] || 'default'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>{ticket.category?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            component={Link}
                            href={`/tickets/${ticket._id}`}
                            size="small"
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handleChangePage}
                  color="primary"
                />
              </Box>
            </>
          )}
        </Box>
      </Container>
    </PageLayout>
  );
} 