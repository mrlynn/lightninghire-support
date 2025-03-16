// src/app/page.js
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useUserActivity } from '@/context/UserActivityContext';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import {
  Article as ArticleIcon,
  QuestionAnswer as QuestionIcon,
  PersonOutline as PersonIcon,
  Search as SearchIcon,
  SupportAgent as SupportIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';

export default function HomePage() {
  const { data: session } = useSession();
  const { userProfile, isLoading } = useUserActivity();
  
  // Featured support topics
  const featuredTopics = [
    { title: 'Getting Started', icon: ArticleIcon, url: '/articles/getting-started' },
    { title: 'Account Management', icon: PersonIcon, url: '/articles/account' },
    { title: 'Billing & Subscription', icon: ArticleIcon, url: '/articles/billing' },
    { title: 'Common Issues', icon: QuestionIcon, url: '/articles/common-issues' },
  ];
  
  return (
    <PageLayout>
      <Container maxWidth="lg">
        {/* Hero section */}
        <Box 
          sx={{ 
            py: { xs: 4, md: 8 },
            textAlign: 'center', 
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              backgroundImage: 'linear-gradient(45deg, #FF7900, #FFD600)',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            LightningHire Support
          </Typography>
          
          <Typography 
            variant="h6"
            color="text.secondary"
            sx={{ 
              maxWidth: '700px', 
              mx: 'auto', 
              mb: 5,
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            Get the help you need to maximize your recruitment efficiency with our powerful AI-driven tools.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              component={Link}
              href="/tickets/new"
              variant="contained" 
              size="large"
              startIcon={<SupportIcon />}
              sx={{ 
                py: 1.5,
                px: 4,
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              Create Support Ticket
            </Button>
            
            <Button 
              component={Link}
              href="/articles"
              variant="outlined" 
              size="large"
              startIcon={<ArticleIcon />}
              sx={{ 
                py: 1.5,
                px: 4,
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              Browse Knowledge Base
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        {/* Personalized welcome section for authenticated users */}
        {session && (
          <Paper
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 6, 
              borderRadius: 2,
              backgroundColor: 'primary.light',
              color: 'primary.contrastText'
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography variant="h4" gutterBottom>
                  Welcome back, {session.user.name.split(' ')[0]}!
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                  {userProfile && userProfile.supportStats?.ticketsCreated > 0 ? (
                    `You have ${userProfile.supportStats.ticketsCreated} support ticket${userProfile.supportStats.ticketsCreated > 1 ? 's' : ''} in our system. Our team is here to help you get the most out of LightningHire.`
                  ) : (
                    "Need help with anything? Our support team is ready to assist you with any questions you might have."
                  )}
                </Typography>
                
                <Button 
                  component={Link}
                  href="/profile"
                  variant="contained" 
                  color="secondary"
                  startIcon={<PersonIcon />}
                >
                  View Profile & Activity
                </Button>
              </Grid>
              
              {userProfile && (
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: { xs: 'center', md: 'flex-end' } }}>
                    <Chip 
                      icon={<ArticleIcon />} 
                      label={`${userProfile.supportStats?.articlesViewed || 0} Articles Viewed`} 
                      color="default" 
                      sx={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'inherit' }}
                    />
                    <Chip 
                      icon={<QuestionIcon />} 
                      label={`${userProfile.supportStats?.ticketsCreated || 0} Tickets Created`} 
                      color="default"
                      sx={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'inherit' }}
                    />
                    <Chip 
                      icon={<SearchIcon />} 
                      label={`${userProfile.supportStats?.searchesPerformed || 0} Searches`} 
                      color="default"
                      sx={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'inherit' }}
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}
        
        {/* Featured topics section */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              textAlign: 'center',
              mb: 4
            }}
          >
            Featured Support Topics
          </Typography>
          
          <Grid container spacing={3}>
            {featuredTopics.map((topic, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  component={Link} 
                  href={topic.url}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <Box 
                      sx={{ 
                        mb: 2,
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: 'primary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto'
                      }}
                    >
                      <topic.icon fontSize="large" color="primary" />
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {topic.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Browse articles and guides about {topic.title.toLowerCase()}.
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button size="small" color="primary">
                      Learn More
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Help options */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              textAlign: 'center',
              mb: 4
            }}
          >
            Need More Help?
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: 'center',
                      gap: 3
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        backgroundColor: 'info.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SupportIcon fontSize="large" color="info" />
                    </Box>
                    <Box>
                      <Typography variant="h5" component="h3" gutterBottom>
                        Submit a Support Ticket
                      </Typography>
                      <Typography variant="body1" paragraph>
                        Our support team typically responds within 24 hours to help with your specific questions.
                      </Typography>
                      <Button 
                        component={Link}
                        href="/tickets/new"
                        variant="contained" 
                        color="info"
                      >
                        Create Ticket
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: 'center',
                      gap: 3
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        backgroundColor: 'success.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <QuestionIcon fontSize="large" color="success" />
                    </Box>
                    <Box>
                      <Typography variant="h5" component="h3" gutterBottom>
                        Frequently Asked Questions
                      </Typography>
                      <Typography variant="body1" paragraph>
                        Get immediate answers to common questions about using LightningHire.
                      </Typography>
                      <Button 
                        component={Link}
                        href="/faqs"
                        variant="contained" 
                        color="success"
                      >
                        Browse FAQs
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </PageLayout>
  );
}