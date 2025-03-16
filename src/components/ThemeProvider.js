// src/components/ThemeProvider.js
'use client';

import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create Lightning Hire theme matching the docs site
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF7900', // Orange from docs site
      light: '#FF9100',
      dark: '#E05600',
    },
    secondary: {
      main: '#1A1A1A', // Black from docs site
      light: '#333333',
      dark: '#000000',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A', // Dark for text
      secondary: '#555555', // Medium gray for secondary text
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
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
          backgroundColor: '#FFFFFF',
          color: '#1A1A1A',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: '#FF7900',
          '&:hover': {
            backgroundColor: '#E05600',
          },
        },
        containedSecondary: {
          backgroundColor: '#7B2CBF',
          '&:hover': {
            backgroundColor: '#5A189A',
          },
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