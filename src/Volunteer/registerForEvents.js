import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import './registerForEvents.css';

const RegisterForEvents = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedEvent = location.state?.event || null;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!selectedEvent) {
      setError('No event selected.');
      return;
    }

    try {
      // Get the token and user data from localStorage
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (!token || !storedUser) {
        setError('Please log in to register for events.');
        navigate('/login');
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      console.log('Parsed user from localStorage:', parsedUser);
      const userId = parsedUser.id; // Fixed: Use 'id' instead of '_id'

      if (!userId) {
        setError('User ID not found. Please log in again.');
        navigate('/login');
        return;
      }

      // Log the request details
      console.log('Registering for event:', {
        opportunityId: selectedEvent._id,
        userId,
        token,
      });

      // Make API call to register the user for the opportunity
      const response = await fetch(`http://localhost:5000/api/opportunities/${selectedEvent._id}/register`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      console.log('Response from server:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register for the event');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '' });
      console.log('Registration successful, redirecting to dashboard...');

      // Redirect after a delay
      setTimeout(() => {
        console.log('Navigating to /volundashboard');
        navigate('/volundashboard');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register for the event. Please try again.');
    }
  };

  return (
    <Box className="register-events-wrapper">
      <Grid container spacing={0}>
        {/* Left Side: Form */}
        <Grid xs={12} md={6} className="register-events-form-container">
          <Box className="register-events-form">
            <Typography variant="h5" className="register-events-title">
              Event Registration
            </Typography>
            <Typography className="register-events-subtitle">
              Join our exciting events! Please provide your details to register.
            </Typography>
            <Box component="form" onSubmit={handleSubmit} className="register-events-form-content">
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="register-events-input"
                variant="outlined"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="register-events-input"
                variant="outlined"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="register-events-input"
                variant="outlined"
                margin="normal"
              />
              {error && (
                <Typography color="error" variant="body2" style={{ marginTop: '10px' }}>
                  {error}
                </Typography>
              )}
              {success && (
                <Typography color="success" variant="body2" style={{ marginTop: '10px', color: 'green' }}>
                  Successfully registered for the event! Redirecting to dashboard...
                </Typography>
              )}
              <Button
                type="submit"
                className="register-events-button"
                variant="contained"
                disabled={success}
              >
                Register Now
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Right Side: Selected Event */}
        <Grid xs={12} md={6} className="register-events-interests-container">
          <Box className="register-events-interests">
            {selectedEvent ? (
              <Box className="de-event-card">
                <Box className="de-event-header">
                  <Box component="span" className="de-event-initial">
                    {selectedEvent.organizationName.charAt(0)}
                  </Box>
                  <Box className="de-event-details">
                    <Typography variant="h6" component="h3">
                      {selectedEvent.title}
                    </Typography>
                    <Typography variant="body2">
                      {selectedEvent.organizationName} | {selectedEvent.location}
                    </Typography>
                  </Box>
                </Box>
                <Box className="de-event-date-duration">
                  <Box component="span" className="de-label">Date</Box>
                  <Box component="span">{new Date(selectedEvent.date).toLocaleDateString()}</Box>
                  <Box component="span" className="de-label">Time</Box>
                  <Box component="span">{new Date(selectedEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Box>
                  <Box component="span" className="de-label">Duration</Box>
                  <Box component="span">{selectedEvent.duration} hours</Box>
                </Box>
                <Box className="de-event-tags">
                  <Box component="span" className="de-tags-label">Interest</Box>
                  <Box component="span" className="de-tag">{selectedEvent.category}</Box>
                  <Box component="span" className="de-tags-label">Skills</Box>
                  {selectedEvent.skills.length > 0 ? (
                    selectedEvent.skills.map((skill, index) => (
                      <Box component="span" key={index} className="de-tag">{skill}</Box>
                    ))
                  ) : (
                    <Box component="span" className="de-tag">None</Box>
                  )}
                </Box>
                <Box className="de-event-description">
                  <Box component="span" className="de-label">Description</Box>
                  <Typography variant="body2">{selectedEvent.description}</Typography>
                </Box>
                <Box className="de-event-type">
                  <Box component="span" className="de-label">Type</Box>
                  <Box component="span">{selectedEvent.type}</Box>
                </Box>
              </Box>
            ) : (
              <Typography className="register-events-no-interests">
                No event selected.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegisterForEvents;