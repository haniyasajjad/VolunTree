import React from 'react';
import { Grid, Card, CardContent, Box, Typography } from '@mui/material';
import { People as PeopleIcon, Add as AddIcon, Event as EventIcon, PendingActions as PendingActionsIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { metrics } from '../../data/dashboardData';

const iconMap = {
  PeopleIcon: PeopleIcon,
  AddIcon: AddIcon,
  EventIcon: EventIcon,
  PendingActionsIcon: PendingActionsIcon,
};

const MetricsSection = () => {
  return (
    <>
      <Typography variant="h5" className="section-title">
        Key Metrics
      </Typography>
      <Grid container spacing={2} className="metrics-grid" justifyContent="center">
        {metrics.map((metric) => {
          const Icon = iconMap[metric.icon];
          return (
            <Grid item xs={6} sm={4} md={3} key={metric.title}>
              <Card className="metric-card">
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Box className="metric-icon-box">
                    {Icon && <Icon sx={{ fontSize: 24, color: metric.color }} />}
                  </Box>
                  <Typography variant="h4" className="metric-value" sx={{ color: metric.color }}>
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" className="metric-title">
                    {metric.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <TrendingUpIcon sx={{ color: '#7CB342', fontSize: 14, mr: 0.25 }} />
                    <Typography variant="caption" sx={{ color: '#7CB342', fontSize: '0.7rem' }}>
                      +12% from last month
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};

export default MetricsSection; 