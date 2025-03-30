import { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  CircularProgress,
  Fab,
  Tooltip,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import { getAIResponse, startSpeechRecognition, textToSpeech } from '../services/aiService';

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await getAIResponse(inputMessage);
      const aiMessage = {
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      
      // Convert AI response to speech
      await textToSpeech(aiResponse);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleVoiceInput = async () => {
    if (!isListening) {
      setIsListening(true);
      try {
        const transcript = await startSpeechRecognition();
        setInputMessage(transcript);
      } catch (error) {
        console.error('Speech recognition error:', error);
        setError('Speech recognition failed. Please try typing your message.');
      } finally {
        setIsListening(false);
      }
    } else {
      setIsListening(false);
    }
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="AI Assistant"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <CloseIcon /> : <SmartToyIcon />}
      </Fab>

      {isOpen && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            width: 350,
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
          }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <SmartToyIcon />
            <Typography variant="h6">AI Assistant</Typography>
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
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    maxWidth: '80%',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <Typography variant="body2">{message.text}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      opacity: 0.7,
                    }}
                  >
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'grey.100',
                  }}
                >
                  <CircularProgress size={20} />
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              gap: 1,
            }}
          >
            <Tooltip title={isListening ? 'Stop Voice Input' : 'Start Voice Input'}>
              <IconButton
                color={isListening ? 'error' : 'primary'}
                onClick={toggleVoiceInput}
                disabled={isLoading}
              >
                {isListening ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
            </Tooltip>
            <TextField
              fullWidth
              size="small"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
}

export default AIAssistant; 