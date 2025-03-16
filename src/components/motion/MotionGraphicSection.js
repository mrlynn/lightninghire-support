"use client";

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';

export function MotionGraphicSection() {
  const theme = useTheme();
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (videoElement) {
      // Handle video loaded event
      const handleLoaded = () => {
        setIsVideoLoaded(true);
      };
      
      videoElement.addEventListener('loadeddata', handleLoaded);
      
      // Check if video is already loaded
      if (videoElement.readyState >= 3) {
        setIsVideoLoaded(true);
      }
      
      return () => {
        videoElement.removeEventListener('loadeddata', handleLoaded);
      };
    }
  }, []);

  return (
    <Box 
      sx={{ 
        py: { xs: 8, md: 12 },
        background: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          {/* Text content */}
          <Grid item xs={12} md={5} sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h3"
              component="h2"
              color="primary"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Effortless Resume Evaluation
            </Typography>
            
            <Typography
              variant="h6"
              color="text.secondary"
              paragraph
              sx={{ mb: 4 }}
            >
              Our AI-powered system helps you identify top candidates quickly by analyzing resumes against your job requirements and organizational needs.
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              href="/articles/resume-evaluation"
              endIcon={<ArrowForwardIcon />}
              sx={{ mb: 2 }}
            >
              Learn How It Works
            </Button>
            
            <Typography variant="body2" color="text.secondary">
              Join hundreds of companies that have streamlined their hiring process.
            </Typography>
          </Grid>
          
          {/* Motion Graphic Video */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={6}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                transform: 'perspective(1000px) rotateY(-5deg)',
                transformStyle: 'preserve-3d',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}22, ${theme.palette.secondary.main}22)`,
                  zIndex: 2,
                  opacity: isVideoLoaded ? 0.3 : 1,
                  transition: 'opacity 0.5s ease-in-out',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: '30%',
                  background: `linear-gradient(to top, ${theme.palette.background.paper}, transparent)`,
                  zIndex: 2,
                  opacity: 0.7,
                }
              }}
            >
              {/* Loading placeholder */}
              {!isVideoLoaded && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.paper',
                    zIndex: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Loading visualization...
                  </Typography>
                </Box>
              )}
              
              {/* Video Element */}
              <Box
                component="video"
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                sx={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  opacity: isVideoLoaded ? 1 : 0,
                  transition: 'opacity 0.5s ease-in-out',
                  zIndex: 1,
                }}
              >
                <source src="/videos/resume-evaluation-demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// Decorative elements that can be added to enhance the section
export function DecorativeElements() {
  const theme = useTheme();
  
  return (
    <>
      {/* Background decorative element */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '-10%',
          width: '40%',
          height: '60%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.light}22, ${theme.palette.primary.main}00)`,
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />
      
      {/* Foreground decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: '15px',
          height: '15px',
          borderRadius: '50%',
          bgcolor: theme.palette.primary.main,
          opacity: 0.6,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          bgcolor: theme.palette.secondary.main,
          opacity: 0.4,
          zIndex: 0,
        }}
      />
    </>
  );
}

// Export a combined component for easy use
export default function VideoSection() {
  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      <DecorativeElements />
      <MotionGraphicSection />
    </Box>
  );
} 