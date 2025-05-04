import React, { useState } from 'react';
import './SelectInterest.css';
import { useNavigate } from 'react-router-dom';
import { 
  FaTree, 
  FaBook, 
  FaUtensils, 
  FaHeartbeat, 
  FaPaw, 
  FaExclamationTriangle, 
  FaUserFriends, 
  FaVoteYea, 
  FaHome, 
  FaPaintBrush 
} from 'react-icons/fa';

const interestsData = [
  { name: 'Environmental Conservation', icon: <FaTree /> },
  { name: 'Education', icon: <FaBook /> },
  { name: 'Food Security', icon: <FaUtensils /> },
  { name: 'Health Care', icon: <FaHeartbeat /> },
  { name: 'Animal Welfare', icon: <FaPaw /> },
  { name: 'Disaster Relief', icon: <FaExclamationTriangle /> },
  { name: 'Senior Care', icon: <FaUserFriends /> },
  { name: 'Civic Engagement', icon: <FaVoteYea /> },
  { name: 'Housing Support', icon: <FaHome /> },
  { name: 'Arts and Culture', icon: <FaPaintBrush /> },
];

const SelectInterest = () => {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const navigate = useNavigate();

  const handleInterestClick = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleNext = async () => {
    try {
      // Step 1: Convert selected interest names to their indices
      console.log('Selected interests:', selectedInterests);
      const interestIndices = selectedInterests.map(interest => {
        const index = interestsData.findIndex(item => item.name === interest);
        if (index === -1) {
          console.warn(`Interest "${interest}" not found in interestsData`);
        }
        return index;
      }).filter(index => index !== -1);
      console.log('Converted interest indices:', interestIndices);

      if (interestIndices.length === 0 && selectedInterests.length > 0) {
        console.error('No valid interest indices found. Possible mismatch in interestsData.');
        alert('Error: Invalid interests selected. Please try again.');
        return;
      }

      // Step 2: Get user data and token from localStorage
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

      // Step 3: Make a PATCH request to update the user's interests
      const url = `http://localhost:5000/api/users/${user.id}/interests`;
      console.log('Making PATCH request to:', url);
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      });
      console.log('Request body:', { interests: interestIndices });

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ interests: interestIndices }),
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
        console.error('Failed to update interests:', errorMessage);
        alert(`Failed to update interests: ${errorMessage}`);
        return;
      }

      // Step 4: Process successful response
      const updatedUser = await response.json();
      console.log('Updated user data from server:', updatedUser);

      if (!updatedUser.user) {
        console.error('Updated user data is missing user object:', updatedUser);
        alert('Error: Invalid response from server. Please try again.');
        return;
      }

      // Update localStorage with the new user data
      localStorage.setItem('user', JSON.stringify(updatedUser.user));
      console.log('Updated localStorage with new user data');

      // Navigate to dashboard on success
      navigate('/select-skill');
      console.log('Navigated to /select-skill');
    } catch (error) {
      console.error('Error updating interests:', error);
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
    <div className="select-interest-container">
      <nav className="navbar">
        <a href="/" className="navbar-brand">VolunTree</a>
        <div className="navbar-links">
          <a href="/about" className="navbar-link">About</a>
          <a href="/contact" className="navbar-link">Contact</a>
          <a href="/select-role" className="navbar-link">Get Started</a>
        </div>
      </nav>
      <div className="content-box animate-slideDown">
        <h1 className="select-interest-title animate-slideDown">
          Choose Your Interests
        </h1>
        <div className="title-underline animate-slideDown"></div>
        <div className="interest-grid animate-slideDown">
          {interestsData.map((interest) => (
            <div
              key={interest.name}
              className={`interest-item ${selectedInterests.includes(interest.name) ? 'selected' : ''}`}
              onClick={() => handleInterestClick(interest.name)}
            >
              <div className="interest-icon">{interest.icon}</div>
              <span className="interest-label">{interest.name}</span>
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

export default SelectInterest;