// src/app/(knowledge-base)/articles/[slug]/page.js
import { connectToDatabase } from '@/lib/mongoose';
import KnowledgeArticle from '@/models/KnowledgeArticle';
import ArticleCategory from '@/models/ArticleCategory';
import PageLayout from '@/components/layout/PageLayout';
import User from '@/models/User'; // This should point to src/models/User.js

import { notFound } from 'next/navigation';
import {
    Box,
    Typography,
    Breadcrumbs,
    Link as MuiLink,
    Divider,
    Paper,
    Chip,
    Grid,
    Card,
    CardContent,
    CardActionArea
} from '@mui/material';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import ArticleFeedback from '@/components/knowledge-base/ArticleFeedback';
import RelatedArticles from '@/components/knowledge-base/RelatedArticles';

// Generate metadata for the page
export async function generateMetadata({ params }) {
    await connectToDatabase();
    const slug = params.id;

    const article = await KnowledgeArticle.findOne({
        slug,
        status: 'published'
    }).lean();

    if (!article) {
        return {
            title: 'Article Not Found',
        };
    }

    return {
        title: `${article.title} | LightningHire Support`,
        description: article.shortDescription,
        openGraph: {
            title: article.title,
            description: article.shortDescription,
            type: 'article'
        }
    };
}

export default async function ArticlePage({ params }) {
    await connectToDatabase();
    const slug = params.id;
    
    // Get the article
    const article = await KnowledgeArticle.findOne({
        slug,
        status: 'published'
    })
        .populate('category', 'name slug')
        .populate('author', 'name')
        .lean();

    if (!article) {
        notFound();
    }

    // Get related articles
    const relatedArticles = await KnowledgeArticle.find({
        _id: { $ne: article._id },
        category: article.category?._id,
        status: 'published'
    })
        .sort({ viewCount: -1 })
        .limit(3)
        .select('title slug shortDescription')
        .lean();

    // Find similar articles if we have less than 3 in the same category
    if (relatedArticles.length < 3) {
        const similarByTags = await KnowledgeArticle.find({
            _id: { $ne: article._id },
            tags: { $in: article.tags || [] },
            status: 'published'
        })
            .sort({ viewCount: -1 })
            .limit(3 - relatedArticles.length)
            .select('title slug shortDescription')
            .lean();

        relatedArticles.push(...similarByTags);
    }

    // Format the date
    const formattedDate = article.publishedDate
        ? format(new Date(article.publishedDate), 'MMMM d, yyyy')
        : 'Unpublished';

    return (
        <PageLayout>
            <Box sx={{ mb: 4 }}>
                {/* Breadcrumbs navigation */}
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <MuiLink component={Link} color="inherit" href="/">
                        Home
                    </MuiLink>
                    <MuiLink component={Link} color="inherit" href="/articles">
                        Articles
                    </MuiLink>
                    {article.category && (
                        <MuiLink
                            component={Link}
                            color="inherit"
                            href={`/categories/${article.category.slug}`}
                        >
                            {article.category.name}
                        </MuiLink>
                    )}
                    <Typography color="text.primary">{article.title}</Typography>
                </Breadcrumbs>

                {/* Article header */}
                <Typography variant="h3" component="h1" gutterBottom>
                    {article.title}
                </Typography>

                <Box sx={{ display: 'flex', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    {article.category && (
                        <Chip
                            label={article.category.name}
                            component={Link}
                            href={`/categories/${article.category.slug}`}
                            clickable
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                        />
                    )}

                    {article.tags && article.tags.map(tag => (
                        <Chip
                            key={tag}
                            label={tag}
                            component={Link}
                            href={`/search?tag=${encodeURIComponent(tag)}`}
                            clickable
                            variant="outlined"
                            size="small"
                            sx={{ mr: 1 }}
                        />
                    ))}
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: 'text.secondary',
                        mb: 3,
                        fontSize: '0.875rem'
                    }}
                >
                    <Typography variant="body2">
                        {article.author ? `By ${article.author.name}` : 'By LightningHire Team'}
                    </Typography>

                    <Typography variant="body2">
                        Published: {formattedDate}
                    </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Article content */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        mb: 4
                    }}
                >
                    <Box className="markdown-content" sx={{
                        '& img': {
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: 1,
                            my: 2
                        },
                        '& h1': { mt: 4, mb: 2, fontSize: '2rem' },
                        '& h2': { mt: 3, mb: 2, fontSize: '1.75rem' },
                        '& h3': { mt: 3, mb: 1.5, fontSize: '1.5rem' },
                        '& p': { mb: 2, lineHeight: 1.7 },
                        '& a': { color: 'primary.main' },
                        '& blockquote': {
                            borderLeft: '4px solid',
                            borderColor: 'primary.light',
                            pl: 2,
                            py: 0.5,
                            my: 2,
                            bgcolor: 'grey.50',
                            borderRadius: 1
                        },
                        '& pre': {
                            bgcolor: 'grey.900',
                            color: 'common.white',
                            p: 2,
                            borderRadius: 1,
                            overflowX: 'auto'
                        },
                        '& code': {
                            bgcolor: 'grey.100',
                            px: 0.5,
                            borderRadius: 0.5,
                            fontFamily: 'monospace'
                        },
                        '& ul, & ol': {
                            pl: 3,
                            mb: 2
                        },
                        '& li': {
                            mb: 1
                        },
                        '& table': {
                            borderCollapse: 'collapse',
                            width: '100%',
                            mb: 3
                        },
                        '& th, & td': {
                            border: '1px solid',
                            borderColor: 'grey.300',
                            p: 1.5
                        },
                        '& th': {
                            bgcolor: 'grey.100',
                            fontWeight: 'bold'
                        }
                    }}>
                        <ReactMarkdown>
                            {article.content}
                        </ReactMarkdown>
                    </Box>
                </Paper>

                {/* Article feedback */}
                <ArticleFeedback articleId={article._id.toString()} />

                {/* Related articles */}
                {relatedArticles.length > 0 && (
                    <Box sx={{ mt: 6 }}>
                        <Typography variant="h5" component="h2" gutterBottom>
                            Related Articles
                        </Typography>
                        <Grid container spacing={3}>
                            {relatedArticles.map((relatedArticle, index) => (
                                <Grid item xs={12} md={4} key={`${relatedArticle._id}-${index}`}>
                                    <Card variant="outlined">
                                        <CardActionArea
                                            component={Link}
                                            href={`/articles/${relatedArticle.slug}`}
                                        >
                                            <CardContent>
                                                <Typography variant="h6" component="h3" gutterBottom>
                                                    {relatedArticle.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {relatedArticle.shortDescription}
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}
            </Box>
        </PageLayout>
    );
}