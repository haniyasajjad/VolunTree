import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  CircularProgress,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
import {
  Add as AddIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  Description as DescriptionIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import '../styles/NGO/PostOpportunity.css';

const PostOpportunity = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    duration: '',
    maxVolunteers: '',
    category: '',
    skills: [],
    requirements: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = [
    'Education',
    'Environment',
    'Healthcare',
    'Community Service',
    'Animal Welfare',
    'Arts & Culture',
    'Sports & Recreation',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Here you would typically make an API call to save the opportunity
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API call
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        time: '',
        duration: '',
        maxVolunteers: '',
        category: '',
        skills: [],
        requirements: '',
      });
    } catch (err) {
      setError('Failed to post opportunity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/ngo/dashboard');
  };

  return (
    <div className="post-opportunity-container">
      <video
        className="post-opportunity-bg"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/dash_bg4.mp4" type="video/mp4" />
      </video>
      <div className="post-opportunity-content">
        <Box className="post-opportunity-header">
          <Typography variant="h4" className="page-title">
            Post New Opportunity
          </Typography>
          <Typography variant="subtitle1" className="page-subtitle">
            Create a new volunteering opportunity for your organization
          </Typography>
        </Box>
        <Paper className="post-opportunity-form" elevation={1}>
          <video
            className="form-video-bg"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/dash_bg4.mp4" type="video/mp4" />
          </video>
          <div className="form-content">
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Opportunity Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    className="form-field"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon className="field-icon" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    multiline
                    rows={4}
                    variant="outlined"
                    className="form-field"
                    placeholder="Describe the volunteering opportunity in detail..."
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    className="form-field"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon className="field-icon" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined" className="form-field">
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      label="Category"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    className="form-field"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    className="form-field"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TimeIcon className="field-icon" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Duration (hours)"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    className="form-field"
                    InputProps={{
                      inputProps: { min: 1 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Maximum Volunteers"
                    name="maxVolunteers"
                    type="number"
                    value={formData.maxVolunteers}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    className="form-field"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <GroupIcon className="field-icon" />
                        </InputAdornment>
                      ),
                      inputProps: { min: 1 }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    variant="outlined"
                    className="form-field"
                    placeholder="Any specific requirements for volunteers..."
                  />
                </Grid>

                <Grid item xs={12}>
                  {error && (
                    <Typography color="error" className="error-message">
                      {error}
                    </Typography>
                  )}
                  {success && (
                    <Typography color="success" className="success-message">
                      Opportunity posted successfully!
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} className="form-actions">
                  <Button
                    type="submit"
                    variant="contained"
                    className="submit-button"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                  >
                    {loading ? 'Posting...' : 'Post Opportunity'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default PostOpportunity; 