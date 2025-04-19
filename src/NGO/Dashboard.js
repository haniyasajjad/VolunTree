import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';
import TopNavigation from './components/dashboard/TopNavigation';
import SideDrawer from './components/dashboard/SideDrawer';
import MetricsSection from './components/dashboard/MetricsSection';
import InsightsSection from './components/dashboard/InsightsSection';
import QuickActionsSection from './components/dashboard/QuickActionsSection';
import '../styles/NGO/Dashboard.css';

const Dashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handlePostOpportunity = () => {
    navigate('/ngo/post-opportunity');
  };

  const handleMatchVolunteers = () => {
    navigate('/ngo/match-volunteers');
  };

  const handleManageEvents = () => {
    navigate('/ngo/event-management');
  };

  const handleSendNotifications = () => {
    navigate('/ngo/notifications');
  };

  const handleMenuItemClick = (text) => {
    switch (text) {
      case 'Post Opportunities':
        handlePostOpportunity();
        break;
      case 'Match Volunteers':
        handleMatchVolunteers();
        break;
      case 'Manage Events':
        handleManageEvents();
        break;
      case 'Send Notifications':
        handleSendNotifications();
        break;
      default:
        break;
    }
    setDrawerOpen(false);
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        bgcolor: 'transparent' // Make background transparent
      }}
    >
      {/* Video Background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'black',
          zIndex: 0, // Set to 0 to be above the base layer
          overflow: 'hidden'
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        >
          <source src="/dash_bg2.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </Box>

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <TopNavigation onMenuClick={() => setDrawerOpen(true)} />
        
        <SideDrawer 
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onMenuItemClick={handleMenuItemClick}
        />

        <Box className="dashboard-content">
          <Paper 
            className="welcome-section" 
            elevation={0}
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
              backdropFilter: 'blur(10px)' // Add blur effect
            }}
          >
            <Typography variant="h4" className="welcome-title">
              Welcome back, <span className="highlight">Green Earth NGO</span>
            </Typography>
            <Typography variant="body1" className="welcome-subtitle">
              Here's what's happening with your volunteer program today
            </Typography>
          </Paper>

          <MetricsSection />
          <InsightsSection />
          <QuickActionsSection 
            onPostOpportunity={handlePostOpportunity}
            onMatchVolunteers={handleMatchVolunteers}
            onManageEvents={handleManageEvents}
            onSendNotifications={handleSendNotifications}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;