import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function ChatRoom({ discussionId }) {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch messages using React Query
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', discussionId],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return [
        {
          id: '1',
          text: 'Hello everyone! Welcome to the discussion.',
          sender: {
            id: '1',
            name: 'John Doe',
            avatar: 'https://i.pravatar.cc/150?img=1',
          },
          timestamp: '2024-03-15T10:00:00Z',
        },
        {
          id: '2',
          text: 'Thanks for joining! Feel free to ask any questions.',
          sender: {
            id: '2',
            name: 'Jane Smith',
            avatar: 'https://i.pravatar.cc/150?img=2',
          },
          timestamp: '2024-03-15T10:01:00Z',
        },
      ];
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        id: Date.now().toString(),
        text: newMessage,
        sender: {
          id: currentUser.uid,
          name: currentUser.displayName,
          avatar: currentUser.photoURL,
        },
        timestamp: new Date().toISOString(),
      };
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData(['messages', discussionId], (oldData) => [
        ...(oldData || []),
        newMessage,
      ]);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
    setMessage('');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Discussion</Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages?.map((msg) => (
          <ListItem
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: msg.sender.id === currentUser?.uid ? 'row-reverse' : 'row',
            }}
          >
            <ListItemAvatar>
              <Avatar src={msg.sender.avatar} />
            </ListItemAvatar>
            <Box
              sx={{
                maxWidth: '70%',
                bgcolor: msg.sender.id === currentUser?.uid ? 'primary.main' : 'grey.100',
                color: msg.sender.id === currentUser?.uid ? 'white' : 'text.primary',
                borderRadius: 2,
                p: 1.5,
              }}
            >
              <Typography variant="body2">{msg.text}</Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  opacity: 0.7,
                }}
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Typography>
            </Box>
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!message.trim() || sendMessageMutation.isLoading}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}

export default ChatRoom; 