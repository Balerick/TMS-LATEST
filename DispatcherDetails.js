// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-03-20 15:09:12
// Current User's Login: Balerick

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Avatar,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  LocalShipping,
  Assessment,
  History,
  Group,
} from '@mui/icons-material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function DispatcherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dispatcher, setDispatcher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [activeLoads, setActiveLoads] = useState([]);
  const [loadHistory, setLoadHistory] = useState([]);

  useEffect(() => {
    fetchDispatcherDetails();
  }, [id]);

  const fetchDispatcherDetails = async () => {
    try {
      const dispatcherDoc = await getDoc(doc(db, "Dispatchers", id));
      if (dispatcherDoc.exists()) {
        const dispatcherData = dispatcherDoc.data();
        setDispatcher({ id: dispatcherDoc.id, ...dispatcherData });

        // Fetch active loads
        const loadsQuery = query(
          collection(db, "Loads"),
          where("dispatcher", "==", dispatcherDoc.id),
          where("status", "in", ["Pending", "In Transit"])
        );
        const loadsSnapshot = await getDocs(loadsQuery);
        setActiveLoads(loadsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        // Fetch load history
        const historyQuery = query(
          collection(db, "Loads"),
          where("dispatcher", "==", dispatcherDoc.id),
          where("status", "==", "Delivered")
        );
        const historySnapshot = await getDocs(historyQuery);
        setLoadHistory(historySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dispatcher details:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!dispatcher) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Dispatcher not found</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4, mt: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dispatchers')}
          sx={{ mb: 2 }}
        >
          Back to Dispatchers
        </Button>
        
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{ width: 80, height: 80, fontSize: '2rem' }}
              >
                {dispatcher.avatar}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4">{dispatcher.name}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {dispatcher.email} • {dispatcher.phone}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={dispatcher.onDuty ? "On Duty" : "Off Duty"}
                  color={dispatcher.onDuty ? "success" : "default"}
                  sx={{ mr: 1 }}
                />
                {dispatcher.teams?.map((team) => (
                  <Chip
                    key={team.id}
                    label={team.name}
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>Quick Stats</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Active Loads</Typography>
                    <Typography variant="h6">{activeLoads.length}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Completed</Typography>
                    <Typography variant="h6">{loadHistory.length}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab icon={<LocalShipping />} label="Active Loads" />
          <Tab icon={<Assessment />} label="Performance" />
          <Tab icon={<History />} label="Load History" />
          <Tab icon={<Group />} label="Team" />
        </Tabs>
      </Box>

      {/* Active Loads Tab */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Load ID</TableCell>
                <TableCell>Route</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeLoads.map((load) => (
                <TableRow key={load.id}>
                  <TableCell>{load.load_id}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{load.city}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        to {load.destination}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {load.assigned_to ? (
                      <Chip
                        size="small"
                        label={load.assigned_to}
                        color="primary"
                      />
                    ) : (
                      <Chip
                        size="small"
                        label="Unassigned"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={load.status}
                      color={
                        load.status === "In Transit" ? "warning" :
                        load.status === "Pending" ? "info" : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>{load.rate}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/loads/${load.id}`)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Performance Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Monthly Performance</Typography>
              {/* Add performance charts here */}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Key Metrics</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    On-Time Delivery Rate
                  </Typography>
                  <Typography variant="h6">
                    {Math.round((loadHistory.filter(l => l.onTime).length / loadHistory.length) * 100)}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Average Load Value
                  </Typography>
                  <Typography variant="h6">
                    ${Math.round(loadHistory.reduce((acc, l) => acc + parseFloat(l.rate.replace('$', '')), 0) / loadHistory.length)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Load History Tab */}
      <TabPanel value={tabValue} index={2}>
        <Timeline>
          {loadHistory.map((load) => (
            <TimelineItem key={load.id}>
              <TimelineSeparator>
                <TimelineDot color="success" />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2">
                    Load {load.load_id} completed
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {load.city} to {load.destination}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(load.completion_date).toLocaleDateString()}
                  </Typography>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </TabPanel>

      {/* Team Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          {dispatcher.teams?.map((team) => (
            <Grid item xs={12} md={6} key={team.id}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">{team.name}</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {team.description}
                </Typography>
                {/* Add team members and other team details */}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
    </Container>
  );
}

export default DispatcherDetails;