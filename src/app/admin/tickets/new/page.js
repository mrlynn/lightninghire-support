'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import AdminDashboardWrapper from '@/components/admin/AdminDashboardWrapper';
import TicketForm from '@/components/admin/TicketForm';
import Link from 'next/link';

export default function NewTicketPage() {
  return (
    <AdminDashboardWrapper>
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Button
              component={Link}
              href="/admin/tickets"
              startIcon={<ArrowBackIcon />}
            >
              Back to Tickets
            </Button>
            <Typography variant="h4" component="h1" sx={{ ml: 2 }}>
              Create New Ticket
            </Typography>
          </Box>
          
          <TicketForm isEdit={false} />
        </Box>
      </Container>
    </AdminDashboardWrapper>
  );
} 