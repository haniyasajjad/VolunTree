import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';

const SimpleBarChart = ({ data, height = 120 }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  return (
    <Box sx={{ height, display: 'flex', alignItems: 'flex-end', gap: 0.5, mt: 1 }}>
      {data.map((item, index) => (
        <Tooltip key={index} title={`${item.month}: ${item.value}%`}>
          <Box
            sx={{
              flex: 1,
              height: `${(item.value / maxValue) * 100}%`,
              backgroundColor: '#7CB342',
              borderRadius: '4px 4px 0 0',
              transition: 'height 0.3s ease',
            }}
          />
        </Tooltip>
      ))}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        {data.map((item, index) => (
          <Typography key={index} variant="caption" sx={{ color: '#5D4037' }}>
            {item.month}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default SimpleBarChart; 
