import React from 'react';
import './Welcome.css';
import illustration from './illus.jpg'; // Import the image
import { useNavigate } from 'react-router-dom'; // Corrected import for useNavigate

const Welcome = () => {
  const navigate = useNavigate(); // Initialize navigate hook

  return (
    <div className="welcome-container">
      <nav className="navbar">
        <a href="/" className="navbar-brand">VolunTree</a>
        <div className="navbar-links">
          <a href="/about" className="navbar-link">About</a>
          <a href="/contact" className="navbar-link">Contact</a>
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
          onClick={() => navigate('/select-role')} // Add navigation on button click
        >
          Get Started
        </button>
      </div>
      <div className="image-container">
        <img 
          src={illustration} // Use the imported image variable
          alt="VolunTree Illustration" 
          className="illustration animate-fadeIn"
        />
      </div>
    </div>
  );
};

export default Welcome;