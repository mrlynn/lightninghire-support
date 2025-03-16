'use client';

import { Box, Container, Grid, Typography, Link as MuiLink, Divider } from '@mui/material';
import Link from 'next/link';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Lightning Hire Support
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We're here to help you get the most out of your AI-powered resume evaluation system.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Box>
              <MuiLink component={Link} href="/" color="inherit" display="block" sx={{ mb: 1 }}>
                Home
              </MuiLink>
              <MuiLink component={Link} href="/articles" color="inherit" display="block" sx={{ mb: 1 }}>
                Knowledge Base
              </MuiLink>
              <MuiLink component={Link} href="/contact" color="inherit" display="block" sx={{ mb: 1 }}>
                Contact Support
              </MuiLink>
              <MuiLink href="https://lightninghire.com" target="_blank" rel="noopener" color="inherit" display="block">
                Back to Main Site
              </MuiLink>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Box>
              <MuiLink component={Link} href="/categories/getting-started" color="inherit" display="block" sx={{ mb: 1 }}>
                Getting Started Guides
              </MuiLink>
              <MuiLink component={Link} href="/categories/tutorials" color="inherit" display="block" sx={{ mb: 1 }}>
                Tutorials
              </MuiLink>
              <MuiLink component={Link} href="/categories/faq" color="inherit" display="block" sx={{ mb: 1 }}>
                FAQ
              </MuiLink>
              <MuiLink component={Link} href="/categories/troubleshooting" color="inherit" display="block">
                Troubleshooting
              </MuiLink>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Lightning Hire. All rights reserved.
          </Typography>
          <Box>
            <MuiLink component={Link} href="/privacy-policy" color="inherit" sx={{ mr: 2 }}>
              Privacy Policy
            </MuiLink>
            <MuiLink component={Link} href="/terms-of-service" color="inherit">
              Terms of Service
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}