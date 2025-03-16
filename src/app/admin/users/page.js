// src/app/(admin)/admin/users/page.js
import { connectToDatabase } from '@/lib/mongoose';
import User from '@/models/User';
import AdminDashboardWrapper from '@/components/admin/AdminDashboardWrapper';
import { 
  Typography, 
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Switch
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon
} from '@mui/icons-material';
import Link from 'next/link';

export default async function AdminUsersPage() {
  await connectToDatabase();
  
  // Get all users
  const users = await User.find()
    .sort({ createdAt: -1 })
    .lean();
  
  return (
    <AdminDashboardWrapper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Users
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          component={Link}
          href="/admin/users/new"
        >
          Create User
        </Button>
        
      </Box>
      
      {/* Users table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id.toString()}>
                  <TableCell>
                    <Typography variant="subtitle2" component="div">
                      {user.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.role ? (
                      <Typography variant="body2" color="text.secondary">
                        {user.role}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        No description
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.isActive ? 'Active' : 'Inactive'} 
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      component={Link}
                      href={`/admin/users/${user._id.toString()}/edit`}
                      color="primary"
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      component={Link}
                      href={`/admin/users/${user._id.toString()}/delete`}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </AdminDashboardWrapper>
  );
}