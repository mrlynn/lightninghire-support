import { connectToDatabase } from '@/lib/mongoose';
import ArticleCategory from '@/models/ArticleCategory';
import PageLayout from '@/components/layout/PageLayout';
import { Typography, Grid, Card, CardActionArea, Box, Container } from '@mui/material';
import { Category as CategoryIcon } from '@mui/icons-material';
import Link from 'next/link';

export const metadata = {
  title: 'Categories | Lightning Hire Support',
  description: 'Browse all support article categories',
};

export default async function CategoriesPage() {
  await connectToDatabase();
  
  // Get all active categories
  const categories = await ArticleCategory.find({ isActive: true })
    .sort({ order: 1, name: 1 })
    .lean();
  
  return (
    <PageLayout showBackgroundLogos={false}>
      <Container maxWidth="lg">
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          align="center" 
          sx={{ mb: 4 }}
        >
          Support Categories
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          paragraph 
          align="center"
          sx={{ mb: 6 }}
        >
          Browse our knowledge base by category to find the information you need
        </Typography>
        
        {categories.length > 0 ? (
          <Grid container spacing={3}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <CardActionArea 
                    component={Link}
                    href={`/categories/${category.slug}`}
                    sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <Box 
                      sx={{ 
                        p: 1.5, 
                        mb: 2,
                        borderRadius: 2,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <CategoryIcon fontSize="medium" />
                    </Box>
                    
                    <Typography variant="h5" component="h2" gutterBottom>
                      {category.name}
                    </Typography>
                    
                    {category.description && (
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                    )}
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" sx={{ mt: 4 }} align="center">
            No categories found.
          </Typography>
        )}
      </Container>
    </PageLayout>
  );
} 