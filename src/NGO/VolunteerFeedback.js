import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Rating, Grid, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import TopNavigation from './components/dashboard/TopNavigation';
import SideDrawer from './components/dashboard/SideDrawer';
import '../styles/NGO/VolunteerFeedback.css';

const VolunteerFeedback = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [organizationId, setOrganizationId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (!token || !storedUser) {
          setError('Please log in to provide feedback');
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        const orgId = parsedUser.id;
        setOrganizationId(orgId);

        // Fetch events created by the organization
        const eventsResponse = await fetch('http://localhost:5000/api/opportunities', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const eventsData = await eventsResponse.json();
        if (eventsResponse.ok) {
          const orgEvents = eventsData.opportunities.filter(event => event.createdBy === orgId);
          setEvents(orgEvents);
        } else {
          setError(eventsData.error || 'Failed to fetch events');
        }

        // Fetch volunteers who participated in the organization's events
        const volunteersResponse = await fetch(`http://localhost:5000/api/ratings/volunteers/${orgId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const volunteersData = await volunteersResponse.json();
        if (volunteersResponse.ok) {
          setVolunteers(volunteersData.volunteers);
        } else {
          setError(volunteersData.error || 'Failed to fetch volunteers');
        }
      } catch (err) {
        setError('An error occurred while fetching data. Please try again.');
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleSubmitFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const volunteer = volunteers.find(v => v._id === selectedVolunteer);
      if (!volunteer || !selectedEvent) {
        setError('Please select a volunteer and an event');
        return;
      }

      const response = await fetch('http://localhost:5000/api/ratings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: selectedEvent,
          volunteerId: selectedVolunteer,
          organizationId,
          rating,
          feedback,
          type: 'org-to-volunteer',
        }),
      });

      if (response.ok) {
        console.log('Feedback submitted successfully');
        // Reset form
        setSelectedVolunteer('');
        setSelectedEvent('');
        setRating(0);
        setFeedback('');
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('An error occurred while submitting your feedback. Please try again.');
    }
  };

  const handleMenuItemClick = (text) => {
    setDrawerOpen(false);
  };

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

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <TopNavigation onMenuClick={() => setDrawerOpen(true)} />
        
        <SideDrawer 
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onMenuItemClick={handleMenuItemClick}
        />

        <Box className="feedback-content">
          <Paper 
            className="feedback-section" 
            elevation={0}
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="h4" className="feedback-title">
              Volunteer Feedback
            </Typography>
            <Typography variant="body1" className="feedback-subtitle">
              Recognize your volunteers' contributions
            </Typography>

            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Box className="feedback-form">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined" className="feedback-input">
                    <InputLabel>Volunteer</InputLabel>
                    <Select
                      value={selectedVolunteer}
                      onChange={(e) => setSelectedVolunteer(e.target.value)}
                      label="Volunteer"
                    >
                      <MenuItem value="">
                        <em>Select a volunteer</em>
                      </MenuItem>
                      {volunteers.map((volunteer) => (
                        <MenuItem key={volunteer._id} value={volunteer._id}>
                          {volunteer.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined" className="feedback-input">
                    <InputLabel>Event</InputLabel>
                    <Select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      label="Event"
                    >
                      <MenuItem value="">
                        <em>Select an event</em>
                      </MenuItem>
                      {events.map((event) => (
                        <MenuItem key={event._id} value={event._id}>
                          {event.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography component="legend" className="rating-label">
                    Rating
                  </Typography>
                  <Rating
                    name="volunteer-rating"
                    value={rating}
                    onChange={(event, newValue) => setRating(newValue)}
                    size="large"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Feedback"
                    multiline
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    variant="outlined"
                    className="feedback-input"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    className="submit-button"
                    onClick={handleSubmitFeedback}
                    disabled={!selectedVolunteer || !selectedEvent || !feedback}
                  >
                    Submit Feedback
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default VolunteerFeedback;