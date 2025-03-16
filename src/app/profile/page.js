'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserActivity } from '@/context/UserActivityContext';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Grid,
  Paper,
  Avatar,
  Divider,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Person as PersonIcon,
  Article as ArticleIcon,
  Search as SearchIcon,
  HelpOutline as HelpIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import PageLayout from '@/components/layout/PageLayout';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { userProfile, isLoading, error } = useUserActivity();
  const router = useRouter();
  
  // Redirect if user is not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile');
    }
  }, [status, router]);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <PageLayout>
        <Container maxWidth="md">
          <Box sx={{ py: 5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Loading profile...
            </Typography>
          </Box>
        </Container>
      </PageLayout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <PageLayout>
        <Container maxWidth="md">
          <Box sx={{ py: 5 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Error Loading Profile
            </Typography>
            <Typography color="error">
              {error}
            </Typography>
          </Box>
        </Container>
      </PageLayout>
    );
  }
  
  // Not authenticated
  if (!session) {
    return (
      <PageLayout>
        <Container maxWidth="md">
          <Box sx={{ py: 5 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Authentication Required
            </Typography>
            <Typography>
              Please log in to view your profile.
            </Typography>
          </Box>
        </Container>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <Container maxWidth="md">
        <Box sx={{ py: 5 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Profile
          </Typography>
          
          <Grid container spacing={4}>
            {/* User Profile Card */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={session.user.image}
                    alt={session.user.name}
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                  >
                    {!session.user.image && session.user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  
                  <Typography variant="h5" gutterBottom>
                    {session.user.name}
                  </Typography>
                  
                  {userProfile?.role && (
                    <Chip 
                      label={userProfile.role.replace('_', ' ')}
                      color="primary"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  )}
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email"
                        secondary={session.user.email}
                      />
                    </ListItem>
                    
                    {userProfile?.organization && (
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Organization"
                          secondary={userProfile.organization}
                        />
                      </ListItem>
                    )}
                    
                    <ListItem>
                      <ListItemIcon>
                        <TimeIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Last Active"
                        secondary={formatDate(userProfile?.lastSupportActivity || session.user.updatedAt)}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Support Activity Card */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Support Activity
                  </Typography>
                  
                  {userProfile?.supportStats ? (
                    <>
                      <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={6} sm={3}>
                          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                            <Typography variant="h4">{userProfile.supportStats.articlesViewed || 0}</Typography>
                            <Typography variant="body2">Articles Viewed</Typography>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={6} sm={3}>
                          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', backgroundColor: 'info.light', color: 'info.contrastText' }}>
                            <Typography variant="h4">{userProfile.supportStats.searchesPerformed || 0}</Typography>
                            <Typography variant="body2">Searches</Typography>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={6} sm={3}>
                          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', backgroundColor: 'success.light', color: 'success.contrastText' }}>
                            <Typography variant="h4">{userProfile.supportStats.ticketsCreated || 0}</Typography>
                            <Typography variant="body2">Tickets Created</Typography>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={6} sm={3}>
                          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', backgroundColor: 'warning.light', color: 'warning.contrastText' }}>
                            <Typography variant="h4">{userProfile.supportStats.feedbackGiven || 0}</Typography>
                            <Typography variant="body2">Feedback Given</Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                      
                      <Divider sx={{ my: 3 }} />
                      
                      <Typography variant="subtitle1" gutterBottom>
                        Recent Activity
                      </Typography>
                      
                      <List dense>
                        {userProfile.supportActivity?.articleViews?.slice(0, 3).map((article, index) => (
                          <ListItem key={`article-${index}`}>
                            <ListItemIcon>
                              <ArticleIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={`Viewed: ${article.title}`}
                              secondary={`${article.viewCount} views • Last viewed ${formatDate(article.lastViewed)}`}
                            />
                          </ListItem>
                        ))}
                        
                        {userProfile.supportActivity?.searches?.slice(0, 3).map((search, index) => (
                          <ListItem key={`search-${index}`}>
                            <ListItemIcon>
                              <SearchIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={`Searched: "${search.query}"`}
                              secondary={`${search.resultsCount} results • ${formatDate(search.timestamp)}`}
                            />
                          </ListItem>
                        ))}
                        
                        {userProfile.supportActivity?.tickets?.slice(0, 3).map((ticket, index) => (
                          <ListItem key={`ticket-${index}`}>
                            <ListItemIcon>
                              <HelpIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={`Created ticket: ${ticket.title}`}
                              secondary={`Status: ${ticket.status} • ${formatDate(ticket.createdAt)}`}
                            />
                          </ListItem>
                        ))}
                        
                        {(!userProfile.supportActivity?.articleViews?.length &&
                          !userProfile.supportActivity?.searches?.length &&
                          !userProfile.supportActivity?.tickets?.length) && (
                          <ListItem>
                            <ListItemText primary="No recent activity to display" />
                          </ListItem>
                        )}
                      </List>
                    </>
                  ) : (
                    <Typography>No support activity data available</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </PageLayout>
  );
} 