import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SelectRole.css';
import volunteerImage from './volunteering.png';
import studentImage from './studentt.png';
import orgRepImage from './ngo.png';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';

function SelectRole() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState('');
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    console.log(`Selected role: ${role}`);
  };

  const handleNext = () => {
    if (selectedRole) {
      navigate('/signup', { state: { selectedRole } });
    } else {
      setError('Please select a role before proceeding.');
    }
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    setAboutOpen(true);
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    setContactOpen(true);
  };

  const handleCloseAbout = () => {
    setAboutOpen(false);
  };

  const handleCloseContact = () => {
    setContactOpen(false);
  };

  const roleImages = {
    Volunteer: volunteerImage,
    Student: studentImage,
    'Organization Representative': orgRepImage,
  };

  return (
    <div className="select-role-container">
      <nav className="navbar">
        <a href="/" className="navbar-brand">VolunTree</a>
        <div className="navbar-links">
          <a href="/about" className="navbar-link" onClick={handleAboutClick}>About</a>
          <a href="/contact" className="navbar-link" onClick={handleContactClick}>Contact</a>
          <a href="/select-role" className="navbar-link">Get Started</a>
        </div>
      </nav>
      <div className="role-card-wrapper">
        <h1 className="role-title">What's your role?</h1>
        <div className="role-cards">
          {['Student', 'Volunteer', 'Organization Representative'].map((role) => (
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
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* About Popup */}
      <Dialog
        open={aboutOpen}
        onClose={handleCloseAbout}
        PaperProps={{
          style: {
            borderRadius: '16px',
            backgroundColor: '#EFDED4',
            padding: '16px',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 600,
            fontSize: '1.5rem',
            color: '#FBBF24',
            textAlign: 'center',
            paddingBottom: '8px',
          }}
        >
          About VolunTree 🌳
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '1rem',
              color: '#5D4037',
              textAlign: 'center',
            }}
          >
            VolunTree connects volunteers and NGOs to grow opportunities for positive impact! 🌱
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', paddingTop: '8px' }}>
          <Button
            onClick={handleCloseAbout}
            sx={{
              backgroundColor: '#FBBF24',
              color: '#fff',
              borderRadius: '9999px',
              padding: '8px 24px',
              textTransform: 'none',
              fontFamily: '"Inter", sans-serif',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#D97706',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Popup */}
      <Dialog
        open={contactOpen}
        onClose={handleCloseContact}
        PaperProps={{
          style: {
            borderRadius: '16px',
            backgroundColor: '#EFDED4',
            padding: '16px',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 600,
            fontSize: '1.5rem',
            color: '#FBBF24',
            textAlign: 'center',
            paddingBottom: '8px',
          }}
        >
          Contact Us 📧
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '1rem',
                color: '#5D4037',
                marginBottom: '8px',
              }}
            >
              📧 Email: contact@voluntree.org
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '1rem',
                color: '#5D4037',
              }}
            >
              📍 Location: 123 Community Lane, Green City
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', paddingTop: '8px' }}>
          <Button
            onClick={handleCloseContact}
            sx={{
              backgroundColor: '#FBBF24',
              color: '#fff',
              borderRadius: '9999px',
              padding: '8px 24px',
              textTransform: 'none',
              fontFamily: '"Inter", sans-serif',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#D97706',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SelectRole;