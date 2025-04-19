import React from 'react';
import { Box, Typography } from '@mui/material';

const SimpleLineChart = ({ data, height = 120 }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue;
  return (
    <Box sx={{ height, position: 'relative', mt: 1 }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d={data
            .map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.value - minValue) / range) * 80;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ')}
          fill="none"
          stroke="#7CB342"
          strokeWidth="2"
        />
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((item.value - minValue) / range) * 80;
          return <circle key={index} cx={x} cy={y} r="2" fill="#7CB342" />;
        })}
      </svg>
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

export default SimpleLineChart; 