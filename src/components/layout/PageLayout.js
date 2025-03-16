'use client';

import { Box, Container } from '@mui/material';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingChatbot from '@/components/chat/FloatingChatbot';
import DiagonalLogos from '@/components/ui/DiagonalLogos';

export default function PageLayout({ 
  children, 
  maxWidth = 'lg', 
  disableChatbot = false,
  showBackgroundLogos = true
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          padding: maxWidth === false ? 0 : undefined,
          margin: maxWidth === false ? 0 : undefined,
          position: 'relative',
          overflow: 'hidden',
          ...(maxWidth !== false && {
            py: 4, 
            px: { xs: 2, sm: 3 }
          })
        }}
      >
        {showBackgroundLogos && <DiagonalLogos />}
        
        {maxWidth === false ? (
          children
        ) : (
          <Container maxWidth={maxWidth} sx={{ position: 'relative', zIndex: 1 }}>
            {children}
          </Container>
        )}
      </Box>
      
      <Footer />
      
      {!disableChatbot && <FloatingChatbot />}
    </Box>
  );
}