// src/components/ThemeProvider.js
'use client';

import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create Lightning Hire theme matching the main application
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF7900', // Orange from main app
      light: '#FF9100',
      dark: '#E05600',
    },
    secondary: {
      main: '#7B2CBF', // Purple from main app
      light: '#9D4EDD',
      dark: '#5A189A',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#240046', // Deep purple for text
      secondary: '#5A189A', // Medium purple for secondary text
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1)',
          backgroundColor: '#ffffff',
          color: '#240046',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 3px 6px -1px rgba(0,0,0,0.1), 0px 1px 4px -1px rgba(0,0,0,0.06)',
        },
      },
    },
  },
});

export default function ThemeProvider({ children }) {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}