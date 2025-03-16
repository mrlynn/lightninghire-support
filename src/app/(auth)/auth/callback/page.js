'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [message, setMessage] = useState('Processing your authentication...');

  useEffect(() => {
    // Only proceed when session is loaded
    if (status === 'loading') return;

    const processAuthentication = async () => {
      try {
        // If not authenticated, redirect to login
        if (status !== 'authenticated') {
          setMessage('Authentication failed. Redirecting to login...');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        // Get callbackUrl from query parameters or default to dashboard
        const callbackUrl = searchParams.get('callbackUrl') || '/';

        // Check if user needs to complete onboarding
        // This is a placeholder - you would typically check a field in the user's profile
        const needsOnboarding = false; // Replace with actual check

        if (needsOnboarding) {
          setMessage('Redirecting to onboarding...');
          router.push('/onboarding');
        } else {
          setMessage('Authentication successful! Redirecting...');
          router.push(callbackUrl);
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        setMessage('An error occurred. Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    processAuthentication();
  }, [status, router, searchParams, session]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 2,
        backgroundColor: '#f5f5f5',
      }}
    >
      <CircularProgress size={60} sx={{ mb: 4 }} />
      <Typography variant="h5" component="h1" gutterBottom>
        {message}
      </Typography>
    </Box>
  );
} 