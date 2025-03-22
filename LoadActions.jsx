// Current Date and Time (UTC): 2025-03-21 23:54:52
// Current User's Login: Balerick

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

  const LOAD_FILTERS = [
  { value: 'All Loads', label: 'All Loads', default: true },
  { value: 'Pending', label: 'Pending' },
  { value: 'In Transit', label: 'In Transit' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Unassigned', label: 'Unassigned' }
];

function LoadActions({
  searchTerm,
  selectedFilter,
  onSearchChange,
  onFilterChange,
  onAddClick,
  menuAnchorEl,
  onMenuClose,
  onEditClick,
  onDeleteClick,
  onViewHistoryClick,
  selectedLoad,
}) {
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (filter) => {
    setFilterAnchorEl(null);
    if (filter) {
      onFilterChange(filter);
    }
  };

  return (
<Box sx={{ display: 'flex', alignItems: 'center' }}>
      {/* Search Field */}
      <TextField
        size="small"
        label="Search Loads"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        error={searchTerm.length > 50}
        helperText={searchTerm.length > 50 ? 'Search term too long' : ''}
        sx={{ mr: 2 }}
      />

      {/* Filter Button & Menu */}
      <Button
        variant="outlined"
        startIcon={<FilterListIcon />}
        onClick={handleFilterClick}
        sx={{ mr: 1 }}
      >
        Filter
      </Button>
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => handleFilterClose(null)}
      >
        {LOAD_FILTERS.map(filter => (
          <MenuItem 
            key={filter.value} 
            onClick={() => handleFilterClose(filter.value)}
            selected={selectedFilter === filter.value}
          > 
            {filter.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Add Load Button */}
      <Button variant="contained" startIcon={<AddIcon />} onClick={onAddClick}>
        Add Load
      </Button>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={onMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          disabled={!selectedLoad}
          onClick={() => {
            onEditClick(selectedLoad);
            onMenuClose();
          }}
        >
          <Tooltip title="Edit Load">
            <EditIcon sx={{ mr: 1 }} />
          </Tooltip>
          Edit
        </MenuItem>
        <MenuItem 
          disabled={!selectedLoad}
          onClick={() => {
            onViewHistoryClick();
            onMenuClose();
          }}
        >
          <Tooltip title="View Assignment History">
            <HistoryIcon sx={{ mr: 1 }} />
          </Tooltip>
          View Assignment History
        </MenuItem>
        <MenuItem 
          disabled={!selectedLoad}
          onClick={() => {
            onDeleteClick();
            onMenuClose();
          }}
        >
          <Tooltip title="Delete Load">
            <DeleteIcon sx={{ mr: 1 }} />
          </Tooltip>
          Delete Load
        </MenuItem>
      </Menu>
    </Box>
  );
}
 LoadActions.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  selectedFilter: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onAddClick: PropTypes.func.isRequired,
  menuAnchorEl: PropTypes.object,
  onMenuClose: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onViewHistoryClick: PropTypes.func.isRequired,
  selectedLoad: PropTypes.object,
};
export default LoadActions;