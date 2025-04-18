

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SelectRole.css';
import guestImage from './student.png';
import studentImage from './student.png';
import professionalImage from './student.png';

function SelectRole() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState(''); // State to manage error message

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError(''); // Clear error when a role is selected
    console.log(`Selected role: ${role}`);
  };

  const handleNext = () => {
    if (selectedRole) {
      navigate('/login');
    } else {
      setError('Please select a role before proceeding.');
    }
  };

  const roleImages = {
    Guest: guestImage,
    Student: studentImage,
    Professional: professionalImage,
  };

  return (
    <div className="select-role-container">
      <div className="role-card-wrapper">
        <h1 className="role-title">What's your role?</h1>
        <div className="role-cards">
          {['Guest', 'Student', 'Professional'].map((role) => (
            <div
              key={role}
              className={`role-card ${selectedRole === role ? 'card-selected' : ''}`}
              onClick={() => handleRoleSelect(role)}
            >
              <div className="role-image-placeholder">
                <img src={roleImages[role]} alt={role} className="role-image" />
              </div>
              <h2 className="role-name">{role}</h2>
              <div className="checkmark">
                <svg
                  className="checkmark-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
        <div className="next-button-wrapper">
          <button onClick={handleNext} className="next-button">
            Next
            <svg
              className="next-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        {error && <div className="error-message">{error}</div>} {/* Display error message */}
      </div>
    </div>
  );
}

export default SelectRole;