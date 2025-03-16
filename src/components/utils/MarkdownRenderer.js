import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { Box } from '@mui/material';

const MarkdownRenderer = ({ content }) => {
  return (
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
      <ReactMarkdown
        components={{
          a: ({ href, children }) => {
            // Handle internal links differently (for routing)
            if (href.startsWith('/')) {
              return (
                <a href={href}>{children}</a>
              );
            }
            // External links
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownRenderer; 