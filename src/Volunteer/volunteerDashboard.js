import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  TextField,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import { FaRegComment, FaRegEdit, FaBell } from 'react-icons/fa';
import './volunteerDashboard.css';
import professionalImage from './student.png';

const interestsData = [
  'Environmental Conservation',
  'Education',
  'Food Security',
  'Health Care',
  'Animal Welfare',
  'Disaster Relief',
  'Senior Care',
  'Civic Engagement',
  'Housing Support',
  'Arts and Culture',
];

const VolunteerDashboard = () => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(currentDay);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [openRatingDialog, setOpenRatingDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [userInterests, setUserInterests] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [error, setError] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [matchingOpportunities, setMatchingOpportunities] = useState([]);
  const [lastFetchedTimestamp, setLastFetchedTimestamp] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);

  const eventColors = ['#FBBF24', '#34D399', '#A78BFA', '#F87171'];

  const fetchUserDataAndOpportunities = async () => {
    const storedUser = localStorage.getItem('user');
    let userId;
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.name && parsedUser.interests) {
          setUserName(parsedUser.name);
          setUserInterests(parsedUser.interests || []);
          userId = parsedUser.id;
          setUserId(userId);
        } else {
          console.error('User data incomplete in localStorage:', parsedUser);
          navigate('/login');
          return;
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        navigate('/login');
        return;
      }
    } else {
      console.error('No user data found in localStorage');
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view opportunities');
      navigate('/login');
      return;
    }

    try {
      const userResponse = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const userData = await userResponse.json();
      if (!userResponse.ok) {
        setError(userData.error || 'Failed to fetch user data');
        navigate('/login');
        return;
      }

      const opportunitiesResponse = await fetch('http://localhost:5000/api/opportunities', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const opportunitiesData = await opportunitiesResponse.json();
      if (opportunitiesResponse.ok) {
        setOpportunities(opportunitiesData.opportunities || []);
      } else {
        setError(opportunitiesData.error || 'Failed to fetch opportunities');
        return;
      }

      const enrolledEventIds = userData.user.enrolledEvents || [];
      const enrolledOpportunities = opportunitiesData.opportunities.filter(opp =>
        enrolledEventIds.includes(opp._id)
      );
      const eventsWithColors = enrolledOpportunities.map((opp, index) => ({
        id: opp._id,
        title: opp.title,
        date: opp.date,
        color: eventColors[index % eventColors.length],
        createdBy: opp.createdBy,
      }));
      setRegisteredEvents(eventsWithColors);
    } catch (err) {
      setError('An error occurred while fetching data. Please try again.');
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notifications?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch notifications');
      }
      const data = await response.json();
      console.log('Fetched notifications:', data);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.message || 'Failed to load notifications');
    }
  };

  const fetchMatchingOpportunities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notifications/matching-opportunities?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch matching opportunities');
      }
      const data = await response.json();
      console.log('Fetched matching opportunities for alerts:', data);

      if (lastFetchedTimestamp) {
        const newOpportunities = data.filter(opp => {
          const oppCreatedAt = new Date(opp.createdAt);
          return oppCreatedAt > lastFetchedTimestamp;
        });
        if (newOpportunities.length > 0) {
          setMatchingOpportunities(prev => [...newOpportunities, ...prev]);
          setCurrentAlertIndex(0);
          setAlertOpen(true);
        }
      } else {
        setMatchingOpportunities(data);
        setCurrentAlertIndex(0);
        setAlertOpen(true);
      }
      setLastFetchedTimestamp(new Date());
    } catch (error) {
      console.error('Error fetching matching opportunities for alerts:', error);
      setError(error.message || 'Failed to load matching opportunities');
    }
  };

  useEffect(() => {
    fetchUserDataAndOpportunities();
    if (userId) {
      fetchNotifications();
      fetchMatchingOpportunities();

      const intervalId = setInterval(() => {
        fetchMatchingOpportunities();
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [navigate, userId]);

  useEffect(() => {
    if (alertOpen && matchingOpportunities.length > 0) {
      const totalDuration = 7000;
      const delayBetweenAlerts = 2000;

      const showNextAlert = () => {
        if (currentAlertIndex < matchingOpportunities.length - 1) {
          setTimeout(() => {
            setCurrentAlertIndex(prev => prev + 1);
          }, delayBetweenAlerts);
        } else {
          setTimeout(() => {
            setAlertOpen(false);
            setCurrentAlertIndex(0);
          }, delayBetweenAlerts);
        }
      };

      const timer = setTimeout(showNextAlert, totalDuration);

      return () => clearTimeout(timer);
    }
  }, [alertOpen, currentAlertIndex, matchingOpportunities]);

  const filteredOpportunities = useMemo(() => {
    if (userInterests.length > 0 && opportunities.length > 0) {
      const userCategories = userInterests.map(index => interestsData[index]).filter(Boolean);
      return opportunities.filter(opp => userCategories.includes(opp.category));
    }
    return [];
  }, [userInterests, opportunities]);

  const filteredRegisteredEvents = registeredEvents.filter(event => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getDate() === selectedDate &&
      eventDate.getMonth() === currentMonth &&
      eventDate.getFullYear() === currentYear
    );
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const currentMonthName = monthNames[currentMonth];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);

  const handleDateClick = (date) => date && setSelectedDate(date);
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setOpenEventDialog(true);
  };
  const handleCloseEventDialog = () => {
    setOpenEventDialog(false);
    setSelectedEvent(null);
  };
  const handleCloseRatingDialog = () => {
    setOpenRatingDialog(false);
    setRating(0);
    setMessage('');
    setSelectedEvent(null);
  };

  const handleMarkCompleted = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to mark events as completed');
        navigate('/login');
        return;
      }

      // Fetch event details to get date and duration
      const response = await fetch(`http://localhost:5000/api/opportunities/${selectedEvent.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const eventData = await response.json();
      if (!response.ok) {
        setError(eventData.error || 'Failed to fetch event details');
        return;
      }

      const event = eventData.opportunity;
      if (!event) {
        setError('Event not found');
        return;
      }

      // Calculate end time (date + duration in hours)
      const eventStartTime = new Date(event.date);
      const eventEndTime = new Date(eventStartTime.getTime() + event.duration * 60 * 60 * 1000); // Convert hours to milliseconds
      const currentTime = new Date();

      // Check if current time is greater than or equal to event end time
      if (currentTime < eventEndTime) {
        setError(`This event cannot be marked as completed yet. It ends at ${eventEndTime.toLocaleString()}.`);
        return;
      }

      // Proceed to mark as completed: Remove from enrolledEvents and assignedVolunteers
      const unregisterResponse = await fetch(`http://localhost:5000/api/opportunities/unregister/${selectedEvent.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const unregisterData = await unregisterResponse.json();
      if (!unregisterResponse.ok) {
        setError(unregisterData.error || 'Failed to mark event as completed');
        return;
      }

      // Update local state to remove the event from registeredEvents
      setRegisteredEvents(prevEvents => prevEvents.filter(event => event.id !== selectedEvent.id));

      // Close event dialog and open rating dialog
      setOpenEventDialog(false);
      setOpenRatingDialog(true);
    } catch (error) {
      console.error('Error marking event as completed:', error);
      setError('An error occurred while marking the event as completed. Please try again.');
    }
  };

  const handleViewDetails = () => {
    navigate(`/event/${selectedEvent.id}`);
    handleCloseEventDialog();
  };

  const handleSubmitRating = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ratings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          volunteerId: userId,
          organizationId: selectedEvent.createdBy,
          rating,
          feedback: message,
          type: 'volunteer-to-org',
        }),
      });
      if (response.ok) console.log(`Successfully submitted rating ${rating} and message "${message}" for event "${selectedEvent.title}"`);
      else setError('Failed to submit rating. Please try again.');
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError('An error occurred while submitting your rating. Please try again.');
    }
    handleCloseRatingDialog();
  };

  const handleViewInvites = () => navigate('/view-invites');
  const handleNotificationClick = () => setNotificationOpen(!notificationOpen);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'normal': return '#4CAF50';
      case 'low': return '#03A9F4';
      default: return '#4CAF50';
    }
  };

  const handleLogout = () => {
    console.log('Logging out, clearing localStorage');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <Box className="dashboard-wrapper">
      <nav className="navbar">
        <a href="/" className="navbar-brand">VolunTree</a>
        <div className="navbar-links"></div>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            className="dashboard-notification-icon"
            onClick={handleNotificationClick}
            style={{ color: '#FBBF24' }}
          >
            <FaBell size={24} />
          </IconButton>
          <Button
            variant="contained"
            onClick={handleLogout}
            style={{
              backgroundColor: '#F87171',
              color: '#fff',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              minWidth: '0',
              marginLeft: '8px',
              padding: '0',
              fontSize: '1rem',
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
            }}
            title="Logout"
          >
            👋
          </Button>
        </Box>
      </nav>
      <Container component="main" className="dashboard-container" disableGutters maxWidth={false}>
        <Snackbar
          open={alertOpen}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={null}
          onClose={() => setAlertOpen(false)}
          sx={{ mt: '50px' }}
        >
          <Box>
            {matchingOpportunities[currentAlertIndex] && (
              <Alert
                key={matchingOpportunities[currentAlertIndex]._id}
                severity="info"
                sx={{ mb: 1, width: '100%' }}
                onClick={() => {
                  navigate(`/event/${matchingOpportunities[currentAlertIndex]._id}`);
                  setAlertOpen(false);
                  setCurrentAlertIndex(0);
                }}
                style={{ cursor: 'pointer' }}
              >
                New Opportunity: {matchingOpportunities[currentAlertIndex].title} on {new Date(matchingOpportunities[currentAlertIndex].date).toLocaleDateString()} - Matches your {matchingOpportunities[currentAlertIndex].category} interest or event schedule!
              </Alert>
            )}
          </Box>
        </Snackbar>
        {notificationOpen && (
          <Box
            className="notification-panel"
            sx={{
              position: 'fixed',
              top: '60px',
              right: '32px',
              width: '300px',
              maxHeight: '400px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              overflowY: 'auto',
              padding: '16px',
            }}
          >
            <Typography variant="h6" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, mb: 2 }}>
              Notifications
            </Typography>
            {notifications.length === 0 ? (
              <Typography sx={{ fontFamily: 'Inter, sans-serif', color: '#4B5563' }}>
                No notifications yet.
              </Typography>
            ) : (
              notifications.map((notification) => (
                <Box key={notification._id} sx={{ mb: 2, p: 1, borderBottom: '1px solid #E0E0E0' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#5D4037' }}>
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#8D6E63', fontSize: '0.875rem' }}>
                    {notification.message.slice(0, 50)}{notification.message.length > 50 ? '...' : ''}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#03A9F4' }}>
                    {new Date(notification.created_at).toLocaleString()}
                  </Typography>
                  <Chip
                    label={notification.priority}
                    size="small"
                    sx={{
                      mt: 0.5,
                      backgroundColor: `${getPriorityColor(notification.priority)}20`,
                      color: getPriorityColor(notification.priority),
                      fontWeight: 600,
                    }}
                  />
                </Box>
              ))
            )}
          </Box>
        )}
        <Box className="dashboard-main">
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Box className="dashboard-profile-container">
            <Box className="dashboard-profile">
              <Box className="dashboard-profile-content">
                <Typography variant="h5" className="dashboard-title">
                  <span style={{ color: '#FBBF24' }}>Your</span>{' '}
                  <span style={{ color: '#34D399' }}>Profile</span>
                </Typography>
                <Typography className="dashboard-subtitle">
                  Hi {userName || 'User'}, Keep Volunteering with us.
                </Typography>
              </Box>
              <Box className="dashboard-profile-image">
                <img
                  src={professionalImage}
                  alt="Profile Illustration"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Box>
            </Box>
          </Box>

          <Box className="dashboard-right-column">
            <Box className="dashboard-calendar">
              <Typography variant="h6" className="dashboard-section-title">
                {currentMonthName} {currentYear}
              </Typography>
              <Box className="calendar-grid">
                <Box className="calendar-day-label">Sun</Box>
                <Box className="calendar-day-label">Mon</Box>
                <Box className="calendar-day-label">Tue</Box>
                <Box className="calendar-day-label">Wed</Box>
                <Box className="calendar-day-label">Thu</Box>
                <Box className="calendar-day-label">Fri</Box>
                <Box className="calendar-day-label">Sat</Box>
                {calendarDays.map((day, index) => (
                  <Box
                    key={index}
                    className={`calendar-day ${day && selectedDate === day ? 'calendar-day-selected' : ''}`}
                    onClick={() => handleDateClick(day)}
                  >
                    {day || ''}
                  </Box>
                ))}
              </Box>
            </Box>

            <Box className="dashboard-tasks">
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" className="dashboard-section-title">
                  Registered Events
                </Typography>
                <Button className="create-new-button">+ Register New</Button>
              </Box>
              <Box mt={2}>
                {filteredRegisteredEvents.length > 0 ? (
                  filteredRegisteredEvents.map((event) => (
                    <Box
                      key={event.id}
                      display="flex"
                      alignItems="center"
                      mb={1}
                      className="event-item"
                      onClick={() => handleEventClick(event)}
                    >
                      <Box className="task-dot" style={{ backgroundColor: event.color }} />
                      <Typography className="dashboard-lesson-subtitle">{event.title}</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No registered events for this date.
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          <Box className="dashboard-events">
            <Box className="ngo-cards-grid">
              <Box className="ngo-card connect-ngo" style={{ position: 'relative' }}>
                <Typography className="ngo-card-title">Connect with NGOs</Typography>
                <Typography className="ngo-card-subtitle">
                  Reach out to local and global NGOs to collaborate on impactful projects.
                </Typography>
                <Button
                  className="ngo-card-button"
                  onClick={() => navigate('/connect-ngos')}
                >
                  Start Connecting
                </Button>
                <IconButton
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    color: '#FFFFFF',
                  }}
                  onClick={() => console.log('Message icon clicked')}
                >
                  <FaRegComment size={32} />
                </IconButton>
              </Box>
              <Box className="ngo-card explore-opportunities" style={{ position: 'relative' }}>
                <Typography className="ngo-card-title">Edit Preferences</Typography>
                <Typography className="ngo-card-subtitle">
                  Change your preferences anytime to get more personalized event suggestions.
                </Typography>
                <Button
                  className="ngo-card-button"
                  onClick={() => navigate('/edit-preferences')}
                >
                  Edit Now
                </Button>
                <IconButton
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    color: '#FFFFFF',
                  }}
                  onClick={() => console.log('Edit icon clicked')}
                >
                  <FaRegEdit size={32} />
                </IconButton>
              </Box>
              <Box className="ngo-card view-invites" style={{ position: 'relative' }}>
                <Typography className="ngo-card-title">View Invites</Typography>
                <Typography className="ngo-card-subtitle">
                  NGOs who want you - check your invitations here.
                </Typography>
                <Button
                  className="ngo-card-button"
                  onClick={handleViewInvites}
                >
                  View Invites
                </Button>
              </Box>
            </Box>
          </Box>

          <Box className="dashboard-lessons">
            <Typography variant="h4" className="events-heading">
              Events for You
            </Typography>
            <Box className="events-scroll-container">
              {filteredOpportunities.length > 0 ? (
                filteredOpportunities.slice(0, 4).map((opp) => {
                  const oppDate = new Date(opp.date);
                  return (
                    <Box
                      key={opp._id}
                      className="event-card"
                      style={{ backgroundColor: '#A78BFA' }}
                      onClick={() => handleEventClick({ id: opp._id, title: opp.title, createdBy: opp.createdBy })}
                    >
                      <Typography className="event-card-title">{opp.title}</Typography>
                      <Typography className="event-card-subtitle">
                        {opp.type} by {opp.organizationName} on {oppDate.toLocaleDateString()} at {oppDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  );
                })
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No events match your interests.
                </Typography>
              )}
              <Button className="event-card-button" onClick={() => navigate('/display-events')}>
                View More
              </Button>
            </Box>
          </Box>
        </Box>

        <Dialog
          open={openEventDialog}
          onClose={handleCloseEventDialog}
          PaperProps={{ className: 'event-dialog' }}
        >
          <DialogTitle>{selectedEvent?.title}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary">
              Would you like to mark this event as completed or view its details?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEventDialog} className="dialog-button-cancel">
              Cancel
            </Button>
            <Button onClick={handleViewDetails} className="dialog-button-details">
              View Details
            </Button>
            <Button onClick={handleMarkCompleted} className="dialog-button-complete">
              Mark as Completed
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openRatingDialog}
          onClose={handleCloseRatingDialog}
          PaperProps={{ className: 'rating-dialog' }}
        >
          <DialogTitle>Rate {selectedEvent?.title}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              How would you rate your experience with this event?
            </Typography>
            <Rating
              name="event-rating"
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              precision={0.5}
              size="large"
            />
            <Typography variant="body2" color="textSecondary" gutterBottom style={{ marginTop: '16px' }}>
              Share your feedback (optional):
            </Typography>
            <TextField
              multiline
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="outlined"
              fullWidth
              placeholder="Write your feedback here..."
              className="rating-message-input"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRatingDialog} className="dialog-button-cancel">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRating}
              className="dialog-button-submit"
              disabled={rating === 0}
            >
              Submit Rating
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default VolunteerDashboard;