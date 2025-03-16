'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Box, Button, TextField, Typography, Paper, Divider, Alert, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Check password strength when password field changes
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  // Simple password strength checker
  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = '';
    
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    switch (score) {
      case 0:
      case 1:
        message = 'Very weak';
        break;
      case 2:
        message = 'Weak';
        break;
      case 3:
        message = 'Medium';
        break;
      case 4:
        message = 'Strong';
        break;
      case 5:
        message = 'Very strong';
        break;
      default:
        message = '';
    }
    
    setPasswordStrength({ score, message });
  };

  // Get color for password strength indicator
  const getPasswordStrengthColor = () => {
    const { score } = passwordStrength;
    if (score <= 1) return 'error.main';
    if (score <= 3) return 'warning.main';
    return 'success.main';
  };

  // Handle registration form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    if (passwordStrength.score < 3) {
      setError('Please use a stronger password');
      setIsLoading(false);
      return;
    }
    
    try {
      // Call the registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // If registration is successful, sign in the user
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Redirect to dashboard or onboarding
      router.push('/');
      
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Handle OAuth registration/login
  const handleOAuthSignIn = (provider) => {
    setIsLoading(true);
    signIn(provider, { callbackUrl: '/' });
  };

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
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 450,
          width: '100%',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Lightning Hire Support
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Create an Account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleRegister} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
            InputProps={{
              startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            InputProps={{
              startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              startAdornment: <LockIcon color="action" sx={{ mr: 1 }} />,
            }}
            helperText={formData.password && `Password strength: ${passwordStrength.message}`}
            FormHelperTextProps={{
              sx: { color: getPasswordStrengthColor() }
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            InputProps={{
              startAdornment: <LockIcon color="action" sx={{ mr: 1 }} />,
            }}
            error={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
            helperText={
              formData.confirmPassword !== '' && 
              formData.password !== formData.confirmPassword && 
              'Passwords do not match'
            }
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Register'}
          </Button>
        </Box>

        <Divider sx={{ width: '100%', my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
          >
            Sign up with Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LinkedInIcon />}
            onClick={() => handleOAuthSignIn('linkedin')}
            disabled={isLoading}
            sx={{ backgroundColor: '#0077B5', color: 'white', '&:hover': { backgroundColor: '#006699' } }}
          >
            Sign up with LinkedIn
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link href="/login" style={{ textDecoration: 'none', color: 'primary.main' }}>
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
} 