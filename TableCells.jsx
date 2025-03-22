// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-03-22 02:28:06
// Current User's Login: Balerick

import React from 'react';
import PropTypes from 'prop-types';
import {
  TableCell,
  Typography,
  Chip,
  Stack,
  IconButton,
  Avatar,
  AvatarGroup,
  Box,
  Tooltip
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Place as PlaceIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

const LoadIdCell = ({ load }) => (
  <TableCell>
    <Stack spacing={1}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
        {load.load_id}
      </Typography>
      <Typography variant="caption" color="textSecondary">
        {new Date(load.date).toLocaleDateString()}
      </Typography>
    </Stack>
  </TableCell>
);

const RouteCell = ({ load }) => (
  <TableCell>
    <Stack direction="row" spacing={1} alignItems="center">
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PlaceIcon fontSize="small" color="primary" />
          <Typography variant="body2">{load.city}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <ArrowForwardIcon fontSize="small" color="action" />
          <Typography variant="body2">{load.destination}</Typography>
        </Stack>
      </Stack>
    </Stack>
  </TableCell>
);

const DriversCell = ({ load, drivers }) => {
  const assignedDrivers = drivers.filter(driver => 
    load.assigned_to?.includes(driver.id)
  );

  return (
    <TableCell>
      {assignedDrivers.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {assignedDrivers.map(driver => (
            <Box key={driver.id} sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                alt={driver.name}
                src={driver.avatar}
                sx={{ width: 24, height: 24, mr: 1 }}
              >
                {driver.name.charAt(0)}
              </Avatar>
              <Typography variant="body2">
                {driver.name}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="textSecondary">
          Unassigned
        </Typography>
      )}
    </TableCell>
  );
};

const DispatcherCell = ({ load, dispatchers }) => {
  const dispatcher = dispatchers.find(d => d.id === load.dispatcher);
  
  return (
    <TableCell>
      {dispatcher ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            alt={dispatcher.name}
            src={dispatcher.avatar}
            sx={{ width: 24, height: 24 }}
          >
            {dispatcher.name.charAt(0)}
          </Avatar>
          <Typography variant="body2">{dispatcher.name}</Typography>
        </Stack>
      ) : (
        <Typography variant="body2" color="textSecondary">
          Unassigned
        </Typography>
      )}
    </TableCell>
  );
};

const StatusCell = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in transit':
        return 'info';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <TableCell>
      <Chip
        label={status || 'Unknown'}
        size="small"
        color={getStatusColor(status)}
        sx={{ minWidth: 90 }}
      />
    </TableCell>
  );
};

const AssignmentCell = ({ status }) => {
  const getAssignmentColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending_acceptance':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <TableCell>
      <Chip
        label={status?.replace('_', ' ').toLowerCase() || 'unassigned'}
        size="small"
        color={getAssignmentColor(status)}
        sx={{ minWidth: 90 }}
      />
    </TableCell>
  );
};

const RateCell = ({ rate }) => (
  <TableCell>
    <Typography variant="body2">
      ${Number(rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
    </Typography>
  </TableCell>
);

const ActionsCell = ({ load, onMenuOpen }) => (
  <TableCell align="right">
    <IconButton
      size="small"
      onClick={(event) => onMenuOpen(event, load)}
      sx={{ ml: 1 }}
    >
      <MoreVertIcon />
    </IconButton>
  </TableCell>
);

// PropTypes
LoadIdCell.propTypes = {
  load: PropTypes.shape({
    load_id: PropTypes.string,
    date: PropTypes.string
  }).isRequired
};

RouteCell.propTypes = {
  load: PropTypes.shape({
    city: PropTypes.string,
    destination: PropTypes.string
  }).isRequired
};

DriversCell.propTypes = {
  load: PropTypes.shape({
    assigned_to: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  drivers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      avatar: PropTypes.string
    })
  ).isRequired
};

DispatcherCell.propTypes = {
  load: PropTypes.shape({
    dispatcher: PropTypes.string
  }).isRequired,
  dispatchers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      avatar: PropTypes.string
    })
  ).isRequired
};

StatusCell.propTypes = {
  status: PropTypes.string
};

AssignmentCell.propTypes = {
  status: PropTypes.string
};

RateCell.propTypes = {
  rate: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

ActionsCell.propTypes = {
  load: PropTypes.object.isRequired,
  onMenuOpen: PropTypes.func.isRequired
};

// Export all cells as a collection
export const TableCells = {
  LoadIdCell,
  RouteCell,
  DriversCell,
  DispatcherCell,
  StatusCell,
  AssignmentCell,
  RateCell,
  ActionsCell
};