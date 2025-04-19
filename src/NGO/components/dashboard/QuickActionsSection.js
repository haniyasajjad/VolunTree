import React from 'react';
import { Grid, Card, CardContent, CardActions, Button, Box, Typography } from '@mui/material';
import { Add as AddIcon, People as PeopleIcon, Event as EventIcon, Notifications as NotificationsIcon } from '@mui/icons-material';

const QuickActionsSection = ({ onPostOpportunity, onMatchVolunteers, onManageEvents, onSendNotifications }) => {
  const actions = [
    { title: 'Post Opportunity', icon: <AddIcon />, button: 'Create', color: '#4CAF50', onClick: onPostOpportunity },
    { title: 'Match Volunteers', icon: <PeopleIcon />, button: 'Match', color: '#7CB342', onClick: onMatchVolunteers },
    { title: 'Manage Events', icon: <EventIcon />, button: 'View', color: '#7CB342', onClick: onManageEvents },
    { title: 'Notifications', icon: <NotificationsIcon />, button: 'Send', color: '#7CB342', onClick: onSendNotifications },
  ];

  return (
    <>
      <Typography variant="h5" className="section-title">
        Quick Actions
      </Typography>
      <Grid container spacing={3} className="actions-grid" justifyContent="center">
        {actions.map((action) => (
          <Grid item xs={6} sm={4} md={3} key={action.title}>
            <Card className="action-card" onClick={action.onClick} sx={{ cursor: 'pointer' }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: '50%', 
                      backgroundColor: '#E8F5E9', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mb: 1
                    }}
                  >
                    {React.cloneElement(action.icon, { sx: { color: action.color, fontSize: 30 } })}
                  </Box>
                  <Typography variant="h6" className="card-title">
                    {action.title}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button 
                  startIcon={action.icon}
                  variant="contained" 
                  className="action-button"
                  sx={{ backgroundColor: action.color }}
                  onClick={action.onClick}
                >
                  {action.button}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default QuickActionsSection; 