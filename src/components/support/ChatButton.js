'use client';

import { Button } from '@mui/material';

export default function ChatButton() {
  const handleChatClick = () => {
    // TODO: Implement chat functionality
    console.log('Chat button clicked');
    // This could open a chat modal, redirect to a chat page, etc.
  };

  return (
    <Button
      variant="outlined"
      onClick={handleChatClick}
    >
      Start Chat
    </Button>
  );
} 