'use client';

import { Box, Container, Grid, Typography, Paper } from '@mui/material';
import { 
  Search as SearchIcon, 
  ChatBubble as ChatBubbleIcon, 
  Announcement as AnnouncementIcon, 
  VideoLibrary as VideoLibraryIcon 
} from '@mui/icons-material';

const features = [
  {
    title: 'Search Knowledge Base',
    description: 'Quickly find answers to your questions with our powerful search functionality across all support content.',
    icon: SearchIcon,
  },
  {
    title: '24/7 Chat Support',
    description: 'Get immediate assistance through our live chat system whenever you need help with the platform.',
    icon: ChatBubbleIcon,
  },
  {
    title: 'Product Updates',
    description: 'Stay informed about the latest features, improvements, and fixes in LightningHire.',
    icon: AnnouncementIcon,
  },
  {
    title: 'Video Tutorials',
    description: 'Learn through visual guides demonstrating key features and workflows of the platform.',
    icon: VideoLibraryIcon,
  },
];

export default function HomepageFeatures() {
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Typography
          component="h2"
          variant="h4"
          align="center"
          color="text.primary"
          gutterBottom
          sx={{ mb: 6, fontWeight: 700 }}
        >
          Our Support Services
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: (theme) => theme.shadows[4],
                  },
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    mb: 2,
                    backgroundColor: 'primary.main',
                    borderRadius: '50%',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <feature.icon fontSize="large" />
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
} 