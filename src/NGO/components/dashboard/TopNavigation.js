import React from 'react';
import { Paper, IconButton, Typography, Box, Chip, Avatar } from '@mui/material';
import { Menu as MenuIcon, Person as PersonIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const TopNavigation = ({ onMenuClick }) => {
  return (
    <Paper className="top-nav" elevation={1}>
      <IconButton onClick={onMenuClick}>
        <MenuIcon />
      </IconButton>
      <Typography variant="h6" className="dashboard-title">
        NGO Dashboard
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Chip
          icon={<CheckCircleIcon />}
          label="Active"
          color="success"
          size="small"
          sx={{ mr: 2, backgroundColor: '#E8F5E9', color: '#2E7D32' }}
        />
        <IconButton className="profile-button">
          <Avatar sx={{ bgcolor: '#7CB342' }}>
            <PersonIcon />
          </Avatar>
        </IconButton>
      </Box>
    </Paper>
  );
};

export default TopNavigation; 