import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import '../styles/NGO/Notifications.css';

const notificationTypes = [
  'Event Update',
  'Event Cancellation',
  'Event Reminder',
  'Volunteer Request',
  'General Announcement',
  'Emergency Alert',
  'Thank You Message',
  'Feedback Request',
];

const recipientGroups = [
  'All Volunteers',
  'Event Participants',
  'Active Volunteers',
  'Inactive Volunteers',
  'New Volunteers',
  'Volunteer Leaders',
];

const Notifications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: '',
    recipients: [],
    priority: 'normal',
    scheduled: false,
    scheduledDate: '',
    scheduledTime: '',
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Simulate API call to fetch notifications
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data for notifications
      const mockNotifications = [
        {
          id: 1,
          title: 'Event Schedule Change',
          message: 'The Summer Pet Adoption Day has been rescheduled to July 20th due to weather conditions.',
          type: 'Event Update',
          recipients: ['All Volunteers', 'Event Participants'],
          date: '2023-06-15T10:30:00',
          priority: 'high',
          readCount: 45,
          totalRecipients: 120,
        },
        {
          id: 2,
          title: 'Volunteer Appreciation',
          message: 'Thank you to all volunteers who participated in our recent fundraising event. Your dedication made it a huge success!',
          type: 'Thank You Message',
          recipients: ['All Volunteers'],
          date: '2023-06-10T14:15:00',
          priority: 'normal',
          readCount: 78,
          totalRecipients: 150,
        },
        {
          id: 3,
          title: 'New Volunteer Training',
          message: 'We will be conducting a new volunteer orientation session next week. Please register if you are interested in joining our team.',
          type: 'General Announcement',
          recipients: ['Inactive Volunteers', 'New Volunteers'],
          date: '2023-06-05T09:00:00',
          priority: 'normal',
          readCount: 32,
          totalRecipients: 45,
        },
      ];
      
      setNotifications(mockNotifications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'scheduled' ? checked : value
    }));
  };

  const handleRecipientChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      recipients: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    
    try {
      // Simulate API call to send notification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add the new notification to the list
      const newNotification = {
        id: Date.now(),
        title: formData.title,
        message: formData.message,
        type: formData.type,
        recipients: formData.recipients,
        date: new Date().toISOString(),
        priority: formData.priority,
        readCount: 0,
        totalRecipients: formData.recipients.includes('All Volunteers') ? 150 : 45,
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        type: '',
        recipients: [],
        priority: 'normal',
        scheduled: false,
        scheduledDate: '',
        scheduledTime: '',
      });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending notification:', error);
      setError('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        // Simulate API call to delete notification
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
        setSuccess(true);
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } catch (error) {
        console.error('Error deleting notification:', error);
        setError('Failed to delete notification');
      }
    }
  };

  const handleBack = () => {
    navigate('/ngo/dashboard');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#F44336';
      case 'normal':
        return '#4CAF50';
      case 'low':
        return '#03A9F4';
      default:
        return '#4CAF50';
    }
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress className="loading-spinner" />
        <Typography variant="body1">Loading notifications...</Typography>
      </Box>
    );
  }

  return (
    <Box className="notifications-container">
      <Paper className="notifications-header" elevation={0}>
        <IconButton className="back-button" onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" className="page-title">
          Send <span className="highlight">Notifications</span>
        </Typography>
        <Typography variant="body1" className="page-subtitle">
          Keep your volunteers informed about events and updates
        </Typography>
      </Paper>

      {success && (
        <Alert 
          icon={<CheckCircleIcon className="success-icon" />}
          className="success-message"
          severity="success"
        >
          {formData.title ? 'Notification sent successfully!' : 'Notification deleted successfully!'}
        </Alert>
      )}

      {error && (
        <Alert severity="error" className="error-message">
          {error}
        </Alert>
      )}

      <Paper className="notification-form-section" elevation={1}>
        <Typography variant="h6" className="form-title">
          Create New Notification
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notification Title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                required
                className="form-field"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleFormChange}
                multiline
                rows={4}
                required
                className="form-field"
                placeholder="Enter your message here..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth className="form-field">
                <InputLabel>Notification Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  required
                >
                  {notificationTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth className="form-field">
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleFormChange}
                  required
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth className="form-field">
                <InputLabel>Recipients</InputLabel>
                <Select
                  multiple
                  name="recipients"
                  value={formData.recipients}
                  onChange={handleRecipientChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  required
                >
                  {recipientGroups.map((group) => (
                    <MenuItem key={group} value={group}>
                      <Checkbox checked={formData.recipients.indexOf(group) > -1} />
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.scheduled}
                    onChange={handleFormChange}
                    name="scheduled"
                  />
                }
                label="Schedule for later"
              />
            </Grid>
            {formData.scheduled && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    name="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={handleFormChange}
                    className="form-field"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Time"
                    name="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={handleFormChange}
                    className="form-field"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
          </Grid>
          <Box className="form-actions">
            <Button
              variant="outlined"
              className="cancel-button"
              onClick={() => {
                setFormData({
                  title: '',
                  message: '',
                  type: '',
                  recipients: [],
                  priority: 'normal',
                  scheduled: false,
                  scheduledDate: '',
                  scheduledTime: '',
                });
              }}
            >
              Clear
            </Button>
            <Button
              type="submit"
              variant="contained"
              className="send-button"
              disabled={sending}
              startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            >
              {sending ? 'Sending...' : 'Send Notification'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Typography variant="h5" className="section-title">
        Recent Notifications
      </Typography>

      {notifications.length === 0 ? (
        <Paper className="no-notifications" elevation={1}>
          <Typography variant="body1">No notifications sent yet.</Typography>
        </Paper>
      ) : (
        <Box className="notifications-list">
          {notifications.map((notification) => (
            <Card key={notification.id} className="notification-card">
              <Box className="notification-header">
                <Avatar className="notification-icon">
                  <NotificationsIcon />
                </Avatar>
                <Typography variant="h6" className="notification-title">
                  {notification.title}
                </Typography>
                <Chip
                  label={notification.priority}
                  size="small"
                  sx={{
                    backgroundColor: `${getPriorityColor(notification.priority)}20`,
                    color: getPriorityColor(notification.priority),
                    fontWeight: 600,
                  }}
                />
              </Box>
              <CardContent className="notification-content">
                <Typography variant="body1" className="notification-text">
                  {notification.message}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {notification.recipients.map((recipient) => (
                    <Chip
                      key={recipient}
                      label={recipient}
                      size="small"
                      sx={{ backgroundColor: 'rgba(3, 169, 244, 0.1)', color: '#03A9F4' }}
                    />
                  ))}
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Sent on {new Date(notification.date).toLocaleString()}
                </Typography>
              </CardContent>
              <Box className="notification-footer">
                <Box className="recipients-count">
                  <PeopleIcon className="recipients-icon" fontSize="small" />
                  <Typography variant="body2">
                    {notification.readCount} of {notification.totalRecipients} recipients read
                  </Typography>
                </Box>
                <Box className="notification-actions">
                  <Button
                    variant="outlined"
                    size="small"
                    className="view-button"
                    startIcon={<ViewIcon />}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    className="delete-button"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(notification.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Notifications; 