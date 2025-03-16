// src/components/admin/ChatDetail.js
'use client';

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Chip, 
  Divider,
  Link as MuiLink,
  Button,
  Collapse
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
  Computer as ComputerIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import Link from 'next/link';

export default function ChatDetail({ messages = [] }) {
  const [expandedMessage, setExpandedMessage] = useState(null);
  
  if (messages.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No messages found in this conversation.</Typography>
      </Paper>
    );
  }
  
  const toggleMessageDetails = (messageId) => {
    if (expandedMessage === messageId) {
      setExpandedMessage(null);
    } else {
      setExpandedMessage(messageId);
    }
  };
  
  const getRoleIcon = (role) => {
    switch(role) {
      case 'user':
        return <PersonIcon />;
      case 'assistant':
        return <ComputerIcon />;
      case 'system':
        return <InfoIcon />;
      default:
        return null;
    }
  };
  
  const getRoleColor = (role) => {
    switch(role) {
      case 'user':
        return 'primary.main';
      case 'assistant':
        return 'success.main';
      case 'system':
        return 'warning.main';
      default:
        return 'text.primary';
    }
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      {messages.map((message, index) => (
        <Paper 
          key={message._id || index} 
          sx={{ 
            p: 2, 
            mb: 2, 
            position: 'relative',
            borderLeft: 3,
            borderColor: getRoleColor(message.role)
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
            <Avatar sx={{ bgcolor: getRoleColor(message.role) }}>
              {getRoleIcon(message.role)}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', fontWeight: 'medium' }}>
                  {message.role}
                </Typography>
                
                <Typography variant="caption" color="text.secondary">
                  {new Date(message.createdAt).toLocaleString()}
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                {message.content}
              </Typography>
            </Box>
          </Box>
          
          {message.sources && message.sources.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2">Sources:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {message.sources.map((source, idx) => (
                  <Chip
                    key={idx}
                    label={source.title || `Source ${idx + 1}`}
                    component={source.articleId ? Link : 'span'}
                    href={source.articleId ? `/admin/articles/${source.articleId}` : undefined}
                    clickable={!!source.articleId}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
          
          <Button
            variant="text"
            size="small"
            sx={{ mt: 1 }}
            onClick={() => toggleMessageDetails(message._id)}
            endIcon={expandedMessage === message._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {expandedMessage === message._id ? 'Hide Details' : 'Show Details'}
          </Button>
          
          <Collapse in={expandedMessage === message._id}>
            <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Message Details:</Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: 2, rowGap: 1 }}>
                <Typography variant="caption">ID:</Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{message._id}</Typography>
                
                <Typography variant="caption">Role:</Typography>
                <Typography variant="caption">{message.role}</Typography>
                
                <Typography variant="caption">Timestamp:</Typography>
                <Typography variant="caption">{new Date(message.createdAt).toLocaleString()}</Typography>
                
                {message.metadata && (
                  <>
                    <Typography variant="caption">Tokens Used:</Typography>
                    <Typography variant="caption">{message.metadata.tokensUsed || 'N/A'}</Typography>
                    
                    <Typography variant="caption">Processing Time:</Typography>
                    <Typography variant="caption">
                      {message.metadata.processingTime ? `${message.metadata.processingTime}ms` : 'N/A'}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          </Collapse>
        </Paper>
      ))}
    </Box>
  );
}