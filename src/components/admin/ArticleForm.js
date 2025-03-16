// src/components/admin/ArticleForm.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Tab, 
  Tabs, 
  Autocomplete, 
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { Save, Preview, Publish } from '@mui/icons-material';

export default function ArticleForm({ categories = [], initialData = null, allTags = [] }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [tags, setTags] = useState(initialData?.tags || []);
  const [status, setStatus] = useState(initialData?.status || 'draft');
  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Generate slug from title automatically
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Only auto-generate slug if it hasn't been manually edited or is empty
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle));
    }
  };
  
  // Slug generator function
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
      .trim();
  };
  
  const handleSubmit = async (publishStatus) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare article data
      const articleData = {
        title,
        slug,
        content,
        shortDescription,
        category,
        tags,
        status: publishStatus || status
      };
      
      // Validate required fields
      if (!title || !slug || !shortDescription || !content || !category) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }
      
      // Use the appropriate API endpoint
      const url = initialData ? `/api/articles/${initialData._id}` : '/api/articles';
      const method = initialData ? 'PUT' : 'POST';
      
      // Send API request
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save article');
      }
      
      // Success handling
      if (publishStatus === 'published') {
        setSuccessMessage('Article published successfully!');
      } else {
        setSuccessMessage('Article saved as draft');
      }
      
      // Redirect after a delay
      setTimeout(() => {
        router.push('/admin/articles');
        router.refresh();
      }, 1500);
      
    } catch (err) {
      console.error('Error saving article:', err);
      setError(err.message || 'Failed to save article');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>
      
      <TextField
        label="Title"
        value={title}
        onChange={handleTitleChange}
        fullWidth
        variant="outlined"
        required
      />
      
      <TextField
        label="Slug"
        value={slug}
        onChange={(e) => setSlug(generateSlug(e.target.value))}
        fullWidth
        variant="outlined"
        required
        helperText="URL-friendly identifier for this article"
      />
      
      <TextField
        label="Short Description"
        value={shortDescription}
        onChange={(e) => setShortDescription(e.target.value)}
        fullWidth
        variant="outlined"
        multiline
        rows={2}
        required
        inputProps={{ maxLength: 250 }}
        helperText={`${shortDescription.length}/250 characters`}
      />
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControl fullWidth required>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            label="Category"
          >
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Autocomplete
        multiple
        options={Array.from(new Set([...allTags, ...tags]))}
        freeSolo
        value={tags}
        onChange={(e, newValue) => setTags(newValue)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const tagProps = getTagProps({ index });
            const { key, ...otherTagProps } = tagProps;
            return (
              <Chip key={key} label={option} {...otherTagProps} />
            );
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Tags"
            placeholder="Add tags..."
          />
        )}
      />
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="Edit" />
          <Tab label="Preview" />
        </Tabs>
        
        {activeTab === 0 ? (
          <TextField
            label="Content (Markdown)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            variant="outlined"
            multiline
            rows={20}
            required
          />
        ) : (
          <Paper
            variant="outlined"
            sx={{ 
              p: 3, 
              maxHeight: '600px', 
              overflow: 'auto',
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
            }}
          >
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                No content to preview
              </Box>
            )}
          </Paper>
        )}
      </Paper>
      
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<Preview />}
          onClick={() => setActiveTab(1)}
          disabled={!content}
        >
          Preview
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Save />}
          onClick={() => handleSubmit('draft')}
          disabled={isSubmitting}
        >
          Save Draft
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<Publish />}
          onClick={() => handleSubmit('published')}
          disabled={isSubmitting || !title || !slug || !content || !shortDescription || !category}
        >
          {initialData?.status === 'published' ? 'Update' : 'Publish'}
        </Button>
      </Box>
    </Box>
  );
}