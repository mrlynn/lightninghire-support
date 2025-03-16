"use client";

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';

export default function EnhancedHowItWorks() {
  const theme = useTheme();
  const videoRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  // Steps for the process
  const steps = [
    {
      label: 'Create Job Listings',
      description: 'Enter job details including responsibilities and required qualifications. Our system organizes these into structured skill requirements.',
      videoTime: 0 // Start time in seconds
    },
    {
      label: 'Import Candidates',
      description: 'Add candidates by pasting resume text. Our AI automatically extracts skills, experience, and qualifications.',
      videoTime: 3 // Time to jump to for this step
    },
    {
      label: 'Evaluate Matches',
      description: 'Get AI-powered match scores, recommendations, and detailed analyses comparing candidate qualifications to job requirements.',
      videoTime: 6 // Time to jump to for this step
    }
  ];

  // Handle video loaded state
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (videoElement) {
      const handleLoaded = () => {
        setIsVideoLoaded(true);
      };
      
      videoElement.addEventListener('loadeddata', handleLoaded);
      
      if (videoElement.readyState >= 3) {
        setIsVideoLoaded(true);
      }
      
      return () => {
        videoElement.removeEventListener('loadeddata', handleLoaded);
      };
    }
  }, []);

  // Handle step changes to sync with video
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (videoElement && isVideoLoaded) {
      // Set video current time based on active step
      videoElement.currentTime = steps[activeStep].videoTime;
    }
  }, [activeStep, isVideoLoaded, steps]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{ 
      bgcolor: theme.palette.background.paper, 
      py: { xs: 8, md: 10 },
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <Box 
        sx={{ 
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '30%',
          height: '30%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.secondary.light}15, transparent)`,
          filter: 'blur(40px)'
        }}
      />
      
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Typography variant="h3" component="h2" color="primary" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            Our AI-powered platform streamlines your recruiting process in three simple steps
          </Typography>
        </Box>

        <Grid container spacing={6} alignItems="center">
          {/* Left side: Process steps */}
          <Grid item xs={12} md={5}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel>
                    <Typography 
                      variant="h6" 
                      color={activeStep === index ? 'primary' : 'text.primary'}
                      sx={{ fontWeight: activeStep === index ? 700 : 400 }}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {step.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          {index === steps.length - 1 ? 'Finish' : 'Continue'}
                        </Button>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Back
                        </Button>
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            {activeStep === steps.length && (
              <Paper square elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="body1" paragraph>
                  All steps completed - you've seen how LightningHire works!
                </Typography>
                <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                  See Again
                </Button>
                <Button
                  variant="contained"
                  href="/register"
                  sx={{ mt: 1, mr: 1 }}
                >
                  Get Started
                </Button>
              </Paper>
            )}
          </Grid>
          
          {/* Right side: Motion graphic */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={6}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                transform: 'perspective(1000px) rotateY(-5deg) rotateX(2deg)',
                transformStyle: 'preserve-3d',
                boxShadow: '0 20px 80px rgba(0,0,0,0.1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
                  zIndex: 2,
                  pointerEvents: 'none',
                },
              }}
            >
              {/* Loading state */}
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
                    bgcolor: 'background.default',
                    zIndex: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Loading visualization...
                  </Typography>
                </Box>
              )}
              
              {/* The org chart motion graphic video */}
              <Box
                component="video"
                ref={videoRef}
                autoPlay
                muted
                playsInline
                loop={false}
                sx={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              >
                <source src="/videos/org-chart-motion.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </Box>
              
              {/* Overlay with step indicators */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  padding: 2,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 1,
                  zIndex: 3,
                }}
              >
                {steps.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: index === activeStep ? 'primary.main' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => setActiveStep(index)}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}