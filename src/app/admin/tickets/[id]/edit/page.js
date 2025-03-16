'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import AdminDashboardWrapper from '@/components/admin/AdminDashboardWrapper';
import TicketForm from '@/components/admin/TicketForm';
import Link from 'next/link';

export default function EditTicketPage({ params }) {
  const ticketId = params.id;
  
  return (
    <AdminDashboardWrapper>
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Button
              component={Link}
              href={`/admin/tickets/${ticketId}`}
              startIcon={<ArrowBackIcon />}
            >
              Back to Ticket
            </Button>
            <Typography variant="h4" component="h1" sx={{ ml: 2 }}>
              Edit Ticket
            </Typography>
          </Box>
          
          <TicketForm isEdit={true} ticketId={ticketId} />
        </Box>
      </Container>
    </AdminDashboardWrapper>
  );
} 