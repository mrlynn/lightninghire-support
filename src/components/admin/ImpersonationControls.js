'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

export default function ImpersonationControls() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is an admin
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'support_agent';
  
  // Check if currently impersonating
  const isImpersonating = session?.isImpersonating;

  // Handle dialog open/close
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setUserId('');
    setError('');
  };

  // Start impersonation
  const startImpersonation = async () => {
    if (!userId) {
      setError('Please enter a user ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to impersonate user');
      }

      // Sign out current session and sign in as impersonated user
      await signOut({ redirect: false });
      
      // Redirect to the impersonation callback URL
      window.location.href = data.callbackUrl;
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  // End impersonation
  const endImpersonation = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/end-impersonation', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to end impersonation');
      }

      // Sign out impersonated session and sign back in as admin
      await signOut({ redirect: false });
      
      // Redirect to the callback URL
      window.location.href = data.callbackUrl;
    } catch (error) {
      console.error('Error ending impersonation:', error);
      setIsLoading(false);
    }
  };

  // If not admin or not impersonating, don't render anything
  if (!isAdmin && !isImpersonating) return null;

  return (
    <>
      {/* Impersonation Controls */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {isImpersonating ? (
          <Button
            variant="contained"
            color="warning"
            startIcon={<ExitToAppIcon />}
            onClick={endImpersonation}
            disabled={isLoading}
          >
            End Impersonation
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonIcon />}
            onClick={handleOpen}
            disabled={isLoading}
          >
            Impersonate User
          </Button>
        )}
      </Box>

      {/* Impersonation Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Impersonate User</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter the ID of the user you want to impersonate. This will allow you to view the system as this user.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            id="userId"
            label="User ID"
            type="text"
            fullWidth
            variant="outlined"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={startImpersonation} 
            variant="contained" 
            disabled={isLoading}
          >
            Impersonate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 