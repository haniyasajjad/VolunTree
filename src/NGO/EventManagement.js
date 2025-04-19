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
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import '../styles/NGO/EventManagement.css';

const eventTypes = [
  'Fundraiser',
  'Pet Show',
  'Open House',
  'Adoption Day',
  'Volunteer Training',
  'Community Outreach',
  'Awareness Campaign',
  'Workshop',
];

const eventCategories = [
  'Adoption',
  'Education',
  'Fundraising',
  'Community',
  'Training',
  'Awareness',
  'Social',
  'Other',
];

const initialFormData = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  maxAttendees: '',
  eventType: '',
  category: '',
  status: 'upcoming',
};

const EventManagement = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // TODO: Replace with actual API call
      const mockEvents = [
        {
          id: 1,
          title: 'Summer Pet Adoption Day',
          description: 'Join us for a day of fun and find your perfect companion!',
          date: '2024-07-15',
          time: '10:00',
          location: 'Central Park',
          maxAttendees: 100,
          currentAttendees: 45,
          eventType: 'Adoption Day',
          category: 'Adoption',
          status: 'upcoming',
        },
        {
          id: 2,
          title: 'Fundraising Gala',
          description: 'Annual fundraising event to support our animal shelter.',
          date: '2024-06-20',
          time: '18:00',
          location: 'Grand Hotel',
          maxAttendees: 200,
          currentAttendees: 150,
          eventType: 'Fundraiser',
          category: 'Fundraising',
          status: 'ongoing',
        },
      ];
      setEvents(mockEvents);
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch events' });
      setLoading(false);
    }
  };

  const handleOpenDialog = (event = null) => {
    if (event) {
      setFormData(event);
      setIsEditing(true);
    } else {
      setFormData(initialFormData);
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setIsEditing(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Replace with actual API call
      if (isEditing) {
        setEvents((prev) =>
          prev.map((event) =>
            event.id === formData.id ? { ...event, ...formData } : event
          )
        );
        setMessage({ type: 'success', text: 'Event updated successfully' });
      } else {
        const newEvent = {
          ...formData,
          id: events.length + 1,
          currentAttendees: 0,
        };
        setEvents((prev) => [...prev, newEvent]);
        setMessage({ type: 'success', text: 'Event created successfully' });
      }
      handleCloseDialog();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save event' });
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        // TODO: Replace with actual API call
        setEvents((prev) => prev.filter((event) => event.id !== eventId));
        setMessage({ type: 'success', text: 'Event deleted successfully' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete event' });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'upcoming';
      case 'ongoing':
        return 'ongoing';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'upcoming';
    }
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress className="loading-spinner" />
        <Typography>Loading events...</Typography>
      </Box>
    );
  }

  return (
    <Box className="event-management-container">
      <Paper className="event-management-header" elevation={0}>
        <IconButton className="back-button" onClick={() => navigate('/ngo/dashboard')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" className="page-title">
          Event <span className="highlight">Management</span>
        </Typography>
        <Typography variant="body1" className="page-subtitle">
          Create and manage your organization's events
        </Typography>
      </Paper>

      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: '', text: '' })}
          className={message.type === 'success' ? 'success-message' : 'error-message'}
        >
          {message.text}
        </Alert>
      )}

      <Box className="actions-section">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="create-event-button"
          onClick={() => handleOpenDialog()}
        >
          Create New Event
        </Button>
      </Box>

      <Grid container spacing={3} className="events-grid">
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Card className="event-card">
              <CardContent>
                <Box className="event-header">
                  <Avatar className="event-icon">
                    <EventIcon />
                  </Avatar>
                  <Box className="event-info">
                    <Typography variant="h6" className="event-title">
                      {event.title}
                    </Typography>
                    <Chip
                      label={event.status}
                      className={`status-chip ${getStatusColor(event.status)}`}
                      size="small"
                    />
                  </Box>
                  <Box className="event-actions">
                    <IconButton
                      size="small"
                      className="edit-button"
                      onClick={() => handleOpenDialog(event)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      className="delete-button"
                      onClick={() => handleDelete(event.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  color="textSecondary"
                  className="event-description"
                >
                  {event.description}
                </Typography>

                <Box className="event-details">
                  <Box className="detail-item">
                    <TimeIcon className="detail-icon" />
                    <Typography variant="body2">
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </Typography>
                  </Box>
                  <Box className="detail-item">
                    <LocationIcon className="detail-icon" />
                    <Typography variant="body2">{event.location}</Typography>
                  </Box>
                  <Box className="detail-item">
                    <PeopleIcon className="detail-icon" />
                    <Typography variant="body2">
                      {event.currentAttendees}/{event.maxAttendees} attendees
                    </Typography>
                  </Box>
                </Box>

                <Box className="event-tags">
                  <Chip
                    label={event.category}
                    className="category-chip"
                    size="small"
                  />
                  <Chip
                    label={event.eventType}
                    className="type-chip"
                    size="small"
                  />
                </Box>
              </CardContent>
              <CardActions className="card-actions">
                <Button
                  variant="outlined"
                  startIcon={<ViewIcon />}
                  className="view-details-button"
                  fullWidth
                >
                  View Details
                </Button>
                <Button
                  variant="contained"
                  startIcon={<GroupIcon />}
                  className="manage-attendees-button"
                  fullWidth
                >
                  Manage Attendees
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        className="event-dialog"
      >
        <DialogTitle>
          {isEditing ? 'Edit Event' : 'Create New Event'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              name="title"
              label="Event Title"
              value={formData.title}
              onChange={handleFormChange}
              fullWidth
              required
              className="form-field"
            />
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={4}
              required
              className="form-field"
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="date"
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="time"
                  label="Time"
                  type="time"
                  value={formData.time}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  className="form-field"
                />
              </Grid>
            </Grid>
            <TextField
              name="location"
              label="Location"
              value={formData.location}
              onChange={handleFormChange}
              fullWidth
              required
              className="form-field"
            />
            <TextField
              name="maxAttendees"
              label="Maximum Attendees"
              type="number"
              value={formData.maxAttendees}
              onChange={handleFormChange}
              fullWidth
              required
              className="form-field"
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="eventType"
                  label="Event Type"
                  select
                  value={formData.eventType}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  className="form-field"
                >
                  {eventTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="category"
                  label="Category"
                  select
                  value={formData.category}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  className="form-field"
                >
                  {eventCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <TextField
              name="status"
              label="Status"
              select
              value={formData.status}
              onChange={handleFormChange}
              fullWidth
              required
              className="form-field"
            >
              <MenuItem value="upcoming">Upcoming</MenuItem>
              <MenuItem value="ongoing">Ongoing</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseDialog}
              className="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              className="save-button"
            >
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default EventManagement; 