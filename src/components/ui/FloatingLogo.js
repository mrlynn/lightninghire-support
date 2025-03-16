'use client';

import { Box } from '@mui/material';

export default function FloatingLogo({ size = 200 }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        position: 'relative',
        margin: '0 auto',
        animation: 'float 6s ease-in-out infinite',
        '@keyframes float': {
          '0%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-15px)',
          },
          '100%': {
            transform: 'translateY(0px)',
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: '#1A1A1A',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Lightning bolt SVG */}
        <svg
          viewBox="0 0 100 100"
          width="60%"
          height="60%"
          style={{
            filter: 'drop-shadow(0 5px 5px rgba(0, 0, 0, 0.1))',
          }}
        >
          <defs>
            <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD600" />
              <stop offset="100%" stopColor="#FF7900" />
            </linearGradient>
          </defs>
          <path
            d="M60,20 L30,50 L45,50 L40,80 L70,50 L55,50 L60,20"
            fill="url(#orangeGradient)"
          />
        </svg>
      </Box>
    </Box>
  );
} 