// src/app/admin/chats/[id]/page.js
import { connectToDatabase } from '@/lib/mongoose';
import ChatConversation from '@/models/ChatConversation';
import ChatMessage from '@/models/ChatMessage';
import AdminDashboardWrapper from '@/components/admin/AdminDashboardWrapper';
import ChatDetail from '@/components/admin/ChatDetail';
import { 
  Typography, 
  Box,
  Button,
  Paper
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Helper function to convert MongoDB documents to plain objects
function serializeData(data) {
  return JSON.parse(JSON.stringify(data));
}

export default async function ChatDetailPage({ params }) {
  const { id } = params;
  
  await connectToDatabase();
  
  // Get conversation
  const conversationRaw = await ChatConversation.findById(id).lean();
  
  if (!conversationRaw) {
    notFound();
  }
  
  // Serialize MongoDB document to plain object
  const conversation = serializeData(conversationRaw);
  
  // Get messages
  const messagesRaw = await ChatMessage.find({ conversationId: id })
    .sort({ createdAt: 1 })
    .lean();
  
  // Serialize MongoDB documents to plain objects
  const messages = serializeData(messagesRaw);
  
  return (
    <AdminDashboardWrapper>
      <Box sx={{ mb: 3 }}>
        <Button 
          component={Link}
          href="/admin/chats"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Back to Chat History
        </Button>
      </Box>
      
      <Typography variant="h4" component="h1" gutterBottom>
        Conversation Details
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: 2, rowGap: 1 }}>
          <Typography variant="subtitle2">ID:</Typography>
          <Typography variant="body1">{conversation._id.toString()}</Typography>
          
          <Typography variant="subtitle2">Title:</Typography>
          <Typography variant="body1">{conversation.title}</Typography>
          
          <Typography variant="subtitle2">Session ID:</Typography>
          <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{conversation.sessionId}</Typography>
          
          <Typography variant="subtitle2">Status:</Typography>
          <Typography variant="body1">{conversation.status}</Typography>
          
          <Typography variant="subtitle2">Created:</Typography>
          <Typography variant="body1">{new Date(conversation.createdAt).toLocaleString()}</Typography>
          
          <Typography variant="subtitle2">Last Message:</Typography>
          <Typography variant="body1">{new Date(conversation.lastMessageAt).toLocaleString()}</Typography>
          
          <Typography variant="subtitle2">User Agent:</Typography>
          <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{conversation.metadata?.userAgent || 'N/A'}</Typography>
          
          <Typography variant="subtitle2">IP Address:</Typography>
          <Typography variant="body1">{conversation.metadata?.ipAddress || 'N/A'}</Typography>
          
          <Typography variant="subtitle2">Referrer:</Typography>
          <Typography variant="body1">{conversation.metadata?.referrer || 'N/A'}</Typography>
        </Box>
      </Paper>
      
      <Typography variant="h5" gutterBottom>
        Messages ({messages.length})
      </Typography>
      
      <ChatDetail messages={messages} />
    </AdminDashboardWrapper>
  );
}