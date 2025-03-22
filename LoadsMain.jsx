

import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,  // Add this
  Alert 
} from '@mui/material';
import { deleteDoc, doc } from 'firebase/firestore';  // Add this line
import { db } from '../services/firebase';  // Add this line
import LoadActions from './LoadActions';
import LoadOperations from './LoadOperations';
import { TableCells } from './TableCells';
import { INITIAL_LOAD_STATE } from './LoadUtils';

function LoadsMain({ loads, drivers, dispatchers, updateLoad, refreshData }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Loads');
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [addLoadOpen, setAddLoadOpen] = useState(false);
  const [editLoadOpen, setEditLoadOpen] = useState(false);
  const [showAssignmentHistory, setShowAssignmentHistory] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [newLoad, setNewLoad] = useState(INITIAL_LOAD_STATE);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
   const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewLoad(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDriverChange = (event) => {
    setNewLoad(prev => ({
      ...prev,
      assigned_to: event.target.value
    }));
  };
  useEffect(() => {
    console.log("Selected load updated:", selectedLoad);
    if (selectedLoad) {
      setNewLoad(prev => ({
        ...prev,
        ...selectedLoad,
        assigned_to: Array.isArray(selectedLoad.assigned_to) 
          ? selectedLoad.assigned_to 
          : [],
        load_id: String(selectedLoad.load_id || ''),
        totalMiles: String(selectedLoad.totalMiles || ''),
        rpm: String(selectedLoad.rpm || ''),
        rate: String(selectedLoad.rate || '')
      }));
    }
}, [selectedLoad]);

  const isMenuOpen = Boolean(menuAnchorEl);

  const handleMenuOpen = (event, load) => {
    event.stopPropagation();
    setSelectedLoad(load);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedLoad(null);
  };

  const handleAddLoadOpen = () => setAddLoadOpen(true);
  const handleAddLoadClose = () => {
    setAddLoadOpen(false);
    setNewLoad(INITIAL_LOAD_STATE);
  };

  const handleEditLoadOpen = (load) => {
    setSelectedLoad(load);
    setNewLoad({
      ...load,
      load_id: String(load.load_id || ''),
      totalMiles: String(load.totalMiles || ''),
      rpm: String(load.rpm || ''),
      rate: String(load.rate || ''),
      assigned_to: Array.isArray(load.assigned_to) ? load.assigned_to : [],
    });
    setEditLoadOpen(true);
  };
 
  const handleEditLoadClose = () => {
  setEditLoadOpen(false);
  setTimeout(() => {
    setSelectedLoad(null);
    setNewLoad(INITIAL_LOAD_STATE);
  }, 100);
};

// Add this function here
const handleDeleteLoad = async () => {
  if (!selectedLoad?.id) return;
  setLoading(true);
  try {
    await deleteDoc(doc(db, "Loads", selectedLoad.id));
    if (refreshData) await refreshData();
    handleMenuClose();
    handleNotification('Load deleted successfully', 'success'); // Add this line
  } catch (error) {
    console.error("Error deleting load:", error);
    setError(error.message);
    handleNotification('Failed to delete load', 'error'); // Add this line
  } finally {
    setLoading(false);
  }
};
 
  const handleNotification = (message, severity = 'info') => {
  setNotification({
    open: true,
    message,
    severity
  });
};
  const filteredLoads = useMemo(() => {
    return loads.filter(load => {
      const searchTermLower = searchTerm.toLowerCase();
      const searchMatch =
        load.load_id?.toLowerCase().includes(searchTermLower) ||
        load.city?.toLowerCase().includes(searchTermLower) ||
        load.destination?.toLowerCase().includes(searchTermLower);

      const filterMatch =
        selectedFilter === 'All Loads' ||
        load.status === selectedFilter ||
        (selectedFilter === 'Unassigned' && (!load.assigned_to || load.assigned_to.length === 0));

      return searchMatch && filterMatch;
    });
  }, [loads, searchTerm, selectedFilter]);

  useEffect(() => {
    if (error) {
      console.error("Operation failed:", error);
    }
  }, [error]);

  console.log("First load object:", JSON.stringify(loads[0], null, 2));
console.log("Rendering Loads component with loads:", loads, "drivers:", drivers, "dispatchers:", dispatchers);

return (
  <Container maxWidth="xl">
    {/* Header Section */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4">Loads</Typography>
      <LoadActions
        searchTerm={searchTerm}
        selectedFilter={selectedFilter}
        onSearchChange={setSearchTerm}
        onFilterChange={setSelectedFilter}
        onAddClick={handleAddLoadOpen}
        menuAnchorEl={menuAnchorEl}
        onMenuClose={handleMenuClose}
        onEditClick={handleEditLoadOpen}
        onDeleteClick={() => selectedLoad && handleDeleteLoad()}
        onViewHistoryClick={() => setShowAssignmentHistory(true)}
        selectedLoad={selectedLoad}
      />
    </Box>

    {/* Error Display */}
    {error && (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    )}

    {/* Loading State or Table */}
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    ) : (
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
        {loading && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)' 
          }}>
            <CircularProgress />
          </Box>
        )}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Load ID & Date</TableCell>
                <TableCell>Route</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Dispatcher</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assignment</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLoads.map((load) => (
                <TableRow key={load.id}>
                  <TableCells.LoadIdCell load={load} />
                  <TableCells.RouteCell load={load} />
                  <TableCells.DriversCell load={load} drivers={drivers} />
                  <TableCells.DispatcherCell load={load} dispatchers={dispatchers} />
                  <TableCells.StatusCell status={load.status} />
                  <TableCells.AssignmentCell status={load.assignment_status} />
                  <TableCells.RateCell rate={load.rate} />
                  <TableCells.ActionsCell load={load} onMenuOpen={handleMenuOpen} />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    )}
    {/* Load Operations Modal */}
    <LoadOperations
      addLoadOpen={addLoadOpen}
      editLoadOpen={editLoadOpen}
      showAssignmentHistory={showAssignmentHistory}
      selectedLoad={selectedLoad}
      newLoad={newLoad}
      setNewLoad={setNewLoad}
      loading={loading}
      setLoading={setLoading}
      setError={setError}
      drivers={drivers}
      dispatchers={dispatchers}
      onClose={() => {
        handleAddLoadClose();
        handleEditLoadClose();
        setShowAssignmentHistory(false);
      }}
      updateLoad={updateLoad}
      refreshData={refreshData}
      handleInputChange={handleInputChange}  // Add this handler
      handleDriverChange={handleDriverChange}  // Add this handler 
    />

    {/* Notification Snackbar */}
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={() => setNotification(prev => ({ ...prev, open: false }))}
    >
      <Alert 
        onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
        severity={notification.severity}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  </Container>
);
}

export default LoadsMain;

LoadsMain.propTypes = {
  loads: PropTypes.array.isRequired,
  drivers: PropTypes.array.isRequired,
  dispatchers: PropTypes.array.isRequired,
  updateLoad: PropTypes.func.isRequired,
  refreshData: PropTypes.func.isRequired
};