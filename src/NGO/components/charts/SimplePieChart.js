import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';

const SimplePieChart = ({ data, size = 120 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  return (
    <Box sx={{ position: 'relative', width: size, height: size, margin: '0 auto', mt: 1 }}>
      {data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        currentAngle += angle;
        return (
          <Tooltip key={index} title={`${item.name}: ${percentage.toFixed(0)}%`}>
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((startAngle * Math.PI) / 180)}% ${50 + 50 * Math.sin((startAngle * Math.PI) / 180)}%, ${50 + 50 * Math.cos(((startAngle + angle) * Math.PI) / 180)}% ${50 + 50 * Math.sin(((startAngle + angle) * Math.PI) / 180)}%)`,
                backgroundColor: ['#7CB342', '#689F38', '#8BC34A', '#9CCC65'][index % 4],
              }}
            />
          </Tooltip>
        );
      })}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          backgroundColor: '#F5F5F5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2" sx={{ color: '#5D4037' }}>
          {total}
        </Typography>
      </Box>
    </Box>
  );
};

export default SimplePieChart; 