import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Slider,
} from '@mui/material';
import { FaCalendarDay } from 'react-icons/fa';
import './EditPreference.css';

// Available options
const allInterests = [
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
const allSkills = ['Event Planning', 'Teaching', 'Fundraising', 'Graphic Design', 'Public Speaking'];
const allLocations = ['New York, NY', 'San Francisco, CA', 'Chicago, IL', 'Los Angeles, CA', 'Boston, MA'];
const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EditPreference = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    interests: [],
    skills: [],
    locations: [],
    availability: [], // [{ day: "Monday", timeRange: [9, 17] }]
  });
  const [error, setError] = useState(null);

  // Time range slider configuration
  const timeMarks = [
    { value: 0, label: '12:00 AM' },
    { value: 6, label: '6:00 AM' },
    { value: 12, label: '12:00 PM' },
    { value: 18, label: '6:00 PM' },
    { value: 24, label: '12:00 AM' },
  ];

  const formatTimeRange = (range) => {
    const start = range[0];
    const end = range[1];
    const startHour = start % 12 || 12;
    const endHour = end % 12 || 12;
    const startPeriod = start < 12 ? 'AM' : 'PM';
    const endPeriod = end < 12 ? 'AM' : 'PM';
    return `${startHour}:00 ${startPeriod} - ${endHour}:00 ${endPeriod}`;
  };

  // Fetch initial preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const userString = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!userString || !token) {
          console.error('No user or token found in localStorage');
          alert('Please log in to edit preferences.');
          navigate('/login');
          return;
        }

        let user;
        try {
          user = JSON.parse(userString);
        } catch (parseError) {
          console.error('Failed to parse user data:', parseError);
          alert('Invalid user data. Please log in again.');
          navigate('/login');
          return;
        }

        if (!user || !user.id) {
          console.error('Invalid user data:', user);
          alert('Invalid user data. Please log in again.');
          navigate('/login');
          return;
        }

        const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to fetch preferences:', errorData);
          alert(`Failed to fetch preferences: ${errorData.error}`);
          navigate('/login');
          return;
        }

        const { user: fetchedUser } = await response.json();
        console.log('Fetched user preferences:', fetchedUser);

        // Map indices to strings for interests and skills
        const mappedPreferences = {
          interests: fetchedUser.interests.map((index) => allInterests[index] || ''),
          skills: fetchedUser.skills.map((index) => allSkills[index] || ''),
          locations: fetchedUser.locationPreferences || [],
          availability: fetchedUser.timePreferences
            .filter((pref) => pref.day) // Only include day-based preferences
            .map((pref) => ({
              day: pref.day,
              timeRange: [pref.startHour, pref.endHour],
            })),
        };

        setPreferences(mappedPreferences);
      } catch (error) {
        console.error('Error fetching preferences:', error);
        setError('Failed to load preferences. Please try again.');
      }
    };

    fetchPreferences();
  }, [navigate]);

  const handleChipToggle = (category, value) => {
    setPreferences((prev) => {
      const current = prev[category];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter((item) => item !== value) };
      }
      return { ...prev, [category]: [...current, value] };
    });
  };

  const handleLocationChange = (event) => {
    const value = event.target.value;
    setPreferences((prev) => ({
      ...prev,
      locations: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleDayClick = (day) => {
    setPreferences((prev) => {
      const exists = prev.availability.some((item) => item.day === day);
      if (exists) {
        return {
          ...prev,
          availability: prev.availability.filter((item) => item.day !== day),
        };
      }
      if (prev.availability.length >= 7) {
        alert('You can select up to 7 days.');
        return prev;
      }
      return {
        ...prev,
        availability: [...prev.availability, { day, timeRange: [9, 17] }],
      };
    });
  };

  const handleTimeRangeChange = (day, newValue) => {
    if (newValue[1] <= newValue[0]) {
      alert('End time must be after start time.');
      return;
    }
    setPreferences((prev) => ({
      ...prev,
      availability: prev.availability.map((item) =>
        item.day === day ? { ...item, timeRange: newValue } : item
      ),
    }));
  };

  const handleRemoveDay = (day) => {
    setPreferences((prev) => ({
      ...prev,
      availability: prev.availability.filter((item) => item.day !== day),
    }));
  };

  const handleSave = async () => {
    try {
      const userString = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!userString || !token) {
        console.error('No user or token found in localStorage');
        alert('Please log in to save preferences.');
        navigate('/login');
        return;
      }

      let user;
      try {
        user = JSON.parse(userString);
      } catch (parseError) {
        console.error('Failed to parse user data:', parseError);
        alert('Invalid user data. Please log in again.');
        navigate('/login');
        return;
      }

      if (!user || !user.id) {
        console.error('Invalid user data:', user);
        alert('Invalid user data. Please log in again.');
        navigate('/login');
        return;
      }

      // Map preferences to backend format
      const payload = {
        interests: preferences.interests
          .map((interest) => allInterests.indexOf(interest))
          .filter((index) => index !== -1),
        skills: preferences.skills
          .map((skill) => allSkills.indexOf(skill))
          .filter((index) => index !== -1),
        locationPreferences: preferences.locations,
        timePreferences: preferences.availability.map((item) => ({
          day: item.day,
          startHour: item.timeRange[0],
          endHour: item.timeRange[1],
        })),
        dayPreferences: preferences.availability.map((item) => item.day),
      };

      console.log('Saving preferences:', payload);

      const response = await fetch(`http://localhost:5000/api/users/${user.id}/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update preferences:', errorData);
        alert(`Failed to update preferences: ${errorData.error}`);
        return;
      }

      const updatedUser = await response.json();
      console.log('Preferences updated:', updatedUser);

      localStorage.setItem('user', JSON.stringify(updatedUser.user));
      navigate('/volundashboard');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    }
  };

  if (error) {
    return (
      <Box className="edit-preference-wrapper">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box className="edit-preference-wrapper">
      <nav className="navbar">
        <a href="/" className="navbar-brand">VolunTree</a>
        <div className="navbar-links">
          <a href="/about" className="navbar-link">About</a>
          <a href="/contact" className="navbar-link">Contact</a>
          <a href="/select-role" className="navbar-link">Get Started</a>
        </div>
      </nav>
      <Container component="main" className="edit-preference-container" disableGutters maxWidth={false}>
        <Box className="edit-preference-main">
          <Typography variant="h4" className="section-heading">
            Edit Your <span className="preference-green">Preferences</span>
          </Typography>

          {/* Interests */}
          <Box className="preference-section">
            <Typography variant="h6" className="section-title">
              Interests
            </Typography>
            <Box className="chip-container">
              {allInterests.map((interest) => (
                <Chip
                  key={interest}
                  label={interest}
                  className={`preference-chip ${preferences.interests.includes(interest) ? 'selected' : ''}`}
                  onClick={() => handleChipToggle('interests', interest)}
                />
              ))}
            </Box>
          </Box>

          {/* Skills */}
          <Box className="preference-section">
            <Typography variant="h6" className="section-title">
              Skills
            </Typography>
            <Box className="chip-container">
              {allSkills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  className={`preference-chip ${preferences.skills.includes(skill) ? 'selected' : ''}`}
                  onClick={() => handleChipToggle('skills', skill)}
                />
              ))}
            </Box>
          </Box>

          {/* Preferred Location */}
          <Box className="preference-section">
            <Typography variant="h6" className="section-title">
              Preferred Location
            </Typography>
            <FormControl fullWidth className="location-select">
              <InputLabel>Locations</InputLabel>
              <Select
                multiple
                value={preferences.locations}
                onChange={handleLocationChange}
                input={<OutlinedInput label="Locations" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {allLocations.map((location) => (
                  <MenuItem key={location} value={location}>
                    <Checkbox checked={preferences.locations.includes(location)} />
                    <ListItemText primary={location} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Availability */}
          <Box className="preference-section">
            <Typography variant="h6" className="section-title">
              Availability
            </Typography>
            <Typography variant="body1" className="day-label">
              Select Days
            </Typography>
            <Box className="day-grid">
              {allDays.map((day) => (
                <Box
                  key={day}
                  className={`day-item ${preferences.availability.some((item) => item.day === day) ? 'selected' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  <FaCalendarDay className="day-icon" />
                  <Typography>{day}</Typography>
                </Box>
              ))}
            </Box>
            <Box className="availability-list">
              {preferences.availability.map((item) => (
                <Box key={item.day} className="availability-item">
                  <Box className="availability-header">
                    <Typography variant="body1">{item.day}</Typography>
                    <Button
                      className="remove-button"
                      onClick={() => handleRemoveDay(item.day)}
                    >
                      Remove
                    </Button>
                  </Box>
                  <Slider
                    value={item.timeRange}
                    onChange={(e, newValue) => handleTimeRangeChange(item.day, newValue)}
                    valueLabelDisplay="on"
                    valueLabelFormat={() => formatTimeRange(item.timeRange)}
                    min={0}
                    max={24}
                    step={1}
                    marks={timeMarks}
                    className="time-slider"
                  />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Save Button */}
          <Box className="save-button-container">
            <Button className="save-button" onClick={handleSave}>
              Save Preferences
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default EditPreference;