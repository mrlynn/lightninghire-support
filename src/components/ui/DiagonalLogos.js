'use client';

import { Box } from '@mui/material';
import Image from 'next/image';

export default function DiagonalLogos({ opacity = 0.2 }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Large logo in the background */}
      <Box
        sx={{
          position: 'absolute',
          width: '800px',
          height: '800px',
          opacity: opacity,
          left: '-200px',
          top: '5%',
          transform: 'rotate(-15deg)',
        }}
      >
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          <path
            fill="#FF7900"
            d="M100 0 L160 100 L100 200 L40 100 Z"
          />
          <path
            fill="#FFA500"
            d="M100 30 L140 100 L100 170 L60 100 Z"
          />
        </svg>
      </Box>
      
      {/* Small logo in the background */}
      <Box
        sx={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          opacity: opacity,
          right: '-100px',
          bottom: '10%',
          transform: 'rotate(25deg)',
        }}
      >
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          <path
            fill="#FF7900"
            d="M100 0 L160 100 L100 200 L40 100 Z"
          />
          <path
            fill="#FFA500"
            d="M100 30 L140 100 L100 170 L60 100 Z"
          />
        </svg>
      </Box>
    </Box>
  );
} 