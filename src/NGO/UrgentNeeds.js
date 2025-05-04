import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch, Alert } from '@mui/material';
import TopNavigation from './components/dashboard/TopNavigation';
import SideDrawer from './components/dashboard/SideDrawer';
import '../styles/NGO/UrgentNeeds.css';

const UrgentNeeds = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgentNeeds, setUrgentNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [notifyLoading, setNotifyLoading] = useState(false);

  useEffect(() => {
    fetchUrgentNeeds();
  }, []);

  const fetchUrgentNeeds = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        setMessage({ type: 'error', text: 'Please log in to view urgent needs' });
        setLoading(false);
        return;
      }

      let userId;
      try {
        const user = JSON.parse(storedUser);
        console.log('Parsed user data:', user);
        userId = user._id || user.id;
        if (!userId) {
          throw new Error('User ID not found in stored user data. Expected field: "_id" or "id".');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setMessage({ type: 'error', text: 'Invalid user data: ' + error.message + ' Please log in again.' });
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/urgent-needs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('API Response (Urgent Needs):', data);

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch urgent needs' });
        setLoading(false);
        return;
      }

      // Log createdAt values to verify they're present
      data.forEach((need, index) => {
        console.log(`Urgent Need ${index + 1} createdAt:`, need.createdAt);
      });

      const userUrgentNeeds = data
        .filter(need => need.createdBy.toString() === userId.toString())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort descending (newest at bottom)
      console.log('Filtered and Sorted Urgent Needs:', userUrgentNeeds);
      setUrgentNeeds(userUrgentNeeds);
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage({ type: 'error', text: 'Failed to fetch urgent needs' });
      setLoading(false);
    }
  };

  const handleAddUrgentNeed = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        setMessage({ type: 'error', text: 'Please log in to add urgent needs' });
        return;
      }

      let userId, organizationId;
      try {
        const user = JSON.parse(storedUser);
        userId = user._id || user.id;
        organizationId = userId; // Since organizationId references a User, use the user's ID
        if (!userId) {
          throw new Error('User ID not found in stored user data.');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setMessage({ type: 'error', text: 'Invalid user data: ' + error.message + ' Please log in again.' });
        return;
      }

      const payload = {
        title,
        description,
        urgent: true,
        notified: false,
        createdBy: userId,
      };

      const response = await fetch('http://localhost:5000/api/urgent-needs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to add urgent need' });
        return;
      }

      // Notify all volunteers immediately after adding
      setNotifyLoading(true);
      const volunteerResponse = await fetch('http://localhost:5000/api/notifications/volunteers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const volunteerData = await volunteerResponse.json();
      if (!volunteerResponse.ok) {
        setMessage({ type: 'error', text: volunteerData.error || 'Failed to fetch volunteers' });
        setNotifyLoading(false);
        return;
      }

      const allVolunteerIds = volunteerData.volunteerIds;
      if (!allVolunteerIds || allVolunteerIds.length === 0) {
        setMessage({ type: 'error', text: 'No volunteers found to notify' });
        setNotifyLoading(false);
        return;
      }

      const notificationPayload = {
        title: `Urgent Need: ${data.title}`,
        message: data.description,
        type: 'Volunteer Request', // Use a valid enum value
        recipients: allVolunteerIds.map(id => id.toString()), // Convert ObjectIds to strings
        priority: 'high',
        sentTo: allVolunteerIds, // Keep as ObjectIds for sentTo field
        scheduled_at: null,
        organizationId: organizationId,
      };

      const notifyResponse = await fetch('http://localhost:5000/api/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationPayload),
      });

      const notifyData = await notifyResponse.json();
      if (!notifyResponse.ok) {
        setMessage({ type: 'error', text: notifyData.error || 'Failed to notify volunteers' });
        setNotifyLoading(false);
        return;
      }

      setMessage({ type: 'success', text: 'Urgent need added and notification sent successfully' });
      setTitle('');
      setDescription('');
      setNotifyLoading(false);
      fetchUrgentNeeds();
    } catch (error) {
      console.error('Error in handleAddUrgentNeed:', error);
      setMessage({ type: 'error', text: 'Failed to add urgent need or notify volunteers: ' + error.message });
      setNotifyLoading(false);
    }
  };

  const handleToggleUrgent = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: 'Please log in to update urgent needs' });
        return;
      }

      const need = urgentNeeds.find(n => n._id === id);
      const updatedUrgent = !need.urgent;

      const response = await fetch(`http://localhost:5000/api/urgent-needs/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urgent: updatedUrgent }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to update urgent status' });
        return;
      }

      setMessage({ type: 'success', text: 'Urgent status updated successfully' });
      fetchUrgentNeeds();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update urgent status' });
    }
  };

  const handleNotifyVolunteers = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: 'Please log in to notify volunteers' });
        return;
      }

      const response = await fetch(`http://localhost:5000/api/urgent-needs/${id}/notify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to notify volunteers' });
        return;
      }

      setMessage({ type: 'success', text: 'Volunteers notified successfully' });
      fetchUrgentNeeds();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to notify volunteers' });
    }
  };

  const handleMenuItemClick = (text) => {
    setDrawerOpen(false);
  };

  if (loading) {
    return <Typography>Loading urgent needs...</Typography>;
  }

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        bgcolor: 'transparent'
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: '#EFDED4',
          zIndex: 0,
          overflow: 'hidden'
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
            objectFit: 'cover'
          }}
        >
          <source src="/dash_bg2.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <TopNavigation onMenuClick={() => setDrawerOpen(true)} />
        
        <SideDrawer 
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onMenuItemClick={handleMenuItemClick}
        />

        <Box className="urgent-needs-content">
          <Paper 
            className="urgent-needs-section" 
            elevation={0}
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="h4" className="urgent-needs-title">
              Urgent Volunteer Needs
            </Typography>
            <Typography variant="body1" className="urgent-needs-subtitle">
              Highlight critical volunteer opportunities and notify volunteers
            </Typography>

            {message.text && (
              <Alert
                severity={message.type}
                onClose={() => setMessage({ type: '', text: '' })}
                sx={{ mb: 2 }}
              >
                {message.text}
              </Alert>
            )}

            <Box className="urgent-needs-form">
              <Typography variant="h6" className="form-title">Add Urgent Need</Typography>
              <TextField
                fullWidth
                label="Opportunity Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                variant="outlined"
                className="urgent-needs-input"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                variant="outlined"
                className="urgent-needs-input"
                multiline
                rows={3}
                margin="normal"
              />
              <Button
                variant="contained"
                className="submit-button"
                onClick={handleAddUrgentNeed}
                disabled={notifyLoading || !title || !description}
              >
                {notifyLoading ? 'Adding...' : 'Add Urgent Need'}
              </Button>
            </Box>

            <TableContainer className="urgent-needs-table">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="table-header">Title</TableCell>
                    <TableCell className="table-header">Description</TableCell>
                    <TableCell className="table-header">Urgent</TableCell>
                    <TableCell className="table-header">Notify Volunteers</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {urgentNeeds.map((need) => (
                    <TableRow key={need._id} className="table-row">
                      <TableCell className="table-cell">{need.title}</TableCell>
                      <TableCell className="table-cell">{need.description}</TableCell>
                      <TableCell className="table-cell">
                        <Switch
                          checked={need.urgent}
                          onChange={() => handleToggleUrgent(need._id)}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell className="table-cell">
                        <Button
                          variant="contained"
                          className="notify-button"
                          onClick={() => handleNotifyVolunteers(need._id)}
                          disabled={need.notified}
                        >
                          {need.notified ? 'Notified' : 'Notify'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default UrgentNeeds;