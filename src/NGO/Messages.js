import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  TextField,
  Grid,
  IconButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import TopNavigation from './components/dashboard/TopNavigation';
import SideDrawer from './components/dashboard/SideDrawer';

const Messages = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [opportunityVolunteers, setOpportunityVolunteers] = useState([]);
  const [conversationsError, setConversationsError] = useState('');
  const [opportunityError, setOpportunityError] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatError, setChatError] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  // Extract userId and perform authentication check
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      console.log('No user or token found in localStorage, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (!user || user.userType !== 'Organization Representative') {
        console.log('Invalid user data or not an Organization Representative, redirecting to login');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
        return;
      }
      const extractedUserId = user._id || user.id;
      if (!extractedUserId) {
        throw new Error('User ID not found in stored user data.');
      }
      setUserId(extractedUserId);
    } catch (err) {
      console.error('Error parsing stored user data:', err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Fetch conversations (volunteers who messaged the Organization Representative)
  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5000/api/messages/org/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setConversations(data.conversations || []);
        } else {
          setConversationsError(data.error || 'Failed to fetch conversations');
          console.error('Fetch conversations error:', data.error);
        }
      } catch (err) {
        setConversationsError('An error occurred while fetching conversations');
        console.error('Fetch conversations error:', err.message);
      }
    };

    fetchConversations();
  }, [userId]);

  // Fetch volunteers enrolled in opportunities created by the organization
  useEffect(() => {
    if (!userId) return;

    const fetchOpportunityVolunteers = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (!token || !storedUser) return;

      const user = JSON.parse(storedUser);
      const orgId = user.id;

      try {
        const response = await fetch(`http://localhost:5000/api/messages/opportunity-volunteers/${orgId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setOpportunityVolunteers(data.volunteers || []);
        } else {
          setOpportunityError(data.error || 'Failed to fetch opportunity volunteers');
          console.error('Fetch opportunity volunteers error:', data.error);
        }
      } catch (err) {
        setOpportunityError('An error occurred while fetching opportunity volunteers');
        console.error('Fetch opportunity volunteers error:', err.message);
      }
    };

    fetchOpportunityVolunteers();
  }, [userId]);

  // Fetch conversation messages when a volunteer is selected
  useEffect(() => {
    if (!selectedVolunteer || !userId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`http://localhost:5000/api/messages/org/conversation/${selectedVolunteer.userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setMessages(data.messages || []);
          setChatError('');
        } else {
          setChatError(data.error || 'Failed to fetch messages');
          console.error('Fetch messages error:', data.error);
        }
      } catch (err) {
        setChatError('An error occurred while fetching messages');
        console.error('Fetch messages error:', err.message);
      }
    };

    fetchMessages();
  }, [selectedVolunteer, userId]);

  const handleVolunteerClick = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setMessages([]); // Clear messages until fetched
    setChatError(''); // Clear any previous errors
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedVolunteer) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/messages/org/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: selectedVolunteer.userId,
          content: newMessage,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessages([...messages, data.message]);
        setNewMessage('');

        // Update conversations list to reflect the new message
        const updatedConversations = conversations.map(conv =>
          conv.userId === selectedVolunteer.userId
            ? { ...conv, lastMessage: data.message }
            : conv
        );
        if (!updatedConversations.some(conv => conv.userId === selectedVolunteer.userId)) {
          updatedConversations.push({
            userId: selectedVolunteer.userId,
            name: selectedVolunteer.name,
            organizationName: 'N/A',
            lastMessage: data.message,
          });
        }
        setConversations(updatedConversations.sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        setChatError(data.error || 'Failed to send message');
        console.error('Send message error:', data.error);
      }
    } catch (err) {
      setChatError('An error occurred while sending the message');
      console.error('Send message error:', err.message);
    }
  };

  const handleMenuItemClick = (text) => {
    console.log('Sidebar menu item clicked:', text);
    switch (text) {
      case 'Post Opportunities':
        navigate('/post-opportunity');
        break;
      case 'Match Volunteers':
        navigate('/match-volunteers');
        break;
      case 'Manage Events':
        navigate('/event-management');
        break;
      case 'Send Notifications':
        navigate('/notifications');
        break;
      case 'Messages':
        // Already on Messages page
        break;
      case 'Dashboard':
        navigate('/dashboard');
        break;
      default:
        console.log('Unknown menu item:', text);
        break;
    }
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    console.log('Logging out, clearing localStorage');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        bgcolor: 'transparent',
      }}
    >
      {/* Video Background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: '#EFDED4',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        >
          <source src="/dash_bg2.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </Box>

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <TopNavigation onMenuClick={() => setDrawerOpen(true)} />

        <SideDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onMenuItemClick={handleMenuItemClick}
        />

        <Box sx={{ p: 3 }}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              p: 3,
              mb: 3,
            }}
          >
            <Typography variant="h4" gutterBottom>
              Messages
            </Typography>
            <Typography variant="body1" gutterBottom>
              Connect with volunteers who have messaged you or signed up for your opportunities.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLogout}
              sx={{ mt: 2 }}
            >
              Logout
            </Button>
          </Paper>

          <Grid container spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
            {/* Left Side: List of Volunteers */}
            <Grid item xs={12} md={4}>
              {/* Volunteers Who Messaged */}
              <Paper
                elevation={0}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  p: 3,
                  mb: 3,
                  maxHeight: '50vh',
                  overflowY: 'auto',
                }}
              >
                <Typography variant="h5" gutterBottom>
                  Volunteers Who Messaged You
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {conversationsError ? (
                  <Typography color="error" variant="body2">
                    {conversationsError}
                  </Typography>
                ) : conversations.length > 0 ? (
                  <List>
                    {conversations.map((conv) => (
                      <ListItem
                        key={conv.userId}
                        button
                        selected={selectedVolunteer && selectedVolunteer.userId === conv.userId}
                        onClick={() => handleVolunteerClick(conv)}
                      >
                        <ListItemText
                          primary={conv.name}
                          secondary={conv.lastMessage ? `Last: ${conv.lastMessage.content}` : 'No messages yet'}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No messages yet.
                  </Typography>
                )}
              </Paper>

              {/* Volunteers Enrolled in Opportunities */}
              <Paper
                elevation={0}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  p: 3,
                  maxHeight: '50vh',
                  overflowY: 'auto',
                }}
              >
                <Typography variant="h5" gutterBottom>
                  Volunteers Enrolled in Your Opportunities
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {opportunityError ? (
                  <Typography color="error" variant="body2">
                    {opportunityError}
                  </Typography>
                ) : opportunityVolunteers.length > 0 ? (
                  <List>
                    {opportunityVolunteers.map((vol) => (
                      <ListItem
                        key={vol._id}
                        button
                        selected={selectedVolunteer && selectedVolunteer.userId === vol._id}
                        onClick={() => handleVolunteerClick({ userId: vol._id, name: vol.name })}
                      >
                        <ListItemText
                          primary={vol.name}
                          secondary="Enrolled in an opportunity"
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No volunteers enrolled in opportunities yet.
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Right Side: Chat Interface */}
            <Grid item xs={12} md={20} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="h5" gutterBottom>
                  {selectedVolunteer ? `Chat with ${selectedVolunteer.name}` : 'Select a volunteer to start chatting'}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {chatError ? (
                  <Typography color="error" variant="body2">
                    {chatError}
                  </Typography>
                ) : selectedVolunteer ? (
                  <>
                    <Box
                      sx={{
                        flexGrow: 4,
                        overflowY: 'auto',
                        mb: 2,
                        p: 1,
                        bgcolor: '#e3f2fd',
                        borderRadius: 1,
                      }}
                    >
                      {messages.map((msg, index) => {
                        // Handle both cases: senderId as a string or as an object with _id
                        const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
                        console.log('Message senderId:', senderId, 'userId:', userId); // Debug log
                        const isUserMessage = senderId === userId;

                        return (
                          <Box
                            key={index}
                            sx={{
                              mb: 1,
                              display: 'flex',
                              justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
                            }}
                          >
                            <Box
                              sx={{
                                maxWidth: '70%',
                                p: 1.5,
                                borderRadius: '15px',
                                bgcolor: isUserMessage ? '#e6f4ea' : '#e0f7fa',
                                color: isUserMessage ? '#2e7d32' : '#1565c0',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                              }}
                            >
                              <Typography variant="body2" sx={{ fontFamily: 'cursive' }}>
                                <strong>{msg.senderId.name}</strong>: {msg.content}
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#0d47a1' }}>
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="✍️ Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        sx={{ mr: 1, bgcolor: 'white', borderRadius: '10px' }}
                      />
                      <IconButton
                        sx={{ bgcolor: '#66bb6a', '&:hover': { bgcolor: '#388e3c' }, borderRadius: '20px' }}
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                      >
                        <SendIcon sx={{ color: 'white' }} />
                      </IconButton>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Select a volunteer from the left to view or start a conversation.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default Messages;