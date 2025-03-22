import { db } from '../services/firebase';
import { doc, updateDoc, deleteField } from 'firebase/firestore';

export const CURRENT_TIMESTAMP = "2025-03-22 06:23:09";  // CHANGE HERE
export const CURRENT_USER = "Balerick";  

export const LOAD_STATUS = {
  PENDING: 'Pending',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered'
};

export const ASSIGNMENT_STATUS = {
  ACCEPTED: 'accepted',
  PENDING: 'pending_acceptance',
  REJECTED: 'rejected'
};

export const LOAD_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high'
};

export const INITIAL_LOAD_STATE = {
  load_id: '',
  city: '',
  destination: '',
  totalMiles: '',
  rate: '',
  rpm: '',
  assigned_to: [],
  dispatcher: '',
  date: "2025-03-22",
  status: LOAD_STATUS.PENDING,
  assignment_date: '',
  assignment_notes: '',
  assignment_priority: LOAD_PRIORITIES.NORMAL,
  estimated_completion: '',
  pickup_time: '',
  delivery_time: '',
  assignment_history: [],
  current_location: '',
  load_type: 'standard',
  weight: '',
  dimensions: {
    length: '',
    width: '',
    height: ''
  },
  assignment_status: ASSIGNMENT_STATUS.PENDING
};

export const formatLoadData = (loadData) => ({
  ...loadData,
  load_id: String(loadData.load_id || ''),
  totalMiles: String(loadData.totalMiles || ''),
  rpm: String(loadData.rpm || ''),
  rate: String(loadData.rate || ''),
  assigned_to: Array.isArray(loadData.assigned_to) ? loadData.assigned_to : [],
  dispatcher: String(loadData.dispatcher || ''),
  status: String(loadData.status || LOAD_STATUS.PENDING),
  date: String(loadData.date || "2025-03-22")
});

export const validateLoadData = (loadData) => {
  const requiredFields = ['load_id', 'city', 'destination'];
  const missingFields = requiredFields.filter(field => !loadData[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  return true;
};

export const updateRelatedCollections = async (loadId, loadData, previousData = null) => {
  if (!loadId || !loadData) {
    console.error("Missing required data for updateRelatedCollections");
    return Promise.reject(new Error("Missing required data"));
  }

  const updatePromises = [];

  // Handle dispatcher updates
  if (previousData?.dispatcher !== loadData.dispatcher) {
    if (previousData?.dispatcher) {
      updatePromises.push(
        updateDoc(doc(db, "Dispatchers", previousData.dispatcher), {
          [`loads.${loadId}`]: deleteField()
        }).catch(error => {
          console.warn(`Failed to update previous dispatcher (${previousData.dispatcher}):`, error);
        })
      );
    }

    if (loadData.dispatcher) {
      updatePromises.push(
        updateDoc(doc(db, "Dispatchers", loadData.dispatcher), {
          [`loads.${loadId}`]: {
            load_id: loadData.load_id,
            status: loadData.status,
            modified_at: "2025-03-22 06:23:09",  // CHANGE HERE
            modified_by: "Balerick"     
          }
        }).catch(error => {
          console.warn(`Failed to update new dispatcher (${loadData.dispatcher}):`, error);
        })
      );
    }
  }

  // Handle driver updates
  const prevDrivers = new Set(previousData?.assigned_to || []);
  const newDrivers = new Set(loadData.assigned_to || []);

  // Remove load from previous drivers who are no longer assigned
  for (const driver of prevDrivers) {
    if (!newDrivers.has(driver)) {
      updatePromises.push(
        updateDoc(doc(db, "Drivers", driver), {
          [`loads.${loadId}`]: deleteField()
        }).catch(error => {
          console.warn(`Failed to update previous driver (${driver}):`, error);
        })
      );
    }
  }

  // Add load to new drivers
  for (const driver of newDrivers) {
    if (!prevDrivers.has(driver)) {
      updatePromises.push(
        updateDoc(doc(db, "Drivers", driver), {
          [`loads.${loadId}`]: {
            load_id: loadData.load_id,
            status: loadData.status,
            modified_at: "2025-03-22 06:23:09",  // CHANGE HERE
            modified_by: "Balerick"     
          }
        }).catch(error => {
          console.warn(`Failed to update new driver (${driver}):`, error);
        })
      );
    }
  }

  // Wait for all updates to complete
  try {
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error in updateRelatedCollections:", error);
    throw error;
  }
};

export const removeFromRelatedCollections = async (loadId, loadData) => {
  if (!loadId || !loadData) {
    console.error("Missing required data for removeFromRelatedCollections");
    return Promise.reject(new Error("Missing required data"));
  }

  const deletePromises = [];

  // Remove from dispatcher
  if (loadData.dispatcher) {
    deletePromises.push(
      updateDoc(doc(db, "Dispatchers", loadData.dispatcher), {
        [`loads.${loadId}`]: deleteField()
      }).catch(error => {
        console.warn(`Failed to remove load from dispatcher (${loadData.dispatcher}):`, error);
      })
    );
  }

  // Remove from all assigned drivers
  if (loadData.assigned_to?.length > 0) {
    for (const driver of loadData.assigned_to) {
      deletePromises.push(
        updateDoc(doc(db, "Drivers", driver), {
          [`loads.${loadId}`]: deleteField()
        }).catch(error => {
          console.warn(`Failed to remove load from driver (${driver}):`, error);
        })
      );
    }
  }

  // Wait for all deletions to complete
  try {
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error in removeFromRelatedCollections:", error);
    throw error;
  }
};

export const getTimelineDotColor = (status) => {
  switch (status) {
    case ASSIGNMENT_STATUS.ACCEPTED:
      return 'success';
    case ASSIGNMENT_STATUS.REJECTED:
      return 'error';
    default:
      return 'primary';
  }
};
