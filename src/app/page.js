// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ChatButton from '@/components/support/ChatButton';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  InputAdornment, 
  Paper, 
  Container, 
  Button, 
  Divider,
  CardActionArea,
  CardMedia,
  Stack,
  CardActions,
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Article as ArticleIcon, 
  Category as CategoryIcon,
  LiveHelp as LiveHelpIcon,
  SupportAgent as SupportAgentIcon,
  ContactSupport as ContactSupportIcon,
  School as SchoolIcon,
  Help as HelpIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import Link from 'next/link';
import AnimatedHero from '@/components/ui/AnimatedHero';
import HomepageFeatures from '@/components/ui/HomepageFeatures';

// Quick link cards for the homepage
const quickLinks = [
  {
    title: 'Knowledge Base',
    description: 'Browse our comprehensive knowledge base articles to find answers to common questions.',
    icon: ArticleIcon,
    href: '/articles',
  },
  {
    title: 'Live Support',
    description: 'Chat with our support team for immediate assistance with your questions.',
    icon: SupportAgentIcon,
    href: '/chat',
  },
  {
    title: 'Submit a Ticket',
    description: 'Create a support ticket for more complex issues that require detailed assistance.',
    icon: ContactSupportIcon,
    href: '/tickets/new',
  },
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [popularArticles, setPopularArticles] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // We'd fetch data here in a real app
    // For now, just simulate the data being loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <PageLayout showBackgroundLogos={false}>
      {/* Animated Hero Section */}
      <AnimatedHero 
        title="LightningHire Support"
        subtitle="We're here to help you get the most out of your AI-powered resume evaluation system"
        ctaText="Browse Knowledge Base"
        ctaLink="/articles"
        logoCount={9}
        backgroundOpacity={0.07}
      />
      
      {/* Quick Links Section */}
      <Box sx={{ py: 8, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h4"
            align="center"
            color="text.primary"
            gutterBottom
            sx={{ mb: 6, fontWeight: 700 }}
          >
            Support Options
          </Typography>
          
          <Grid container spacing={4} justifyContent="center">
            {quickLinks.map((link, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2 
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: 'primary.main',
                          color: 'white',
                          display: 'inline-flex',
                          mr: 2
                        }}
                      >
                        <link.icon />
                      </Box>
                      <Typography variant="h5" component="h3" fontWeight={600}>
                        {link.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                      {link.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button 
                      component={Link} 
                      href={link.href}
                      sx={{ 
                        fontWeight: 600,
                        '&:hover': { 
                          backgroundColor: 'rgba(255, 121, 0, 0.08)' 
                        }
                      }}
                    >
                      {index === 0 ? 'Browse Articles →' : index === 1 ? 'Start Chat →' : 'Submit Ticket →'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Features Section */}
      <HomepageFeatures />
      
      {/* FAQ Section */}
      <Box sx={{ py: 8, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 700 }}
          >
            Frequently Asked Questions
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
                  How do I upload resumes for evaluation?
                </Typography>
                <Typography variant="body1">
                  You can upload resumes individually or in bulk through the "Resumes" tab in your dashboard. 
                  Our system accepts PDF, Word (.docx), and text (.txt) formats.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
                  Can I customize the evaluation criteria?
                </Typography>
                <Typography variant="body1">
                  Yes! You can create custom evaluation templates with specific skills, 
                  experience levels, and other requirements from the "Settings" menu.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
                  How accurate is the AI evaluation?
                </Typography>
                <Typography variant="body1">
                  Our AI has been trained on millions of resumes and achieves over 95% accuracy 
                  in identifying relevant skills and experience compared to human recruiters.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
                  How do I integrate with my ATS?
                </Typography>
                <Typography variant="body1">
                  LightningHire offers pre-built integrations with popular ATS platforms. 
                  Visit the "Integrations" section in settings to connect your existing systems.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              component={Link}
              href="/categories/faq"
              variant="outlined"
              color="primary"
              sx={{ 
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
            >
              View All FAQs
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Still Need Help?
          </Typography>
          <Typography
            variant="body1"
            paragraph
            color="text.secondary"
            sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}
          >
            Our support team is ready to assist you with any questions or issues you may have with LightningHire.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              component={Link}
              href="/contact"
              variant="outlined"
              color="primary"
              size="large"
              sx={{ 
                px: 3, 
                py: 1.5,
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
            >
              Contact Support
            </Button>
            <Button
              component={Link}
              href="https://www.lightninghire.com"
              variant="contained"
              color="primary"
              size="large"
              sx={{ 
                px: 3, 
                py: 1.5,
                fontWeight: 600,
              }}
            >
              Back to App
            </Button>
          </Box>
        </Container>
      </Box>
    </PageLayout>
  );
}