import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Rating } from '@mui/material';
import TopNavigation from './components/dashboard/TopNavigation';
import SideDrawer from './components/dashboard/SideDrawer';
import '../styles/NGO/ViewVolunteerRatings.css';

const ViewVolunteerRatings = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [organizationRatings, setOrganizationRatings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (!token || !storedUser) {
          setError('Please log in to view ratings');
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        const organizationId = parsedUser.id; // Assumes the logged-in user is an organization

        const response = await fetch(`http://localhost:5000/api/ratings/organization/${organizationId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setOrganizationRatings(data.ratings);
        } else {
          setError(data.error || 'Failed to fetch ratings');
        }
      } catch (err) {
        setError('An error occurred while fetching ratings. Please try again.');
        console.error(err);
      }
    };

    fetchRatings();
  }, []);

  const handleMenuItemClick = (text) => {
    setDrawerOpen(false);
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        bgcolor: 'transparent'
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
          bgcolor: '#EFDED4',
          zIndex: 0,
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

        <Box className="ratings-content">
          <Paper 
            className="ratings-section" 
            elevation={0}
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="h4" className="ratings-title">
              Organization Ratings
            </Typography>
            <Typography variant="body1" className="ratings-subtitle">
              Review feedback and ratings from volunteers
            </Typography>

            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <TableContainer className="ratings-table">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="table-header">Volunteer Name</TableCell>
                    <TableCell className="table-header">Event</TableCell>
                    <TableCell className="table-header">Rating</TableCell>
                    <TableCell className="table-header">Feedback</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {organizationRatings.length > 0 ? (
                    organizationRatings.map((rating) => (
                      <TableRow key={rating._id} className="table-row">
                        <TableCell className="table-cell">{rating.volunteerName}</TableCell>
                        <TableCell className="table-cell">{rating.eventTitle}</TableCell>
                        <TableCell className="table-cell">
                          <Rating value={rating.rating} readOnly precision={0.5} />
                        </TableCell>
                        <TableCell className="table-cell">
                          {rating.feedback || 'No feedback provided'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="table-cell" align="center">
                        No ratings available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ViewVolunteerRatings;