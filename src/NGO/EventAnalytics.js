import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import TopNavigation from './components/dashboard/TopNavigation';
import SideDrawer from './components/dashboard/SideDrawer';
import '../styles/NGO/EventAnalytics.css';

const EventAnalytics = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [uniqueVolunteers, setUniqueVolunteers] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [error, setError] = useState('');

  const handleMenuItemClick = (text) => {
    setDrawerOpen(false);
  };

  const fetchEventAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view analytics');
        return;
      }

      const response = await fetch('http://localhost:5000/api/opportunities/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to fetch analytics');
        return;
      }

      setUniqueVolunteers(data.uniqueVolunteers || 0);
      setTotalHours(data.totalHours || 0);
      setAnalyticsData(data.events || []);
    } catch (err) {
      setError('An error occurred while fetching analytics. Please try again.');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEventAnalytics();
  }, []);

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

        <Box className="analytics-content">
          <Paper 
            className="analytics-section" 
            elevation={0}
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="h4" className="analytics-title">
              Event Analytics
            </Typography>
            <Typography variant="body1" className="analytics-subtitle">
              Track volunteer participation and event impact
            </Typography>

            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Grid container spacing={3} className="analytics-grid">
              <Grid item xs={12} md={6}>
                <Paper className="metric-card" elevation={0}>
                  <Typography className="metric-title">Unique Volunteers</Typography>
                  <Typography className="metric-value">
                    {uniqueVolunteers}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper className="metric-card" elevation={0}>
                  <Typography className="metric-title">Total Hours Contributed</Typography>
                  <Typography className="metric-value">
                    {totalHours}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <TableContainer className="analytics-table">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="table-header">Event Name</TableCell>
                    <TableCell className="table-header">Date</TableCell>
                    <TableCell className="table-header">Volunteers</TableCell>
                    <TableCell className="table-header">Hours</TableCell>
                    <TableCell className="table-header">Status</TableCell>
                    <TableCell className="table-header">Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData.map((event) => (
                    <TableRow key={event.eventId} className="table-row">
                      <TableCell className="table-cell">{event.eventName}</TableCell>
                      <TableCell className="table-cell">{event.date}</TableCell>
                      <TableCell className="table-cell">{event.volunteersAttended}</TableCell>
                      <TableCell className="table-cell">{event.totalHours}</TableCell>
                      <TableCell className="table-cell">{event.status}</TableCell>
                      <TableCell className="table-cell">{event.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default EventAnalytics;