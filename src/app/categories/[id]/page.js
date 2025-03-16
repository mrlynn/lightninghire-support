import { connectToDatabase } from '@/lib/mongoose';
import ArticleCategory from '@/models/ArticleCategory';
import KnowledgeArticle from '@/models/KnowledgeArticle';
import PageLayout from '@/components/layout/PageLayout';
import { notFound } from 'next/navigation';
import { Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  await connectToDatabase();
  const slug = params.id;
  
  const category = await ArticleCategory.findOne({ slug, isActive: true }).lean();
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }
  
  return {
    title: `${category.name} | Lightning Hire Support`,
    description: category.description || `Browse all ${category.name} articles`,
  };
}

export default async function CategoryPage({ params }) {
  await connectToDatabase();
  const slug = params.id;
  
  // Get the category
  const category = await ArticleCategory.findOne({ 
    slug, 
    isActive: true 
  });
  
  if (!category) {
    notFound();
  }
  
  // Get articles in this category
  const articles = await KnowledgeArticle.find({
    category: category._id,
    status: 'published'
  })
  .sort({ publishedDate: -1 })
  .select('title slug shortDescription')
  .lean();
  
  return (
    <PageLayout>
      <Typography variant="h3" component="h1" gutterBottom>
        {category.name}
      </Typography>
      
      {category.description && (
        <Typography variant="body1" color="text.secondary" paragraph>
          {category.description}
        </Typography>
      )}
      
      {articles.length > 0 ? (
        <Grid container spacing={3} sx={{ mt: 4 }}>
          {articles.map((article) => (
            <Grid item xs={12} md={6} key={article._id}>
              <Card>
                <CardActionArea 
                  component={Link}
                  href={`/articles/${article.slug}`}
                >
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {article.shortDescription}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" sx={{ mt: 4 }}>
          No articles found in this category.
        </Typography>
      )}
    </PageLayout>
  );
}