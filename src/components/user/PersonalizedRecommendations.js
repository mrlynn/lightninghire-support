'use client';

import { useUserActivity } from '@/context/UserActivityContext';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Chip,
  Skeleton,
  Button
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import Link from 'next/link';

export default function PersonalizedRecommendations() {
  const { userProfile, isLoading } = useUserActivity();

  // If user is not logged in or data is still loading, show nothing
  if (!userProfile && !isLoading) return null;

  // Loading state
  if (isLoading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Skeleton width={200} />
          </Typography>
          <Skeleton variant="rectangular" height={120} />
        </CardContent>
      </Card>
    );
  }

  // Extract knowledge profile data
  const { knowledgeProfile, recommendations } = userProfile || {};
  const hasInterests = knowledgeProfile?.interests?.length > 0;
  const hasRecommendations = recommendations?.suggestedArticles?.length > 0;

  // If no interests or recommendations, don't show the component
  if (!hasInterests && !hasRecommendations) return null;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <StarIcon sx={{ mr: 1, color: 'primary.main' }} />
          Personalized for You
        </Typography>

        {/* User Interests */}
        {hasInterests && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalOfferIcon fontSize="small" sx={{ mr: 0.5 }} />
              Topics You're Interested In
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {knowledgeProfile.interests.map((interest, index) => (
                <Chip 
                  key={index} 
                  label={interest} 
                  size="small"
                  component={Link}
                  href={`/categories/${interest.toLowerCase().replace(/\s+/g, '-')}`}
                  clickable
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Recommended Articles */}
        {hasRecommendations ? (
          <Box>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Recommended Articles
            </Typography>
            <List dense disablePadding>
              {recommendations.suggestedArticles.map((article, index) => (
                <ListItem 
                  key={index} 
                  disablePadding 
                  component={Link}
                  href={`/articles/${article.slug}`}
                  sx={{ 
                    mb: 0.5, 
                    borderRadius: 1,
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ArticleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={article.title} 
                    secondary={article.category}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          <Box textAlign="center" py={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              We're building recommendations based on your activity.
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              component={Link}
              href="/categories"
              sx={{ mt: 1 }}
            >
              Browse Categories
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 