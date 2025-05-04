import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Divider,
} from '@mui/material';

const ConnectNGOs = () => {
  const navigate = useNavigate();
  const [representatives, setRepresentatives] = useState([]);
  const [selectedRep, setSelectedRep] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  // Extract userId from localStorage at component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      setError('Please log in to access messaging');
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      const extractedUserId = user._id || user.id;
      if (!extractedUserId) {
        throw new Error('User ID not found in stored user data.');
      }
      setUserId(extractedUserId);
    } catch (err) {
      console.error('Error parsing user data:', err);
      setError('Invalid user data: ' + err.message + ' Please log in again.');
      navigate('/login');
    }
  }, [navigate]);

  // Fetch list of organization representatives
  useEffect(() => {
    if (!userId) return; // Wait until userId is set

    const fetchRepresentatives = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to access messaging');
        navigate('/login');
        return;
      }

      try {
        console.log('Fetching representatives with token:', token);
        const response = await fetch('http://localhost:5000/api/messages/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log('Conversations response:', response.status, response.statusText);
        const data = await response.json();
        console.log('Conversations data:', data);
        if (response.ok) {
          setRepresentatives(data.conversations || []);
          setError(''); // Clear any existing error
        } else {
          setError(data.error || `Failed to fetch representatives (Status: ${response.status})`);
        }
      } catch (err) {
        setError('Network error while fetching representatives');
        console.error('Fetch representatives error:', err);
      }
    };

    fetchRepresentatives();
  }, [navigate, userId]);

  // Fetch conversation when a representative is selected
  useEffect(() => {
    if (!selectedRep || !userId) return;

    const fetchConversation = async () => {
      const token = localStorage.getItem('token');
      try {
        console.log('Fetching conversation for userId:', selectedRep.userId);
        const response = await fetch(
          `http://localhost:5000/api/messages/conversation/${selectedRep.userId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        console.log('Conversation response:', response.status, response.statusText);
        const data = await response.json();
        console.log('Conversation data:', data);
        if (response.ok) {
          setMessages(data.messages || []);
          setError(''); // Clear error for empty or valid message list
        } else {
          setError(data.error || `Failed to fetch messages (Status: ${response.status})`);
        }
      } catch (err) {
        setError('Network error while fetching messages');
        console.error('Fetch conversation error:', err);
      }
    };

    fetchConversation();
  }, [selectedRep, userId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const token = localStorage.getItem('token');
    try {
      console.log('Sending message to:', selectedRep.userId);
      const response = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: selectedRep.userId,
          content: newMessage,
        }),
      });
      console.log('Send message response:', response.status, response.statusText);
      const data = await response.json();
      console.log('Send message data:', data);
      if (response.ok) {
        setMessages([...messages, data.message]);
        setNewMessage('');
        setError(''); // Clear error on successful send
      } else {
        setError(data.error || `Failed to send message (Status: ${response.status})`);
      }
    } catch (err) {
      setError('Network error while sending message');
      console.error('Send message error:', err);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#e0f7fa' }}>
      {/* Left Sidebar: List of Representatives */}
      <Box sx={{ width: '30%', borderRight: '2px dotted #90caf9', overflowY: 'auto', backgroundColor: '#e6f4ea' }}>
        <Typography variant="h6" sx={{ p: 2, bgcolor: '#4caf50', color: 'white', borderRadius: '10px 10px 0 0' }}>
          🌿 Organization Reps
        </Typography>
        <List>
          {representatives.length > 0 ? (
            representatives.map((rep) => (
              <ListItem
                key={rep.userId}
                button
                onClick={() => {
                  setSelectedRep(rep);
                  setError(''); // Clear error when selecting a new representative
                }}
                sx={{
                  bgcolor: selectedRep?.userId === rep.userId ? '#c8e6c9' : 'transparent',
                  '&:hover': { bgcolor: '#dcedc8' },
                  borderRadius: '5px',
                  margin: '5px 0',
                }}
              >
                <ListItemText
                  primary={rep.name}
                  secondary={
                    <>
                      {rep.organizationName}
                      {rep.lastMessage && (
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ color: '#388e3c' }}
                        >
                          {rep.lastMessage.content.substring(0, 30)}
                          {rep.lastMessage.content.length > 30 ? '...' : ''}
                        </Typography>
                      )}
                    </>
                  }
                  primaryTypographyProps={{ fontWeight: 'bold', color: '#2e7d32' }}
                />
              </ListItem>
            ))
          ) : (
            <Typography sx={{ p: 2, color: '#2e7d32', fontStyle: 'italic' }}>
              🌱 No reps found yet!
            </Typography>
          )}
        </List>
      </Box>

      {/* Right Side: Chat Window */}
      <Box sx={{ width: '70%', display: 'flex', flexDirection: 'column', backgroundColor: '#e3f2fd' }}>
        {selectedRep ? (
          <>
            {/* Chat Header */}
            <Box sx={{ p: 2, bgcolor: '#42a5f5', color: 'white', borderRadius: '10px 10px 0 0' }}>
              <Typography variant="h6">
                📬 {selectedRep.name} - {selectedRep.organizationName}
              </Typography>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#e3f2fd' }}>
              {messages.length > 0 ? (
                messages.map((msg) => {
                  // Handle both cases: senderId as a string or as an object with _id
                  const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
                  console.log('Message senderId:', senderId, 'userId:', userId); // Debug log
                  const isUserMessage = senderId === userId;

                  return (
                    <Box
                      key={msg._id}
                      sx={{
                        mb: 2,
                        display: 'flex',
                        justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '60%',
                          p: 1.5,
                          borderRadius: '15px',
                          bgcolor: isUserMessage ? '#81c784' : '#90caf9',
                          color: isUserMessage ? 'white' : '#1565c0',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontFamily: 'cursive' }}>{msg.content}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#0d47a1' }}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
              ) : (
                <Typography sx={{ p: 2, color: '#1565c0', fontStyle: 'italic' }}>
                  💬 Start chatting with {selectedRep.name}!
                </Typography>
              )}
            </Box>

            {/* Message Input */}
            <Box sx={{ p: 2, borderTop: '2px dotted #90caf9', bgcolor: '#e3f2fd' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="✍️ Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                sx={{ backgroundColor: 'white', borderRadius: '10px' }}
              />
              <Button
                variant="contained"
                sx={{ mt: 1, bgcolor: '#66bb6a', '&:hover': { bgcolor: '#388e3c' }, borderRadius: '20px', padding: '5px 15px' }}
                onClick={handleSendMessage}
              >
                📩 Send
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h6" color="#1565c0" sx={{ fontFamily: 'cursive' }}>
              🌟 Pick a rep to chat!
            </Typography>
          </Box>
        )}
      </Box>

      {/* Error Display */}
      {error && (
        <Typography color="error" sx={{ p: 2, position: 'fixed', top: 0, width: '100%', bgcolor: 'white', zIndex: 1000, borderRadius: '0 0 10px 10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default ConnectNGOs;