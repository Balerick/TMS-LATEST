// Current Date and Time (UTC): 2025-03-22 00:19:54
// Current User's Login: Balerick

import React from 'react';
import PropTypes from 'prop-types';

// Material UI Core Components
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';

// Material UI Lab Components
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

// Firebase imports
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  updateDoc,
  arrayUnion,
  deleteField 
} from 'firebase/firestore';

import { db } from '../services/firebase';
import LoadForms from './LoadForms';
import {
  CURRENT_TIMESTAMP,
  CURRENT_USER,
  validateLoadData,
  formatLoadData,
  updateRelatedCollections,
  removeFromRelatedCollections,
  getTimelineDotColor
} from './LoadUtils';
// Add this function right after imports and before the component
const updateAssignmentStatus = async (loadId, newStatus, setLoading, setError, refreshData) => {
  if (!db || !loadId) {
    console.error("Missing required data");
    return;
  }

  try {
    setLoading(true);
    const loadRef = doc(db, "Loads", loadId);
    
    await updateDoc(loadRef, {
      assignment_status: newStatus,
      assignment_history: arrayUnion({
        status: newStatus,
        timestamp: CURRENT_TIMESTAMP,
        updatedBy: CURRENT_USER
      })
    });

    if (refreshData) await refreshData();
  } catch (error) {
    console.error("Error updating assignment status:", error);
    setError(error);
  } finally {
    setLoading(false);
  }
};

