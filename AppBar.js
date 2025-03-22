
import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Typography,
  IconButton,
  Toolbar,
  Badge,
  Menu,
  MenuItem,
  InputBase,
  alpha,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

function AppBarComponent({ darkMode, toggleDarkMode, handleSidebarToggle, notifications, setNotifications }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  // Get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path === '/drivers') return 'Drivers';
    if (path === '/dispatchers') return 'Dispatchers';
    if (path === '/loads') return 'Loads';
    return 'Transport Management System';
  };

  // Get unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleSidebarToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {getPageTitle()}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Search Bar */}
        <Box sx={{
          position: 'relative',
          backgroundColor: alpha(theme.palette.common.white, 0.15),
          '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.25) },
          borderRadius: 1,
          mr: 2,
          display: { xs: 'none', md: 'block' }
        }}>
          <Box sx={{ position: 'absolute', height: '100%', display: 'flex', alignItems: 'center', pl: 2 }}>
            <SearchIcon />
          </Box>
          <InputBase
            placeholder="Search…"
            sx={{
              color: 'inherit',
              pl: 6,
              pr: 1,
              py: 1,
              width: '25ch',
            }}
          />
        </Box>

        {/* Icons */}
        <Box sx={{ display: 'flex' }}>
          <IconButton
            color="inherit"
            onClick={handleNotificationOpen}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            sx={{ mt: 2 }}
          >
            <Typography variant="subtitle1" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
              Notifications
            </Typography>
            <Divider />
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <MenuItem
                  key={notification.id}
                  onClick={handleNotificationClose}
                  sx={{
                    backgroundColor: notification.read ? 'inherit' : alpha(theme.palette.primary.main, 0.05),
                    minWidth: 280
                  }}
                >
                  <Typography variant="body2">{notification.message}</Typography>
                </MenuItem>
              ))
            ) : (
              <MenuItem>No notifications</MenuItem>
            )}
          </Menu>

          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <IconButton
            edge="end"
            color="inherit"
            onClick={handleProfileMenuOpen}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{ mt: 2 }}
          >
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
            <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default AppBarComponent;