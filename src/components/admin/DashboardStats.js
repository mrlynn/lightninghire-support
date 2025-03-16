'use client';

import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Divider 
} from '@mui/material';
import { 
  Article as ArticleIcon,
  Category as CategoryIcon,
  Chat as ChatIcon,
  Publish as PublishIcon,
  NoteAdd as DraftIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';

export default function DashboardStats({ stats }) {
  const statItems = [
    {
      title: 'Articles',
      count: stats.articles.total,
      icon: <ArticleIcon fontSize="large" color="primary" />,
      details: [
        { label: 'Published', value: stats.articles.published, icon: <PublishIcon fontSize="small" sx={{ color: 'success.main' }} /> },
        { label: 'Draft', value: stats.articles.draft, icon: <DraftIcon fontSize="small" sx={{ color: 'warning.main' }} /> },
        { label: 'Archived', value: stats.articles.archived, icon: <ArchiveIcon fontSize="small" sx={{ color: 'error.main' }} /> }
      ]
    },
    {
      title: 'Categories',
      count: stats.categories.total,
      icon: <CategoryIcon fontSize="large" color="secondary" />,
      details: [
        { label: 'Active', value: stats.categories.active }
      ]
    },
    {
      title: 'Support Chats',
      count: stats.chats.total,
      icon: <ChatIcon fontSize="large" sx={{ color: 'info.main' }} />,
      details: [
        { label: 'Active', value: stats.chats.active },
        { label: 'Last 30 Days', value: stats.chats.last30Days }
      ]
    }
  ];

  return (
    <Grid container spacing={3}>
      {statItems.map((item, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Typography variant="h5" component="h2">
                {item.title}
              </Typography>
              {item.icon}
            </Box>
            
            <Typography 
              variant="h3" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                mb: 2
              }}
            >
              {item.count}
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mt: 'auto' }}>
              {item.details.map((detail, idx) => (
                <Box 
                  key={idx}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1
                  }}
                >
                  <Typography 
                    variant="body2" 
                    component="div"
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    {detail.icon && detail.icon}
                    {detail.label}
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {detail.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}