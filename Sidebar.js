import React from 'react';
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { alpha, useTheme } from '@mui/material/styles';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar content
  const sidebarItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Drivers', icon: <PeopleIcon />, path: '/drivers' },
    { text: 'Dispatchers', icon: <AssignmentIcon />, path: '/dispatchers' },
    { text: 'Loads', icon: <LocalShippingIcon />, path: '/loads' },
  ];

  const sidebar = (
    <Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        backgroundColor: 'primary.main',
        color: 'white'
      }}>
        <LocalShippingIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          TMS Pro
        </Typography>
      </Box>
      <Divider />
      <List>
        {sidebarItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setSidebarOpen(false);
            }}
            sx={{
              backgroundColor: location.pathname === item.path
                ? alpha(theme.palette.primary.main, 0.1)
                : 'transparent',
              borderRight: location.pathname === item.path
                ? `3px solid ${theme.palette.primary.main}`
                : 'none',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              },
              my: 0.5
            }}
          >
            <ListItemIcon sx={{
              color: location.pathname === item.path
                ? 'primary.main'
                : 'inherit'
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 600 : 400
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? sidebarOpen : true}
      onClose={() => setSidebarOpen(false)}
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      {sidebar}
    </Drawer>
  );
}

export default Sidebar;