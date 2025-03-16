'use client';

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardActionArea, 
  Grid 
} from '@mui/material';
import Link from 'next/link';
import { Article as ArticleIcon } from '@mui/icons-material';

export default function RelatedArticles({ articles }) {
  if (!articles || articles.length === 0) {
    return null;
  }
  
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Related Articles
      </Typography>
      
      <Grid container spacing={3}>
        {articles.map((article) => (
          <Grid item xs={12} md={4} key={article._id}>
            <Card variant="outlined">
              <CardActionArea
                component={Link}
                href={`/articles/${article.slug}`}
                sx={{ height: '100%' }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <ArticleIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h3">
                      {article.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {article.shortDescription}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}