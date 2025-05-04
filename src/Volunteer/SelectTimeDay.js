import React, { useState } from 'react';
import './SelectTimeDay.css';
import { useNavigate } from 'react-router-dom';
import { FaCalendarDay, FaTrash } from 'react-icons/fa';
import { Slider, Button, Typography } from '@mui/material';

const daysData = [
  { name: 'Monday', icon: <FaCalendarDay /> },
  { name: 'Tuesday', icon: <FaCalendarDay /> },
  { name: 'Wednesday', icon: <FaCalendarDay /> },
  { name: 'Thursday', icon: <FaCalendarDay /> },
  { name: 'Friday', icon: <FaCalendarDay /> },
  { name: 'Saturday', icon: <FaCalendarDay /> },
  { name: 'Sunday', icon: <FaCalendarDay /> },
];

// Convert 24-hour to 12-hour format with AM/PM
const formatTime = (hour) => {
  if (hour === 0) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  const period = hour >= 12 ? 'PM' : 'AM';
  const adjustedHour = hour % 12 || 12;
  return `${adjustedHour}:00 ${period}`;
};

// Format slider value label
const formatValueLabel = (value) => {
  return `${formatTime(value[0])} - ${formatTime(value[1])}`;
};

const SelectTimeDay = () => {
  const [timeRange, setTimeRange] = useState([9, 17]); // Default: 9 AM - 5 PM
  const [addedTimes, setAddedTimes] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const navigate = useNavigate();

  const handleTimeChange = (event, newValue) => {
    setTimeRange(newValue);
  };

  const handleAddTime = () => {
    if (timeRange[0] >= timeRange[1]) {
      alert('End time must be after start time.');
      return;
    }
    if (addedTimes.length >= 5) {
      alert('You can add up to 5 time ranges.');
      return;
    }
    const newTime = { startHour: timeRange[0], endHour: timeRange[1] };
    setAddedTimes([...addedTimes, newTime]);
    setTimeRange([9, 17]); // Reset slider
  };

  const handleRemoveTime = (index) => {
    setAddedTimes(addedTimes.filter((_, i) => i !== index));
  };

  const handleDayClick = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((item) => item !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleNext = async () => {
    try {
      console.log('Added time ranges:', addedTimes);
      console.log('Selected days:', selectedDays);

      if (addedTimes.length === 0 && selectedDays.length === 0) {
        alert('Please select at least one time range or day.');
        return;
      }

      const userString = localStorage.getItem('user');
      console.log('Raw user string from localStorage:', userString);

      if (!userString) {
        console.error('No user data found in localStorage');
        alert('Error: User data not found. Please log in again.');
        navigate('/login');
        return;
      }

      let user;
      try {
        user = JSON.parse(userString);
        console.log('Parsed user object:', user);
      } catch (parseError) {
        console.error('Failed to parse user data from localStorage:', parseError);
        alert('Error: Invalid user data in storage. Please log in again.');
        navigate('/login');
        return;
      }

      if (!user || !user.id) {
        console.error('User object is invalid or missing id:', user);
        alert('Error: Invalid user data (missing ID). Please log in again.');
        navigate('/login');
        return;
      }

      const token = localStorage.getItem('token');
      console.log('Retrieved token from localStorage:', token);

      if (!token) {
        console.error('No token found in localStorage');
        alert('Error: Authentication token not found. Please log in again.');
        navigate('/login');
        return;
      }

      const url = `http://localhost:5000/api/users/${user.id}/preferences`;
      console.log('Making PATCH request to:', url);
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      });
      console.log('Request body:', { timePreferences: addedTimes, dayPreferences: selectedDays });

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ timePreferences: addedTimes, dayPreferences: selectedDays }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('Error response from server:', errorData);
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError);
          errorData = { error: 'Unknown server error' };
        }

        const errorMessage = errorData.error || `Server responded with status ${response.status}`;
        console.error('Failed to update preferences:', errorMessage);
        alert(`Failed to update preferences: ${errorMessage}`);
        return;
      }

      const updatedUser = await response.json();
      console.log('Updated user data from server:', updatedUser);

      if (!updatedUser.user) {
        console.error('Updated user data is missing user object:', updatedUser);
        alert('Error: Invalid response from server. Please try again.');
        return;
      }

      localStorage.setItem('user', JSON.stringify(updatedUser.user));
      console.log('Updated localStorage with new user data');

      navigate('/select-location');
      console.log('Navigated to /select-location');
    } catch (error) {
      console.error('Error updating preferences:', error);
      console.error('Error stack:', error.stack);
      let errorMessage = 'An error occurred. Please try again.';

      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check if the backend is running on http://localhost:5000.';
      } else if (error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }

      alert(errorMessage);
    }
  };

  return (
    <div className="select-timeday-container">
      <nav className="navbar">
        <a href="/" className="navbar-brand">VolunTree</a>
        <div className="navbar-links">
          <a href="/about" className="navbar-link">About</a>
          <a href="/contact" className="navbar-link">Contact</a>
          <a href="/select-role" className="navbar-link">Get Started</a>
        </div>
      </nav>
      <div className="content-box animate-slideDown">
        <h1 className="select-timeday-title animate-slideDown">
          Choose Your Time and Day Preferences
        </h1>
        <div className="title-underline animate-slideDown"></div>
        <div className="time-range-section animate-slideDown">
          <h2 className="section-title">Select Time Range</h2>
          <Typography className="time-display">
            Selected: {formatTime(timeRange[0])} - {formatTime(timeRange[1])}
          </Typography>
          <Slider
            value={timeRange}
            onChange={handleTimeChange}
            valueLabelDisplay="on"
            valueLabelFormat={formatValueLabel}
            min={0}
            max={24}
            step={1}
            className="time-slider"
          />
          <Button
            className="add-time-button"
            onClick={handleAddTime}
          >
            Add Time Range
          </Button>
          {addedTimes.length > 0 && (
            <div className="added-times">
              <h3 className="added-times-title">Added Time Ranges</h3>
              {addedTimes.map((time, index) => (
                <div key={index} className="added-time-item">
                  <span>{formatTime(time.startHour)} - {formatTime(time.endHour)}</span>
                  <FaTrash
                    className="remove-time-icon"
                    onClick={() => handleRemoveTime(index)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <h2 className="section-title animate-slideDown">Select Days</h2>
        <div className="timeday-grid animate-slideDown">
          {daysData.map((day) => (
            <div
              key={day.name}
              className={`timeday-item ${selectedDays.includes(day.name) ? 'selected' : ''}`}
              onClick={() => handleDayClick(day.name)}
            >
              <div className="timeday-icon">{day.icon}</div>
              <span className="timeday-label">{day.name}</span>
            </div>
          ))}
        </div>
        <button
          className="cta-button animate-slideDown"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SelectTimeDay;