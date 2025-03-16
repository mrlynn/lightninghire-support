// src/components/admin/ChatHistoryTable.js
'use client';

import { useState } from 'react';
import { 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Typography,
  Tooltip
} from '@mui/material';
import { 
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ChatHistoryTable({ 
  conversations, 
  totalConversations, 
  initialPage = 0, 
  initialLimit = 10 
}) {
  const router = useRouter();
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialLimit);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    
    // Update URL with new page parameter
    const url = new URL(window.location.href);
    url.searchParams.set('page', newPage + 1);
    router.push(url.toString());
  };
  
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page
    
    // Update URL with new limit and reset page
    const url = new URL(window.location.href);
    url.searchParams.set('limit', newRowsPerPage);
    url.searchParams.set('page', 1);
    router.push(url.toString());
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Conversation</TableCell>
              <TableCell>Session ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Started At</TableCell>
              <TableCell>Last Message</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {conversations.map((conversation) => (
              <TableRow key={conversation._id.toString()}>
                <TableCell>
                  <Typography variant="subtitle2" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ChatIcon fontSize="small" color="primary" />
                    {conversation.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {conversation.sessionId.substring(0, 8)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={conversation.status} 
                    color={conversation.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {formatDate(conversation.createdAt)}
                </TableCell>
                <TableCell>
                  {formatDate(conversation.lastMessageAt)}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Conversation">
                    <IconButton 
                      component={Link}
                      href={`/admin/chats/${conversation._id.toString()}`}
                      color="primary"
                      size="small"
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Conversation">
                    <IconButton 
                      component={Link}
                      href={`/admin/chats/${conversation._id.toString()}/delete`}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            
            {conversations.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No conversations found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalConversations}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}