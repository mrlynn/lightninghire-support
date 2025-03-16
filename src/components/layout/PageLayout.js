'use client';

import { Box, Container } from '@mui/material';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingChatbot from '@/components/chat/FloatingChatbot';

export default function PageLayout({ children, maxWidth = 'lg', disableChatbot = false }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          padding: maxWidth === false ? 0 : undefined,
          margin: maxWidth === false ? 0 : undefined,
          ...(maxWidth !== false && {
            py: 4, 
            px: { xs: 2, sm: 3 }
          })
        }}
      >
        {maxWidth === false ? (
          children
        ) : (
          <Container maxWidth={maxWidth}>
            {children}
          </Container>
        )}
      </Box>
      
      <Footer />
      
      {!disableChatbot && <FloatingChatbot />}
    </Box>
  );
}