function LoadOperations({
  addLoadOpen,
  editLoadOpen,
  showAssignmentHistory,
  selectedLoad,
  newLoad,
  setNewLoad,     
  loading,
  setLoading,        // Add this
  setError,          // Add this
  drivers,
  dispatchers,
  onClose,
  updateLoad,
  refreshData,
  handleInputChange,
  handleDriverChange,
}) {
 const handleAddLoad = async () => {
  if (!db) return;

  try {
    // Format and validate load data
    const loadData = {
      ...newLoad,
      created_at: CURRENT_TIMESTAMP,
      created_by: CURRENT_USER,
      last_modified_at: CURRENT_TIMESTAMP,
      last_modified_by: CURRENT_USER,
      assigned_to: Array.isArray(newLoad.assigned_to) ? newLoad.assigned_to : [],
      dispatcher: newLoad.dispatcher || '',
      status: newLoad.status || 'Pending',
      assignment_status: 'pending_acceptance',
      assignment_history: [] // Initialize empty assignment history
    };

    // Add console log for debugging
    console.log("Adding new load with data:", loadData);

    // Add to Loads collection
    const docRef = await addDoc(collection(db, "Loads"), loadData);
    
    // Try to update related collections
    try {
      await updateRelatedCollections(docRef.id, loadData);
    } catch (relatedError) {
      console.warn("Warning: Error updating related collections:", relatedError);
      // Continue execution even if related updates fail
    }

    // Update UI and close dialog
    updateLoad({ ...loadData, id: docRef.id });
    onClose();
    if (refreshData) await refreshData();
  } catch (error) {
    console.error("Error adding load:", error);
    // Show error to user
    alert(`Failed to add load: ${error.message}`);
    throw error;
  }
};

const handleUpdateLoad = async () => {
  if (!newLoad?.id || !db) return;  // DIFFERENCE 1: Uses newLoad.id

  try {
      setLoading(true);

      // Get original load first
      const loadRef = doc(db, "Loads", newLoad.id);  // DIFFERENCE 2: Uses newLoad.id
      const loadSnapshot = await getDoc(loadRef);
      const originalLoad = loadSnapshot.data();

      // Prepare update data
      const updatedLoadData = {
          load_id: String(newLoad.load_id || ''),
          city: String(newLoad.city || ''),
          destination: String(newLoad.destination || ''),
          totalMiles: String(newLoad.totalMiles || ''),
          rate: String(newLoad.rate || ''),
          rpm: String(newLoad.rpm || ''),
          assigned_to: Array.isArray(newLoad.assigned_to) ? newLoad.assigned_to : [],
          dispatcher: String(newLoad.dispatcher || ''),
          date: String(newLoad.date || new Date().toISOString().slice(0, 10)),
          status: String(newLoad.status || 'Pending'),
          last_modified_at: "2025-03-21 21:48:08",
          last_modified_by: "Balerick"
      };

      // 1. Update main load document
      await updateDoc(loadRef, updatedLoadData);

      // 2. Handle dispatcher changes
      if (originalLoad?.dispatcher !== updatedLoadData.dispatcher) {
          // Remove from old dispatcher
          if (originalLoad?.dispatcher) {
              const oldDispatcherRef = doc(db, "Dispatchers", originalLoad.dispatcher);
              await updateDoc(oldDispatcherRef, {
                  [`loads.${newLoad.id}`]: deleteField()  // DIFFERENCE 3: Uses newLoad.id
              });
          }

          // Add to new dispatcher
          if (updatedLoadData.dispatcher) {
              const newDispatcherRef = doc(db, "Dispatchers", updatedLoadData.dispatcher);
              await updateDoc(newDispatcherRef, {
                  [`loads.${newLoad.id}`]: {  // DIFFERENCE 4: Uses newLoad.id
                      load_id: updatedLoadData.load_id,
                      status: updatedLoadData.status,
                      modified_at: "2025-03-21 21:48:08",
                      modified_by: "Balerick"
                  }
              });
          }
      }

      // 3. Handle driver changes
      const oldDrivers = new Set(originalLoad?.assigned_to || []);
      const newDrivers = new Set(updatedLoadData.assigned_to);

      // Remove from unassigned drivers
      for (const driver of oldDrivers) {
          if (!newDrivers.has(driver)) {
              const driverRef = doc(db, "Drivers", driver);
              await updateDoc(driverRef, {
                  [`loads.${newLoad.id}`]: deleteField()  // DIFFERENCE 5: Uses newLoad.id
              });
          }
      }

      // Add to new drivers
      for (const driver of newDrivers) {
          if (!oldDrivers.has(driver)) {
              const driverRef = doc(db, "Drivers", driver);
              await updateDoc(driverRef, {
                  [`loads.${newLoad.id}`]: {  // DIFFERENCE 6: Uses newLoad.id
                      load_id: updatedLoadData.load_id,
                      status: updatedLoadData.status,
                      modified_at: "2025-03-21 21:48:08",
                      modified_by: "Balerick"
                  }
              });
          }
      }

      updateLoad({ ...updatedLoadData, id: newLoad.id });  // DIFFERENCE 7: Uses newLoad.id
      onClose();
      if (refreshData) await refreshData();
  } catch (error) {
      console.error("Error updating load:", error);
      setError("Failed to update load: " + error.message);
  } finally {
      setLoading(false);
  }
};

  const handleDeleteLoad = async () => {
    if (!selectedLoad?.id || !db) return;

    try {
      const loadRef = doc(db, "Loads", selectedLoad.id);
      const loadSnapshot = await getDoc(loadRef);
      const loadData = loadSnapshot.data();

      await deleteDoc(loadRef);
      await removeFromRelatedCollections(selectedLoad.id, loadData);

      if (refreshData) await refreshData();
      onClose();
    } catch (error) {
      console.error("Error deleting load:", error);
      throw error;
    }
  };

  return (
    <>
      <Dialog open={addLoadOpen} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Load</DialogTitle>
        <DialogContent>
          <LoadForms
            load={newLoad}
            drivers={drivers}
            dispatchers={dispatchers}
            onInputChange={handleInputChange}
            onDriverChange={handleDriverChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleAddLoad} variant="contained">
            Add Load
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editLoadOpen} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Load</DialogTitle>
        <DialogContent>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          )}
          <LoadForms
            load={newLoad}
            drivers={drivers}
            dispatchers={dispatchers}
            onInputChange={handleInputChange}
            onDriverChange={handleDriverChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpdateLoad} variant="contained">
            Update Load
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showAssignmentHistory} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Assignment History</DialogTitle>
        <DialogContent>
          <Timeline>
            {selectedLoad?.assignment_history?.map((history, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot
                    color={
                      history.status === "accepted" ? "success" :
                      history.status === "rejected" ? "error" :
                      "primary"
                    }
                  />
                  {index < (selectedLoad?.assignment_history?.length || 0) - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="body2">
                    Status changed to: {history.status}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    By: {history.updatedBy} at {history.timestamp}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </DialogContent>
      </Dialog>
    </>
  );
}
// ... your LoadOperations component code ...

LoadOperations.propTypes = {
  addLoadOpen: PropTypes.bool.isRequired,
  editLoadOpen: PropTypes.bool.isRequired,
  showAssignmentHistory: PropTypes.bool.isRequired,
  selectedLoad: PropTypes.object,
  newLoad: PropTypes.object.isRequired,
  setNewLoad: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired, 
  setLoading: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  drivers: PropTypes.array.isRequired,
  dispatchers: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  updateLoad: PropTypes.func.isRequired,
  refreshData: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,  // Added
  handleDriverChange: PropTypes.func.isRequired  // Added
};

export default LoadOperations;
