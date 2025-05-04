import React, { useState } from 'react';
import './Welcome.css';
import illustration from './illus.jpg';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';

const Welcome = () => {
  const navigate = useNavigate();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

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

  return (
    <div className="welcome-container">
      <nav className="navbar">
        <a href="/" className="navbar-brand">VolunTree</a>
        <div className="navbar-links">
          <a href="/about" className="navbar-link" onClick={handleAboutClick}>About</a>
          <a href="/contact" className="navbar-link" onClick={handleContactClick}>Contact</a>
          <a href="/select-role" className="navbar-link">Get Started</a>
        </div>
      </nav>
      <div className="text-content">
        <h1 className="welcome-title animate-fadeIn">
          Welcome to VolunTree
        </h1>
        <p className="welcome-subtitle animate-fadeIn">
          Connect with students, volunteers, and NGOs to make a difference. Join our community and grow opportunities for positive impact.
        </p>
        <button 
          className="cta-button animate-fadeIn"
          onClick={() => navigate('/select-role')}
        >
          Get Started
        </button>
      </div>
      <div className="image-container">
        <img 
          src={illustration}
          alt="VolunTree Illustration" 
          className="illustration animate-fadeIn"
        />
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
};

export default Welcome;
