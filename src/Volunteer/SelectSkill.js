import React, { useState } from 'react';
import './SelectSkill.css';
import { useNavigate } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaChalkboardTeacher, 
  FaHandHoldingHeart, 
  FaPaintRoller, 
  FaMicrophone 
} from 'react-icons/fa';

const skillsData = [
  { name: 'Event Planning', icon: <FaCalendarAlt /> },
  { name: 'Teaching', icon: <FaChalkboardTeacher /> },
  { name: 'Fundraising', icon: <FaHandHoldingHeart /> },
  { name: 'Graphic Design', icon: <FaPaintRoller /> },
  { name: 'Public Speaking', icon: <FaMicrophone /> },
];

const SelectSkill = () => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const navigate = useNavigate();

  const handleSkillClick = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((item) => item !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleNext = async () => {
    try {
      // Step 1: Convert selected skill names to their indices
      console.log('Selected skills:', selectedSkills);
      const skillIndices = selectedSkills.map(skill => {
        const index = skillsData.findIndex(item => item.name === skill);
        if (index === -1) {
          console.warn(`Skill "${skill}" not found in skillsData`);
        }
        return index;
      }).filter(index => index !== -1);
      console.log('Converted skill indices:', skillIndices);

      if (skillIndices.length === 0 && selectedSkills.length > 0) {
        console.error('No valid skill indices found. Possible mismatch in skillsData.');
        alert('Error: Invalid skills selected. Please try again.');
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

      // Step 3: Make a PATCH request to update the user's skills
      const url = `http://localhost:5000/api/users/${user.id}/skills`;
      console.log('Making PATCH request to:', url);
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      });
      console.log('Request body:', { skills: skillIndices });

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ skills: skillIndices }),
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
        console.error('Failed to update skills:', errorMessage);
        alert(`Failed to update skills: ${errorMessage}`);
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
      navigate('/select-timeday');
      console.log('Navigated to /select-timeday');
    } catch (error) {
      console.error('Error updating skills:', error);
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
    <div className="select-skill-container">
      <nav className="navbar">
        <a href="/" className="navbar-brand">VolunTree</a>
        <div className="navbar-links">
          <a href="/about" className="navbar-link">About</a>
          <a href="/contact" className="navbar-link">Contact</a>
          <a href="/select-role" className="navbar-link">Get Started</a>
        </div>
      </nav>
      <div className="content-box animate-slideDown">
        <h1 className="select-skill-title animate-slideDown">
          Choose Your Skills
        </h1>
        <div className="title-underline animate-slideDown"></div>
        <div className="skill-grid animate-slideDown">
          {skillsData.map((skill) => (
            <div
              key={skill.name}
              className={`skill-item ${selectedSkills.includes(skill.name) ? 'selected' : ''}`}
              onClick={() => handleSkillClick(skill.name)}
            >
              <div className="skill-icon">{skill.icon}</div>
              <span className="skill-label">{skill.name}</span>
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

export default SelectSkill;