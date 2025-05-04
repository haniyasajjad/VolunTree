import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import './ViewInvites.css';

const ViewInvites = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch invites for the logged-in volunteer
  useEffect(() => {
    const fetchInvites = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      let userId;

      if (!token || !storedUser) {
        setError('Please log in to view your invitations');
        navigate('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        userId = parsedUser.id;
        console.log('userId:', userId); // Debug log
      } catch (err) {
        setError('Error retrieving user data');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/invites/volunteer/${encodeURIComponent(userId)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json(); // Read as JSON directly
        console.log('Response data:', JSON.stringify(data, null, 2)); // Log as string

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch invitations');
        }

        setInvites(data.invites || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invites:', error);
        setError(error.message.includes('<!DOCTYPE') ? 'Server returned an error page. Check backend logs.' : error.message);
        setLoading(false);
      }
    };

    fetchInvites();
  }, [navigate]);

  const handleAcceptInvite = async (inviteId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to accept invitations');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/invites/${inviteId}/accept`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Response data (accept):', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      setInvites(invites.map(invite =>
        invite._id === inviteId ? { ...invite, status: 'accepted' } : invite
      ));
      setSuccess('Invitation accepted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error accepting invite:', error);
      setError(error.message);
    }
  };

  const handleDeclineInvite = async (inviteId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to decline invitations');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/invites/${inviteId}/decline`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Response data (decline):', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to decline invitation');
      }

      setInvites(invites.map(invite =>
        invite._id === inviteId ? { ...invite, status: 'declined' } : invite
      ));
      setSuccess('Invitation declined successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error declining invite:', error);
      setError(error.message);
    }
  };

  const handleBack = () => {
    navigate('/volundashboard');
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress className="loading-spinner" />
        <Typography variant="body1">Loading invitations...</Typography>
      </Box>
    );
  }

  return (
    <Box className="view-invites-container">
      <Paper className="view-invites-header" elevation={0}>
        <IconButton className="back-button" onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" className="page-title">
          Your <span className="highlight">Invitations</span>
        </Typography>
        <Typography variant="body1" className="page-subtitle">
          Review and respond to invitations from NGOs
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" className="error-message">
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          icon={<CheckCircleIcon className="success-icon" />}
          className="success-message"
          severity="success"
        >
          {success}
        </Alert>
      )}

      <Typography variant="h5" className="section-title">
        Invitations
      </Typography>

      {invites.length === 0 ? (
        <Paper className="no-results" elevation={1}>
          <Typography variant="body1">You have no pending invitations.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3} className="invites-grid">
          {invites.map((invite) => (
            <Grid item xs={12} sm={6} md={4} key={invite._id}>
              <Card className="invite-card">
                <CardContent>
                  <Box className="invite-header">
                    <Avatar className="invite-avatar">{(invite.organizationId?.name || 'Unknown').charAt(0).toUpperCase()}</Avatar>
                    <Box className="invite-info">
                      <Typography variant="h6" className="invite-org-name">
                        {invite.organizationId?.name || 'Unknown Organization'}
                      </Typography>
                      <Typography variant="body2" className="invite-opp-title">
                        {invite.opportunityId?.title || 'No Title'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box className="invite-details">
                    <Box className="detail-item">
                      <EventIcon className="detail-icon" />
                      <Typography variant="body2">
                        {new Date(invite.opportunityId?.date || Date.now()).toLocaleDateString()} at{' '}
                        {new Date(invite.opportunityId?.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                    <Box className="detail-item">
                      <LocationIcon className="detail-icon" />
                      <Typography variant="body2">{invite.opportunityId?.location || 'Unknown Location'}</Typography>
                    </Box>
                    <Box className="detail-item">
                      <MessageIcon className="detail-icon" />
                      <Typography variant="body2">{invite.message || 'No message provided'}</Typography>
                    </Box>
                  </Box>

                  <Divider className="invite-divider" />

                  <Box className="invite-status">
                    <Typography variant="subtitle2" className="status-label">
                      Status: <span className={`status-value status-${invite.status}`}>
                        {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                      </span>
                    </Typography>
                  </Box>
                </CardContent>
                {invite.status === 'pending' && (
                  <CardActions className="card-actions">
                    <Button
                      variant="contained"
                      size="small"
                      className="accept-button"
                      onClick={() => handleAcceptInvite(invite._id)}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      className="decline-button"
                      onClick={() => handleDeclineInvite(invite._id)}
                    >
                      Decline
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ViewInvites;