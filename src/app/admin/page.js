// src/app/(admin)/admin/page.js
import { connectToDatabase } from '@/lib/mongoose';
import KnowledgeArticle from '@/models/KnowledgeArticle';
import ArticleCategory from '@/models/ArticleCategory';
import ChatConversation from '@/models/ChatConversation';
import { redirect } from 'next/navigation';
import AdminDashboardWrapper from '@/components/admin/AdminDashboardWrapper';
import { 
  Typography, 
  Box,
  Paper,
  Divider,
  Grid
} from '@mui/material';

export default async function AdminDashboard() {
  // For now, we'll skip authentication checks
  // In a real environment, you would check user session here
  
  await connectToDatabase();
  
  // Get stats
  const stats = {
    articles: {
      total: await KnowledgeArticle.countDocuments() || 0,
      published: await KnowledgeArticle.countDocuments({ status: 'published' }) || 0,
      draft: await KnowledgeArticle.countDocuments({ status: 'draft' }) || 0,
      archived: await KnowledgeArticle.countDocuments({ status: 'archived' }) || 0
    },
    categories: {
      total: await ArticleCategory.countDocuments() || 0,
      active: await ArticleCategory.countDocuments({ isActive: true }) || 0
    },
    chats: {
      total: await ChatConversation.countDocuments() || 0,
      active: await ChatConversation.countDocuments({ status: 'active' }) || 0,
      // Last 30 days
      last30Days: await ChatConversation.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }) || 0
    }
  };
  
  // Get recent articles
  const recentArticles = await KnowledgeArticle.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title status createdAt slug')
    .lean() || [];
    
  // Get recent chats
  const recentChats = await ChatConversation.find()
    .sort({ lastMessageAt: -1 })
    .limit(5)
    .lean() || [];
  
  return (
    <AdminDashboardWrapper>
      <Typography variant="h4" component="h1" gutterBottom>
        Support Admin Dashboard
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Articles</Typography>
              <Typography variant="h3">{stats.articles.total}</Typography>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography>Published: {stats.articles.published}</Typography>
                <Typography>Draft: {stats.articles.draft}</Typography>
                <Typography>Archived: {stats.articles.archived}</Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Categories</Typography>
              <Typography variant="h3">{stats.categories.total}</Typography>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography>Active: {stats.categories.active}</Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Chats</Typography>
              <Typography variant="h3">{stats.chats.total}</Typography>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography>Active: {stats.chats.active}</Typography>
                <Typography>Last 30 days: {stats.chats.last30Days}</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Articles
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {recentArticles.length > 0 ? (
              <Box component="ul" sx={{ pl: 2 }}>
                {recentArticles.map((article) => (
                  <Box 
                    component="li" 
                    key={article._id}
                    sx={{ mb: 2 }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">
                        {article.title}
                      </Typography>
                      <Box 
                        sx={{ 
                          px: 1.5, 
                          py: 0.5, 
                          bgcolor: article.status === 'published' 
                            ? 'success.light' 
                            : article.status === 'draft' 
                              ? 'warning.light' 
                              : 'error.light',
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 'medium'
                        }}
                      >
                        {article.status?.toUpperCase() || 'UNKNOWN'}
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Created: {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'Unknown date'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No articles found.
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Support Chats
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {recentChats.length > 0 ? (
              <Box component="ul" sx={{ pl: 2 }}>
                {recentChats.map((chat) => (
                  <Box 
                    component="li" 
                    key={chat._id}
                    sx={{ mb: 2 }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">
                        {chat.title || 'Untitled Conversation'}
                      </Typography>
                      <Box 
                        sx={{ 
                          px: 1.5, 
                          py: 0.5, 
                          bgcolor: chat.status === 'active' ? 'info.light' : 'grey.300',
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 'medium'
                        }}
                      >
                        {chat.status?.toUpperCase() || 'UNKNOWN'}
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Last message: {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleString() : 'Unknown date'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent chats found.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </AdminDashboardWrapper>
  );
}