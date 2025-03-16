// src/components/admin/ArticleEditor.js
'use client';

import { useState, useEffect } from 'react';
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
  MenuItem
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { Save, Preview, Publish } from '@mui/icons-material';

export default function ArticleEditor({ article, categories, onSave }) {
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [shortDescription, setShortDescription] = useState(article?.shortDescription || '');
  const [category, setCategory] = useState(article?.category || null);
  const [tags, setTags] = useState(article?.tags || []);
  const [status, setStatus] = useState(article?.status || 'draft');
  const [activeTab, setActiveTab] = useState(0);
  const [availableTags, setAvailableTags] = useState([]);
  
  // Fetch available tags
  useEffect(() => {
    const fetchTags = async () => {
      const response = await fetch('/api/tags');
      const data = await response.json();
      setAvailableTags(data.tags);
    };
    
    fetchTags();
  }, []);
  
  const handleSave = async () => {
    const articleData = {
      title,
      content,
      shortDescription,
      category,
      tags,
      status
    };
    
    await onSave(articleData);
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        variant="outlined"
        required
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
      />
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControl fullWidth>
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
        options={availableTags}
        freeSolo
        value={tags}
        onChange={(e, newValue) => setTags(newValue)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip label={option} {...getTagProps({ index })} />
          ))
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
            sx={{ p: 3, maxHeight: '600px', overflow: 'auto' }}
          >
            <ReactMarkdown>{content}</ReactMarkdown>
          </Paper>
        )}
      </Paper>
      
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<Preview />}
          onClick={() => setActiveTab(1)}
        >
          Preview
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Save />}
          onClick={() => handleSave({ ...article, title, content, shortDescription, category, tags, status })}
        >
          Save Draft
        </Button>
        
        <Button
          variant="contained"
          startIcon={<Publish />}
          onClick={() => handleSave({ ...article, title, content, shortDescription, category, tags, status: 'published' })}
          disabled={!title || !content || !shortDescription || !category}
        >
          Publish
        </Button>
      </Box>
    </Box>
  );
}