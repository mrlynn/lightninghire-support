// src/app/admin/chats/page.js
import { connectToDatabase } from '@/lib/mongoose';
import ChatConversation from '@/models/ChatConversation';
import AdminDashboardWrapper from '@/components/admin/AdminDashboardWrapper';
import ChatHistoryTable from '@/components/admin/ChatHistoryTable';
import ChatFilterForm from '@/components/admin/ChatFilterForm';
import { 
  Typography, 
  Box
} from '@mui/material';

// Helper function to convert MongoDB documents to plain objects
function serializeData(data) {
  return JSON.parse(JSON.stringify(data));
}

export default async function AdminChatsPage({ searchParams }) {
  // Get query parameters for filtering and pagination
  const page = Number(searchParams?.page || 1);
  const limit = Number(searchParams?.limit || 10);
  const search = searchParams?.search || '';
  const status = searchParams?.status || 'all';
  const dateFrom = searchParams?.dateFrom || '';
  const dateTo = searchParams?.dateTo || '';
  
  await connectToDatabase();
  
  // Build query
  const query = {};
  
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }
  
  if (status !== 'all') {
    query.status = status;
  }
  
  // Date filtering
  if (dateFrom || dateTo) {
    query.createdAt = {};
    
    if (dateFrom) {
      query.createdAt.$gte = new Date(dateFrom);
    }
    
    if (dateTo) {
      // Add one day to include the end date fully
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt.$lte = endDate;
    }
  }
  
  // Get conversations with pagination
  const skip = (page - 1) * limit;
  
  const conversationsRaw = await ChatConversation.find(query)
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  // Serialize MongoDB documents to plain objects
  const conversations = serializeData(conversationsRaw);
  
  // Get total count for pagination
  const total = await ChatConversation.countDocuments(query);
  
  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'closed', label: 'Closed' }
  ];
  
  return (
    <AdminDashboardWrapper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Chat History
        </Typography>
      </Box>
      
      {/* Use client component for filters */}
      <ChatFilterForm
        initialSearch={search}
        initialStatus={status}
        initialDateFrom={dateFrom}
        initialDateTo={dateTo}
        statusOptions={statusOptions}
      />
      
      {/* Use client component for the table */}
      <ChatHistoryTable 
        conversations={conversations} 
        totalConversations={total}
        initialPage={page - 1} 
        initialLimit={limit}
      />
    </AdminDashboardWrapper>
  );
}