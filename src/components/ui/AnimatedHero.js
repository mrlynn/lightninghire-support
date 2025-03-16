'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Box, 
  Container, 
  Typography, 
  Button,
  useTheme
} from '@mui/material';
import FloatingLogo from '@/components/ui/FloatingLogo';

/**
 * AnimatedHero - Creates a hero section with animated floating logos in the background
 */
const AnimatedHero = ({ 
  title = "LightningHire Support",
  subtitle = "AI-Powered Resume Evaluation System",
  ctaText = "Get Started →",
  ctaLink = "/getting-started",
  logoCount = 7,
  backgroundOpacity = 0.08,
  showCenterLogo = true
}) => {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Only enable animations after component is mounted to avoid SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate random logo elements
  const renderFloatingLogos = () => {
    if (!mounted) return null;
    
    return Array.from({ length: logoCount }, (_, index) => {
      const delay = Math.random() * 5; // Random delay between 0-5s
      const scale = 0.4 + Math.random() * 0.6; // Random scale between 0.4-1.0
      const startPosition = Math.random() * 80; // Random start position 0-80%
      const animationDuration = 20 + Math.random() * 30; // 20-50s for slower, more subtle movement
      
      return (
        <Box
          key={index}
          component="div"
          sx={{
            position: 'absolute',
            opacity: backgroundOpacity,
            width: '150px',
            height: '150px',
            top: `${startPosition}%`,
            left: `${Math.random() * 80}%`,
            animation: `float${index} ${animationDuration}s linear ${delay}s infinite`,
            transform: `scale(${scale})`,
            zIndex: 0,
            "& img": {
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            },
            [`@keyframes float${index}`]: {
              "0%": {
                transform: `scale(${scale}) translate(0, 0)`,
              },
              "25%": {
                transform: `scale(${scale}) translate(${-50 + Math.random() * 100}px, ${-50 + Math.random() * 100}px)`,
              },
              "50%": {
                transform: `scale(${scale}) translate(${-50 + Math.random() * 100}px, ${-50 + Math.random() * 100}px)`,
              },
              "75%": {
                transform: `scale(${scale}) translate(${-50 + Math.random() * 100}px, ${-50 + Math.random() * 100}px)`,
              },
              "100%": {
                transform: `scale(${scale}) translate(0, 0)`,
              }
            }
          }}
        >
          <Image
            src="/logo-circle-on-black.png"
            alt=""
            width={150}
            height={150}
            aria-hidden="true"
          />
        </Box>
      );
    });
  };

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: theme.palette.primary.main,
        color: 'white',
        pt: { xs: 8, md: 10 },
        pb: { xs: 10, md: 12 },
      }}
    >
      {/* Floating logo background */}
      {renderFloatingLogos()}
      
      {/* Content container */}
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        {/* Center floating logo */}
        {showCenterLogo && (
          <Box sx={{ mb: 2 }}>
            <FloatingLogo size={180} />
          </Box>
        )}
        
        <Typography
          variant="h1"
          component="h1"
          color="white"
          sx={{
            fontWeight: 800,
            mb: 3,
            fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="h5"
          color="white"
          sx={{
            mb: 6,
            lineHeight: 1.6,
            opacity: 0.9,
            maxWidth: '800px',
            mx: 'auto'
          }}
        >
          {subtitle}
        </Typography>

        <Button
          variant="contained"
          size="large"
          component={Link}
          href={ctaLink}
          sx={{ 
            px: 4, 
            py: 1.5, 
            fontSize: '1.1rem',
            fontWeight: 600,
            borderRadius: 2,
            bgcolor: 'white',
            color: theme.palette.primary.main,
            boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.2)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
            }
          }}
        >
          {ctaText}
        </Button>
      </Container>
    </Box>
  );
};

export default AnimatedHero; 