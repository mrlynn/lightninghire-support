// src/components/chat/FloatingChatbot.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Fab, 
  Paper, 
  TextField, 
  Typography, 
  Avatar, 
  IconButton,
  CircularProgress,
  Divider,
  Tooltip,
  Button,
  Collapse,
  Alert,
  Chip
} from '@mui/material';
import { 
  Send as SendIcon, 
  Close as CloseIcon, 
  ChatBubbleOutline as ChatIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { v4 as uuidv4 } from 'uuid';
import NextLink from 'next/link';
import MarkdownRenderer from '../utils/MarkdownRenderer';

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSource, setExpandedSource] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize session ID from local storage or create new one
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chatSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      
      // Load existing conversation if available
      const storedConversationId = localStorage.getItem('chatConversationId');
      if (storedConversationId) {
        setConversationId(storedConversationId);
        loadConversationHistory(storedConversationId);
      }
    } else {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversationHistory = async (convoId) => {
    try {
      const response = await fetch(`/api/chat/conversations/${convoId}`);
      const data = await response.json();
      
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error loading conversation history:', err);
      // If we can't load history, just start fresh
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Call backend RAG endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          sessionId,
          conversationId
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Check if the error is about conversation not found
        if (data.message && data.message.includes('Conversation not found')) {
          // Clear the stored conversationId and retry without it
          localStorage.removeItem('chatConversationId');
          setConversationId(null);
          
          // Make a second attempt without the conversationId
          const retryResponse = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              message: input,
              sessionId
            })
          });
          
          const retryData = await retryResponse.json();
          
          if (!retryResponse.ok) {
            throw new Error(retryData.message || 'Error generating response');
          }
          
          // Save the new conversation ID
          if (retryData.conversationId) {
            setConversationId(retryData.conversationId);
            localStorage.setItem('chatConversationId', retryData.conversationId);
          }
          
          // Add assistant response
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: retryData.answer,
            sources: retryData.sources || []
          }]);
          
          return; // Exit early since we've handled the response
        }
        
        throw new Error(data.message || 'Error generating response');
      }
      
      // Save conversation ID if this is a new conversation
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
        localStorage.setItem('chatConversationId', data.conversationId);
      }
      
      // Add assistant response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer,
        sources: data.sources || []
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setError(error.message || 'Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleSourceExpand = (sourceId) => {
    if (expandedSource === sourceId) {
      setExpandedSource(null);
    } else {
      setExpandedSource(sourceId);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleFeedback = async (messageIndex, isPositive) => {
    // Implement feedback functionality
    try {
      await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          conversationId,
          messageIndex,
          isPositive
        })
      });
      
      // Update UI to show feedback was received
      const updatedMessages = [...messages];
      if (!updatedMessages[messageIndex].feedback) {
        updatedMessages[messageIndex].feedback = {};
      }
      updatedMessages[messageIndex].feedback.isPositive = isPositive;
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };
  
  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      {isOpen ? (
        <Paper 
          elevation={3} 
          sx={{ 
            width: { xs: '90vw', sm: 400 }, 
            height: 500, 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {/* Chat header */}
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'primary.main', 
              color: 'white', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <OfflineBoltIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Bolt</Typography>
            </Box>
            <IconButton color="inherit" onClick={() => setIsOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* Messages area */}
          <Box 
            sx={{ 
              flexGrow: 1, 
              p: 2, 
              overflowY: 'auto',
              bgcolor: (theme) => theme.palette.grey[50]
            }}
          >
            {messages.length === 0 ? (
              <Box 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  textAlign: 'center',
                  px: 3
                }}
              >
                <OfflineBoltIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Welcome to Bolt
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Ask me anything about using LightningHire for AI-powered resume evaluation.
                </Typography>
              </Box>
            ) : (
              messages.map((msg, i) => (
                <Box 
                  key={i} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2 
                  }}
                >
                  {msg.role === 'assistant' && (
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                      <OfflineBoltIcon />
                    </Avatar>
                  )}
                  <Box 
                    sx={{ 
                      maxWidth: '80%',
                    }}
                  >
                    <Paper 
                      elevation={1}
                      sx={{ 
                        p: 2, 
                        bgcolor: msg.role === 'user' ? 'primary.light' : 'background.paper',
                        color: msg.role === 'user' ? 'white' : 'text.primary',
                        borderRadius: msg.role === 'user' 
                          ? '12px 12px 0 12px' 
                          : '12px 12px 12px 0'
                      }}
                    >
                      {msg.role === 'user' ? (
                        <Typography 
                          variant="body1"
                          sx={{ 
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }}
                        >
                          {msg.content}
                        </Typography>
                      ) : (
                        <Box 
                          className="markdown-content" 
                          sx={{
                            '& p': { mt: 0, mb: 1 },
                            '& h1, & h2, & h3, & h4, & h5, & h6': { 
                              mt: 2, 
                              mb: 1,
                              fontWeight: 'bold',
                              lineHeight: 1.2
                            },
                            '& h1': { fontSize: '1.5rem' },
                            '& h2': { fontSize: '1.3rem' },
                            '& h3': { fontSize: '1.1rem' },
                            '& h4, & h5, & h6': { fontSize: '1rem' },
                            '& ul, & ol': { pl: 2, mb: 1 },
                            '& li': { mb: 0.5 },
                            '& a': { 
                              color: 'primary.main',
                              textDecoration: 'none',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            },
                            '& blockquote': {
                              borderLeft: '3px solid',
                              borderColor: 'grey.300',
                              pl: 1,
                              ml: 1,
                              color: 'text.secondary'
                            },
                            '& code': {
                              bgcolor: 'grey.100',
                              px: 0.5,
                              py: 0.25,
                              borderRadius: 0.5,
                              fontFamily: 'monospace',
                              fontSize: '0.85em'
                            },
                            '& pre': {
                              bgcolor: 'grey.100',
                              p: 1,
                              borderRadius: 1,
                              overflow: 'auto'
                            },
                            '& hr': {
                              height: '1px',
                              bgcolor: 'grey.300',
                              border: 'none',
                              my: 1
                            }
                          }}
                        >
                          <MarkdownRenderer 
                            content={msg.content}
                          />
                        </Box>
                      )}
                    </Paper>
                    
                    {/* Sources and feedback for assistant messages */}
                    {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                      <Box sx={{ mt: 1, ml: 1 }}>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            cursor: 'pointer',
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            '&:hover': { color: 'primary.main' }
                          }}
                          onClick={() => handleToggleSourceExpand(i)}
                        >
                          {expandedSource === i ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                          <Typography variant="caption">
                            {expandedSource === i ? 'Hide sources' : 'Show sources'}
                          </Typography>
                        </Box>
                        
                        <Collapse in={expandedSource === i}>
                          <Box sx={{ mt: 1, pl: 1, borderLeft: '2px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                              Sources:
                            </Typography>
                            {msg.sources.map((source, idx) => (
                              <Box key={idx} sx={{ mt: 0.5 }}>
                                <NextLink href={`/articles/${source.slug || source.articleId}`} passHref>
                                  <Chip
                                    component="a"
                                    label={source.title}
                                    size="small"
                                    clickable
                                    color="primary"
                                    variant="outlined"
                                  />
                                </NextLink>
                              </Box>
                            ))}
                          </Box>
                        </Collapse>
                        
                        {/* Feedback buttons */}
                        <Box 
                          sx={{ 
                            mt: 1, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1
                          }}
                        >
                          <Tooltip title="Helpful">
                            <IconButton 
                              size="small" 
                              onClick={() => handleFeedback(i, true)}
                              color={msg.feedback?.isPositive === true ? 'primary' : 'default'}
                            >
                              <ThumbUpIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Not helpful">
                            <IconButton 
                              size="small" 
                              onClick={() => handleFeedback(i, false)}
                              color={msg.feedback?.isPositive === false ? 'error' : 'default'}
                            >
                              <ThumbDownIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    )}
                  </Box>
                  
                  {msg.role === 'user' && (
                    <Avatar 
                      sx={{ 
                        bgcolor: 'secondary.main', 
                        ml: 1 
                      }}
                    >
                      <AccountCircleIcon />
                    </Avatar>
                  )}
                </Box>
              ))
            )}
            
            {/* Show error message if any */}
            {error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  my: 2
                }}
              >
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Thinking...
                </Typography>
              </Box>
            )}
            
            {/* Invisible element for scrolling to bottom */}
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Input area */}
          <Divider />
          <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={4}
              InputProps={{
                endAdornment: (
                  <IconButton 
                    color="primary" 
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    sx={{ ml: 1 }}
                  >
                    <SendIcon />
                  </IconButton>
                ),
              }}
              disabled={isLoading}
            />
          </Box>
        </Paper>
      ) : (
        <Tooltip title="Chat with Bolt">
          <Fab 
            color="primary" 
            aria-label="chat"
            onClick={() => setIsOpen(true)}
            sx={{ boxShadow: 3 }}
          >
            <OfflineBoltIcon />
          </Fab>
        </Tooltip>
      )}
    </Box>
  );
}