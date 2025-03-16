'use client';

import { useState } from 'react';
import { useUserActivity } from '@/context/UserActivityContext';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Chip, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Skeleton,
  Paper,
  Button,
  CircularProgress,
  ListItemIcon
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SupportIcon from '@mui/icons-material/Support';
import HistoryIcon from '@mui/icons-material/History';
import { formatDistanceToNow } from 'date-fns';

export default function UserProfileSummary() {
  const { userProfile, isLoading, error } = useUserActivity();
  const [showHistory, setShowHistory] = useState(false);

  if (isLoading) {
    return (
      <Card elevation={2} sx={{ width: '100%', mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Box>
              <Skeleton variant="text" width={150} />
              <Skeleton variant="text" width={100} />
            </Box>
          </Box>
          <Skeleton variant="rectangular" height={100} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText', mb: 2 }}>
        <Typography variant="body1">Error loading profile: {error}</Typography>
      </Paper>
    );
  }

  if (!userProfile) {
    return null;
  }

  const { 
    name, 
    email, 
    image, 
    role, 
    subscriptionPlan,
    supportStats,
    lastSupportActivity,
    supportActivity
  } = userProfile;

  // Format date with relative time
  const formatDate = (date) => {
    if (!date) return 'Never';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Get subscription plan display name and color
  const getPlanInfo = (plan) => {
    switch (plan) {
      case 'pro':
        return { name: 'Pro', color: 'primary' };
      case 'enterprise':
        return { name: 'Enterprise', color: 'secondary' };
      default:
        return { name: 'Free', color: 'default' };
    }
  };

  const planInfo = getPlanInfo(subscriptionPlan);

  return (
    <Card elevation={2} sx={{ width: '100%', mb: 2 }}>
      <CardContent>
        {/* User Basic Info */}
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar 
            src={image} 
            alt={name}
            sx={{ 
              width: 50, 
              height: 50, 
              mr: 2,
              bgcolor: image ? 'transparent' : 'primary.main'
            }}
          >
            {!image && name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">{name}</Typography>
            <Typography variant="body2" color="text.secondary">{email}</Typography>
            <Box display="flex" mt={0.5} alignItems="center">
              <Chip 
                label={role?.charAt(0).toUpperCase() + role?.slice(1)} 
                size="small" 
                color={role === 'admin' ? 'error' : role === 'support_agent' ? 'warning' : 'primary'}
                sx={{ mr: 1 }}
              />
              <Chip 
                label={planInfo.name} 
                size="small" 
                color={planInfo.color}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Activity Stats */}
        <Typography variant="subtitle1" gutterBottom>
          Support Activity
        </Typography>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box textAlign="center">
            <Typography variant="h6">{supportStats?.articlesRead || 0}</Typography>
            <Typography variant="body2" color="text.secondary">Articles Read</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6">{supportStats?.feedbackGiven || 0}</Typography>
            <Typography variant="body2" color="text.secondary">Feedback Given</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6">{supportStats?.ticketsCreated || 0}</Typography>
            <Typography variant="body2" color="text.secondary">Support Tickets</Typography>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Last Activity: {formatDate(lastSupportActivity)}
        </Typography>

        {/* Recent Activity (toggle) */}
        {supportActivity && (
          <>
            <Button 
              startIcon={showHistory ? null : <HistoryIcon />}
              endIcon={showHistory ? <CircularProgress size={16} /> : null}
              onClick={() => setShowHistory(!showHistory)}
              sx={{ mt: 1 }}
              size="small"
            >
              {showHistory ? 'Hide History' : 'Show Recent Activity'}
            </Button>
            
            {showHistory && (
              <Box mt={2}>
                {/* Recent Articles */}
                {supportActivity.articleViews?.length > 0 && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Recent Articles
                    </Typography>
                    <List dense disablePadding>
                      {supportActivity.articleViews.slice(-3).reverse().map((view, index) => (
                        <ListItem key={index} disableGutters disablePadding sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <ArticleIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={view.title} 
                            secondary={formatDate(view.timestamp)}
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {/* Recent Searches */}
                {supportActivity.searchHistory?.length > 0 && (
                  <>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 1.5 }}>
                      Recent Searches
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {supportActivity.searchHistory.slice(-5).reverse().map((search, index) => (
                        <Chip 
                          key={index} 
                          label={search.query} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </>
                )}
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 