// src/app/page.js
import { connectToDatabase } from '@/lib/mongoose';
import KnowledgeArticle from '@/models/KnowledgeArticle';
import ArticleCategory from '@/models/ArticleCategory';
import PageLayout from '@/components/layout/PageLayout';
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
  Stack
} from '@mui/material';
import { Search as SearchIcon, Article as ArticleIcon, Category as CategoryIcon } from '@mui/icons-material';
import Link from 'next/link';

// Make this a Server Component
export default async function Home() {
  // Connect to database
  await connectToDatabase();
  
  // Get popular articles
  const popularArticles = await KnowledgeArticle.find({ status: 'published' })
    .sort({ viewCount: -1 })
    .limit(4)
    .select('title shortDescription slug category')
    .populate('category', 'name slug')
    .lean();
  
  // Get recent articles
  const recentArticles = await KnowledgeArticle.find({ status: 'published' })
    .sort({ publishedDate: -1 })
    .limit(4)
    .select('title shortDescription slug category')
    .populate('category', 'name slug')
    .lean();
  
  // Get top categories
  const categories = await ArticleCategory.find({ isActive: true })
    .sort({ order: 1 })
    .limit(6)
    .lean();
  
  return (
    <PageLayout>
      {/* Hero Section */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          py: 8,
          bgcolor: 'primary.light',
          color: 'white',
          borderRadius: 4,
          mb: 6,
          boxShadow: 3
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Lightning Hire Support Center
          </Typography>
          <Typography variant="h6" sx={{ mb: 4 }}>
            Find answers, tutorials, and help for your AI-powered resume evaluation system
          </Typography>
          
          {/* Search Box */}
          <Paper 
            component="form" 
            elevation={4}
            sx={{ 
              p: '2px 4px', 
              display: 'flex', 
              alignItems: 'center',
              maxWidth: 600,
              mx: 'auto',
              borderRadius: 50,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
            }}
            action="/search"
            method="GET"
          >
            <InputAdornment position="start" sx={{ pl: 2 }}>
              <SearchIcon />
            </InputAdornment>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Search for help articles..."
              name="q"
              InputProps={{
                disableUnderline: true,
              }}
              sx={{ ml: 1, flex: 1 }}
            />
            <Button 
              type="submit" 
              variant="contained"
              sx={{ 
                borderRadius: 50,
                px: 3,
                py: 1.5,
                m: 0.5,
                textTransform: 'none',
                fontWeight: 'bold'
              }}
            >
              Search
            </Button>
          </Paper>
        </Container>
      </Box>
      
      {/* Categories Section */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
        Browse by Category
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category._id}>
            <Card>
              <CardActionArea 
                component={Link}
                href={`/categories/${category.slug}`}
                sx={{ p: 2 }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      bgcolor: 'primary.light', 
                      borderRadius: '50%',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CategoryIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="h6" component="h3">
                      {category.name}
                    </Typography>
                    {category.description && (
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Popular Articles Section */}
      <Typography variant="h4" component="h2" gutterBottom>
        Popular Articles
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {popularArticles.map((article) => (
          <Grid item xs={12} sm={6} key={article._id}>
            <Card>
              <CardActionArea 
                component={Link}
                href={`/articles/${article.slug}`}
              >
                <CardContent>
                  <Typography gutterBottom variant="h6" component="h3">
                    {article.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {article.shortDescription}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="primary">
                      {article.category?.name || 'Uncategorized'}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Recent Articles Section */}
      <Typography variant="h4" component="h2" gutterBottom>
        Recently Added
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {recentArticles.map((article) => (
          <Grid item xs={12} sm={6} key={article._id}>
            <Card>
              <CardActionArea 
                component={Link}
                href={`/articles/${article.slug}`}
              >
                <CardContent>
                  <Typography gutterBottom variant="h6" component="h3">
                    {article.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {article.shortDescription}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="primary">
                      {article.category?.name || 'Uncategorized'}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Help Section */}
      <Paper 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          bgcolor: 'grey.100',
          borderRadius: 4
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Need Additional Help?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Our support team is ready to assist you with any questions or issues.
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          component={Link}
          href="/contact"
          sx={{ 
            borderRadius: 2,
            px: 4,
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          Contact Support
        </Button>
      </Paper>
    </PageLayout>
  );
}