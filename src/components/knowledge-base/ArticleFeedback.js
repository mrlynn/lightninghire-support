'use client';

import { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  TextField, 
  Stack, 
  Collapse, 
  Fade, 
  IconButton 
} from '@mui/material';
import { 
  ThumbUpAlt as ThumbUpIcon, 
  ThumbDownAlt as ThumbDownIcon, 
  ThumbUp as ThumbUpOutlineIcon, 
  ThumbDown as ThumbDownOutlineIcon, 
  Send as SendIcon, 
  Close as CloseIcon 
} from '@mui/icons-material';

export default function ArticleFeedback({ articleId }) {
  const [feedback, setFeedback] = useState(null); // null, 'helpful', 'unhelpful'
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleFeedback = async (isHelpful) => {
    // Set feedback
    setFeedback(isHelpful ? 'helpful' : 'unhelpful');
    
    try {
      // Submit basic helpful/unhelpful feedback
      const response = await fetch(`/api/articles/${articleId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isHelpful
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      
      // Show feedback form for unhelpful responses
      if (!isHelpful) {
        setShowFeedbackForm(true);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitError('Failed to submit feedback. Please try again.');
    }
  };

  const handleSubmitFeedbackText = async () => {
    if (!feedbackText.trim()) return;
    
    try {
      const response = await fetch(`/api/articles/${articleId}/feedback/detail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackText,
          isHelpful: feedback === 'helpful'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit detailed feedback');
      }

      // Show success
      setSubmitted(true);
      setShowFeedbackForm(false);
    } catch (error) {
      console.error('Error submitting detailed feedback:', error);
      setSubmitError('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{ 
        p: 3, 
        borderRadius: 2,
        bgcolor: 'grey.50',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      {!submitted ? (
        <>
          <Typography variant="h6" gutterBottom>
            Was this article helpful?
          </Typography>
          
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant={feedback === 'helpful' ? 'contained' : 'outlined'}
              color="primary"
              startIcon={feedback === 'helpful' ? <ThumbUpIcon /> : <ThumbUpOutlineIcon />}
              onClick={() => handleFeedback(true)}
              disabled={submitted}
              sx={{ borderRadius: 4 }}
            >
              Yes, it helped
            </Button>
            
            <Button
              variant={feedback === 'unhelpful' ? 'contained' : 'outlined'}
              color="secondary"
              startIcon={feedback === 'unhelpful' ? <ThumbDownIcon /> : <ThumbDownOutlineIcon />}
              onClick={() => handleFeedback(false)}
              disabled={submitted}
              sx={{ borderRadius: 4 }}
            >
              No, it didn't help
            </Button>
          </Stack>
          
          <Collapse in={showFeedbackForm}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Please let us know how we can improve this article:
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                placeholder="What information was missing or unclear?"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button 
                  variant="text" 
                  onClick={() => setShowFeedbackForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={handleSubmitFeedbackText}
                  disabled={!feedbackText.trim()}
                >
                  Submit Feedback
                </Button>
              </Stack>
            </Box>
          </Collapse>
          
          {submitError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {submitError}
            </Typography>
          )}
        </>
      ) : (
        <Fade in>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Thank you for your feedback!
            </Typography>
            <Typography variant="body2">
              We appreciate your input and will use it to improve our documentation.
            </Typography>
          </Box>
        </Fade>
      )}
    </Paper>
  );
}