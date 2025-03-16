'use client';

import { Box, Container, Grid, Typography, Link as MuiLink, Divider } from '@mui/material';
import Link from 'next/link';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 5,
        px: 2,
        mt: 'auto',
        backgroundColor: '#1A1A1A',
        color: '#FFFFFF',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              LightningHire Support
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
              We're here to help you get the most out of your AI-powered resume evaluation system.
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  mr: 1,
                  borderRadius: '50%',
                  backgroundColor: '#000000',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Lightning bolt SVG */}
                <svg
                  viewBox="0 0 100 100"
                  width="60%"
                  height="60%"
                >
                  <defs>
                    <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFD600" />
                      <stop offset="100%" stopColor="#FF7900" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M60,20 L30,50 L45,50 L40,80 L70,50 L55,50 L60,20"
                    fill="url(#footerLogoGradient)"
                  />
                </svg>
              </Box>
              <Typography variant="subtitle1" fontWeight={600}>
                © {new Date().getFullYear()} Lightning Hire
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Typography variant="subtitle1" gutterBottom color="#FF7900" fontWeight={600}>
              Support
            </Typography>
            <Box>
              <MuiLink component={Link} href="/articles" color="inherit" display="block" sx={{ mb: 1, opacity: 0.7, '&:hover': { opacity: 1 } }}>
                Knowledge Base
              </MuiLink>
              <MuiLink component={Link} href="/tickets" color="inherit" display="block" sx={{ mb: 1, opacity: 0.7, '&:hover': { opacity: 1 } }}>
                My Tickets
              </MuiLink>
              <MuiLink component={Link} href="/chat" color="inherit" display="block" sx={{ mb: 1, opacity: 0.7, '&:hover': { opacity: 1 } }}>
                Live Chat
              </MuiLink>
              <MuiLink component={Link} href="/categories/faq" color="inherit" display="block" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                FAQ
              </MuiLink>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Typography variant="subtitle1" gutterBottom color="#FF7900" fontWeight={600}>
              Resources
            </Typography>
            <Box>
              <MuiLink component={Link} href="/contact" color="inherit" display="block" sx={{ mb: 1, opacity: 0.7, '&:hover': { opacity: 1 } }}>
                Contact Us
              </MuiLink>
              <MuiLink href="https://lightninghire.com/blog" target="_blank" rel="noopener" color="inherit" display="block" sx={{ mb: 1, opacity: 0.7, '&:hover': { opacity: 1 } }}>
                Blog
              </MuiLink>
              <MuiLink href="https://lightninghire.com" target="_blank" rel="noopener" color="inherit" display="block" sx={{ mb: 1, opacity: 0.7, '&:hover': { opacity: 1 } }}>
                Main Website
              </MuiLink>
              <MuiLink href="https://www.lightninghire.com" target="_blank" rel="noopener" color="inherit" display="block" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                Application
              </MuiLink>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
            All rights reserved.
          </Typography>
          <Box>
            <MuiLink component={Link} href="/privacy-policy" color="inherit" sx={{ mr: 3, opacity: 0.5, '&:hover': { opacity: 0.8 } }}>
              Privacy
            </MuiLink>
            <MuiLink component={Link} href="/terms-of-service" color="inherit" sx={{ opacity: 0.5, '&:hover': { opacity: 0.8 } }}>
              Terms
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}