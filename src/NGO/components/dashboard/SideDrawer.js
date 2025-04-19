import React from 'react';
import { Drawer, Box, Typography, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { menuItems } from '../../data/dashboardData';
import { iconMap } from '../../utils/iconMap';

const SideDrawer = ({ open, onClose, onMenuItemClick }) => {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      className="dashboard-drawer"
    >
      <Box className="drawer-header">
        <Typography variant="h6">Menu</Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <ListItem 
              button 
              key={item.text} 
              className="drawer-item"
              onClick={() => onMenuItemClick(item.text)}
            >
              <ListItemIcon>{Icon && <Icon />}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default SideDrawer; 