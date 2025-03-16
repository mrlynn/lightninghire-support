// src/app/(admin)/admin/categories/page.js
import { connectToDatabase } from '@/lib/mongoose';
import ArticleCategory from '@/models/ArticleCategory';
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

export default async function AdminCategoriesPage() {
  await connectToDatabase();
  
  // Get all categories
  const categories = await ArticleCategory.find()
    .sort({ order: 1, name: 1 })
    .lean();
  
  return (
    <AdminDashboardWrapper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Article Categories
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          component={Link}
          href="/admin/categories/new"
        >
          Create Category
        </Button>
      </Box>
      
      {/* Categories table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category._id.toString()}>
                  <TableCell>
                    <Typography variant="subtitle2" component="div">
                      {category.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>
                    {category.description ? (
                      <Typography variant="body2" color="text.secondary">
                        {category.description?.substring(0, 80)}
                        {category.description?.length > 80 ? '...' : ''}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        No description
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{category.order}</TableCell>
                  <TableCell>
                    <Chip 
                      label={category.isActive ? 'Active' : 'Inactive'} 
                      color={category.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      component={Link}
                      href={`/admin/categories/${category._id.toString()}/edit`}
                      color="primary"
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      component={Link}
                      href={`/admin/categories/${category._id.toString()}/delete`}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No categories found
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