// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-03-20 06:01:07
// Current User's Login: rAZAt922

import React from 'react';
import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  CssBaseline,
  useMediaQuery,
  TextField,
  Button,
  CircularProgress,
  Toolbar,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';

// Add these new imports
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from './services/firebase';

// Import components
import AppBarComponent from './components/AppBar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Drivers from './components/Drivers';
import Dispatchers from './components/Dispatchers';
import LoadsMain from './components/LoadsMain';
import createAppTheme from './components/theme';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentTheme = useMemo(() => createAppTheme(darkMode ? 'dark' : 'light'), [darkMode]);
  const isMobile = useMediaQuery(currentTheme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New load assigned", read: false },
    { id: 2, message: "Driver John updated status", read: false },
    { id: 3, message: "Load 12345 delivered", read: true }
  ]);

  // Data from firebase
  const [drivers, setDrivers] = useState([]);
  const [dispatchers, setDispatchers] = useState([]);
  const [loads, setLoads] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchDrivers(), fetchDispatchers(), fetchLoads()]);
        setDataLoaded(true);
        setError(null);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data. Please try again.");
        setDataLoaded(true);
      }
    };
    
    fetchData();
  }, []);

  const fetchDrivers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Drivers'));
      const driverList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDrivers(driverList);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      throw error;
    }
  };

  const fetchDispatchers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Dispatchers'));
      const dispatcherList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDispatchers(dispatcherList);
    } catch (error) {
      console.error("Error fetching dispatchers:", error);
      throw error;
    }
  };

  const fetchLoads = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Loads'));
      const loadList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLoads(loadList);
    } catch (error) {
      console.error("Error fetching loads:", error);
      throw error;
    }
  };

const handleUpdateLoad = async (updatedLoad) => {
  try {
    // Format the load data before saving
    const formattedLoad = {
      ...updatedLoad,
      assigned_to: Array.isArray(updatedLoad.assigned_to) ? updatedLoad.assigned_to : [],
      dispatcher: updatedLoad.dispatcher || '',
      status: updatedLoad.status || 'Pending',
      last_modified_at: new Date().toISOString(),
      last_modified_by: "Balerick" // or your current user
    };
    
    if (updatedLoad.deleted) {
      await deleteDoc(doc(db, "Loads", updatedLoad.id));
      setLoads(currentLoads => 
        currentLoads.filter(load => load.id !== updatedLoad.id)
      );
    } else if (updatedLoad.id) {
      const { id, ...loadWithoutId } = formattedLoad;
      await setDoc(doc(db, "Loads", id), loadWithoutId);
      setLoads(currentLoads =>
        currentLoads.map(load =>
          load.id === updatedLoad.id ? formattedLoad : load
        )
      );
    } else {
      // Add created_at and created_by for new loads
      const newLoad = {
        ...formattedLoad,
        created_at: new Date().toISOString(),
        created_by: "Balerick", // or your current user
        assignment_status: 'pending_acceptance',
        assignment_history: []
      };
      const docRef = await addDoc(collection(db, "Loads"), newLoad);
      const newLoadWithId = { ...newLoad, id: docRef.id };
      setLoads(currentLoads => [...currentLoads, newLoadWithId]);
    }

    // Refresh the loads data
    await fetchLoads();
  } catch (error) {
    console.error("Error updating loads:", error);
    throw error; // Let the component handle the error
  }
};

  // Chart data calculations with useMemo
  const driverChartData = useMemo(() => 
    drivers.map(driver => ({
      name: driver.name,
      loads: driver.loads ? driver.loads.length : 0,
      completed: driver.history ? 
        (Array.isArray(driver.history) ? 
          driver.history.filter(h => h.includes("Completed")).length : 0) 
        : 0
    }))
  , [drivers]);

  const statusData = useMemo(() => [
    { name: "In Transit", value: loads.filter(load => load.status === "In Transit").length },
    { name: "Pending", value: loads.filter(load => load.status === "Pending").length },
    { name: "Delivered", value: loads.filter(load => load.status === "Delivered").length },
    { name: "Unassigned", value: loads.filter(load => load.status === "Unassigned").length }
  ], [loads]);

  const weeklyData = [
    { name: "Mon", loads: 4 },
    { name: "Tue", loads: 3 },
    { name: "Wed", loads: 5 },
    { name: "Thu", loads: 6 },
    { name: "Fri", loads: 4 },
    { name: "Sat", loads: 2 },
    { name: "Sun", loads: 1 }
  ];

  const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28'];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AppBarComponent
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          handleSidebarToggle={handleSidebarToggle}
          notifications={notifications}
          setNotifications={setNotifications}
        />

        <Sidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
        />

        <Box component="main" sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: 'background.default',
          overflow: 'auto'
        }}>
          <Toolbar />
          <Routes>
            <Route path="/" element={
              <Dashboard 
                drivers={drivers} 
                dispatchers={dispatchers} 
                loads={loads} 
                chartData={driverChartData} 
                statusData={statusData} 
                weeklyData={weeklyData} 
                colors={COLORS} 
              />
            } />
            <Route path="/dashboard" element={
              <Dashboard 
                drivers={drivers} 
                dispatchers={dispatchers} 
                loads={loads} 
                chartData={driverChartData} 
                statusData={statusData} 
                weeklyData={weeklyData} 
                colors={COLORS} 
              />
            } />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/dispatchers" element={<Dispatchers />} />
           <Route path="/loads" element={
              dataLoaded ? (
               <LoadsMain 
               loads={loads} 
               drivers={drivers} 
               dispatchers={dispatchers} 
               updateLoad={handleUpdateLoad}
               refreshData={fetchLoads}
          />
    ) : (
      <CircularProgress />
  )
} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;