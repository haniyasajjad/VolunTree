import React from 'react';
import { Grid, Card, CardContent, Box, Typography } from '@mui/material';
import { BarChart as BarChartIcon, PieChart as PieChartIcon, Timeline as TimelineIcon } from '@mui/icons-material';
import SimpleBarChart from '../charts/SimpleBarChart';
import SimplePieChart from '../charts/SimplePieChart';
import SimpleLineChart from '../charts/SimpleLineChart';
import { volunteerEngagementData, opportunityCategories } from '../../data/dashboardData';

const InsightsSection = () => {
  return (
    <>
      <Typography variant="h4" className="section-title">
        Performance Insights
      </Typography>
      <Grid container spacing={2} className="insights-grid">
        <Grid item xs={12} sm={6} md={4}>
          <Card className="insight-card">
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box className="insight-icon-box">
                <BarChartIcon sx={{ color: '#2E7D32', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" className="insight-title">
                Volunteer Engagement
              </Typography>
              <SimpleBarChart data={volunteerEngagementData} />
              <Typography variant="body2" className="insight-description">
                Monthly engagement rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card className="insight-card">
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box className="insight-icon-box">
                <PieChartIcon sx={{ color: '#2E7D32', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" className="insight-title">
                Opportunity Categories
              </Typography>
              <SimplePieChart data={opportunityCategories} />
              <Typography variant="body2" className="insight-description">
                Distribution of opportunities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card className="insight-card">
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box className="insight-icon-box">
                <TimelineIcon sx={{ color: '#2E7D32', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" className="insight-title">
                Volunteer Growth
              </Typography>
              <SimpleLineChart data={volunteerEngagementData} />
              <Typography variant="body2" className="insight-description">
                Participation trend
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default InsightsSection; 
