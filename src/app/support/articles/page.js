import { connectToDatabase } from '@/lib/mongoose';
import KnowledgeArticle from '@/models/KnowledgeArticle';
import ArticleCategory from '@/models/ArticleCategory';
import PageLayout from '@/components/layout/PageLayout';

import {
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Container
} from '@mui/material';
import { format } from 'date-fns';
import Link from 'next/link';

// Generate metadata for the page
export const metadata = {
  title: 'Knowledge Base Articles | LightningHire Support',
  description: 'Browse all LightningHire knowledge base articles and support documentation.'
};

export default async function ArticlesIndexPage() {
  await connectToDatabase();
  
  // Fetch all published articles
  const articles = await KnowledgeArticle.find({ status: 'published' })
    .sort({ publishedDate: -1 })
    .populate('category', 'name slug');
  
  // Fetch all categories for filtering
  const categories = await ArticleCategory.find().sort({ name: 1 });
  
  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box mb={4}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link href="/" passHref>
              <MuiLink underline="hover" color="inherit">Home</MuiLink>
            </Link>
            <Link href="/support" passHref>
              <MuiLink underline="hover" color="inherit">Support</MuiLink>
            </Link>
            <Typography color="text.primary">Articles</Typography>
          </Breadcrumbs>
          
          <Typography variant="h4" component="h1" mt={2} mb={1}>
            Knowledge Base Articles
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Browse our collection of help articles, tutorials, and guides
          </Typography>
          <Divider />
        </Box>
        
        {/* Categories section */}
        <Box mb={4}>
          <Typography variant="h6" mb={2}>Categories</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {categories.map((category) => (
              <Link key={category._id} href={`/categories/${category.slug}`} passHref>
                <Chip 
                  label={category.name} 
                  clickable 
                  sx={{ mb: 1 }}
                />
              </Link>
            ))}
          </Box>
        </Box>
        
        {/* Articles grid */}
        <Box mb={4}>
          <Typography variant="h6" mb={2}>All Articles</Typography>
          {articles.length === 0 ? (
            <Typography>No articles found.</Typography>
          ) : (
            <Grid container spacing={3}>
              {articles.map((article) => (
                <Grid item xs={12} sm={6} md={4} key={article._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardActionArea component={Link} href={`/articles/${article.slug}`}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        {article.category && (
                          <Chip 
                            size="small" 
                            label={article.category.name} 
                            sx={{ mb: 1 }}
                          />
                        )}
                        <Typography gutterBottom variant="h6" component="h2">
                          {article.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {article.shortDescription}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {article.publishedDate ? format(new Date(article.publishedDate), 'MMM d, yyyy') : 'Draft'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {article.viewCount || 0} views
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </PageLayout>
  );
} 