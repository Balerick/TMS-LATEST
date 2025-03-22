// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-03-20 06:28:32
// Current User's Login: rAZAt922

import { Alert, Snackbar } from '@mui/material';
import { onSnapshot, serverTimestamp } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container,
  Avatar,
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  Modal,
  Select,
  InputLabel,
  FormControl,
  ListItemText,
  OutlinedInput,
  Checkbox,
  Card,
  CardContent,
  Grid,
  Collapse,
  Badge,
  Stack,
  Divider,
  AvatarGroup,
  LinearProgress,
} from '@mui/material';
// Add this new import for Timeline components
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineDot,
  TimelineContent,
} from '@mui/lab';

import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  InfoOutlined,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  GroupAdd as GroupAddIcon,
  ExpandMore as ExpandMoreIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';

import { 
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  updateDoc
} from 'firebase/firestore';

import { db } from '../services/firebase'; 
import { visuallyHidden } from '@mui/utils';
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 200,
    },
  },
};

function Dispatchers() {
  const [dispatchers, setDispatchers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newDispatcher, setNewDispatcher] = useState({
    name: '',
    username: '',
    telegram: '',
    email: '',
    phone: '',
    teams: [],
  });
  const [selectedDispatcherId, setSelectedDispatcherId] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDispatcher, setSelectedDispatcher] = useState(null);
  const [detailedDispatcher, setDetailedDispatcher] = useState(null);
  const [teams, setTeams] = useState([]); // Mock teams data
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [openTeamDialog, setOpenTeamDialog] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    leadDispatcher: '',
    members: [],
    telegramGroupId: '',
  });

  const [teamDetailsOpen, setTeamDetailsOpen] = useState(false);
  const [selectedTeamDetails, setSelectedTeamDetails] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const handleFirebaseError = (error, operation) => {
  console.error(`Error during ${operation}:`, error);
  let message = '';
  
  switch (error.code) {
    case 'permission-denied':
      message = "You don't have permission to perform this action";
      break;
    case 'not-found':
      message = "The requested data couldn't be found";
      break;
    case 'already-exists':
      message = "This record already exists";
      break;
    default:
      message = `Error during ${operation}. Please try again.`;
  }
  
  setSnackbar({
    open: true,
    message: message,
    severity: 'error'
  });
};

const fetchDispatchers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'Dispatchers'));
    const dispatcherList = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      // Ensure teams is always an array
      if (!data.teams) data.teams = [];
      if (!Array.isArray(data.teams)) data.teams = [data.teams];
      
      return { 
        id: doc.id, 
        ...data
      };
    });
    console.log('Fetched dispatchers:', dispatcherList); // Debug log
    setDispatchers(dispatcherList);
  } catch (error) {
    console.error("Error fetching dispatchers:", error);
  }
};

 useEffect(() => {
  // Set up real-time listeners
  const dispatchersRef = collection(db, 'Dispatchers');
  const teamsRef = collection(db, 'Teams');

  // Real-time dispatcher updates
  const unsubscribeDispatchers = onSnapshot(dispatchersRef, 
    (snapshot) => {
      const dispatcherList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setDispatchers(dispatcherList);
    },
    (error) => {
      handleFirebaseError(error, 'fetching dispatchers');
    }
  );

  // Real-time team updates
  const unsubscribeTeams = onSnapshot(teamsRef, 
    (snapshot) => {
      const teamsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeams(teamsList);
    },
    (error) => {
      handleFirebaseError(error, 'fetching teams');
    }
  );

  // Cleanup function
  return () => {
    unsubscribeDispatchers();
    unsubscribeTeams();
  };
}, []); // Empty dependency array since we want this to run once on mount

const addDispatcherToFirestore = async () => {
  try {
    // Convert team names to team objects
    const teamObjects = newDispatcher.teams.map(team => ({
      id: typeof team === 'object' ? team.id : teams.find(t => t.name === team)?.id,
      name: typeof team === 'object' ? team.name : team
    }));

    const dispatcherData = {
      ...newDispatcher,
      onDuty: false,
      loads: [],
      avatar: newDispatcher.name.substring(0, 2).toUpperCase(),
      teams: teamObjects,
      createdAt: serverTimestamp(),
      createdBy: 'rAZAt922'
    };
    
    await addDoc(collection(db, "Dispatchers"), dispatcherData);
    
    setSnackbar({
      open: true,
      message: 'Dispatcher added successfully!',
      severity: 'success'
    });

    setNewDispatcher({
      name: '',
      username: '',
      telegram: '',
      email: '',
      phone: '',
      teams: [],
    });
    setShowForm(false);
  } catch (error) {
    handleFirebaseError(error, 'adding dispatcher');
  }
};

  const handleOpenDeleteConfirmation = (dispatcherId) => {
    setSelectedDispatcherId(dispatcherId);
    setDeleteConfirmationOpen(true);
  };

  const handleCloseDeleteConfirmation = () => {
    setDeleteConfirmationOpen(false);
  };

  const handleDeleteDispatcher = async () => {
    if (selectedDispatcherId) {
      try {
        await deleteDoc(doc(db, "Dispatchers", selectedDispatcherId));
        console.log("Document successfully deleted!");
        await fetchDispatchers();
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
      setDeleteConfirmationOpen(false);
      setSelectedDispatcherId(null);
    } else {
      console.log("No dispatcher selected for deletion.");
    }
  };

  const handleMenuOpen = (event, dispatcherId) => {
    setSelectedDispatcherId(dispatcherId);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const fetchDispatcherDetails = async (dispatcherId) => {
    const docRef = doc(db, "Dispatchers", dispatcherId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setDetailedDispatcher(docSnap.data());
    } else {
      console.log("No such document!");
      setDetailedDispatcher(null);
    }
  };

  const handleDispatcherClick = async (dispatcher) => {
    setSelectedDispatcher(dispatcher);
    await fetchDispatcherDetails(dispatcher.id);
    setIsDetailsModalOpen(true);
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false);
    setSelectedDispatcher(null);
    setDetailedDispatcher(null);
  };

  const handleMenuButtonClick = (event, dispatcherId) => {
    event.stopPropagation();
    setSelectedDispatcherId(dispatcherId); // Ensure selectedDispatcherId is set correctly
    handleMenuOpen(event, dispatcherId);
  };

  const handleInputChange = (event) => {
    setNewDispatcher({ ...newDispatcher, [event.target.name]: event.target.value });
  };

  const handleTeamChange = (event) => {
    const { value } = event.target;
    setNewDispatcher({ ...newDispatcher, teams: value });
  };

const handleTeamSelect = (team) => {
  console.log('Team selected:', team);
  setSelectedTeam(prevTeam => prevTeam?.id === team.id ? null : team);
};
const filteredDispatchers = selectedTeam
  ? dispatchers.filter((dispatcher) => {
      // Check if dispatcher is in team's members array
      const isTeamMember = selectedTeam.members?.includes(dispatcher.name);
      
      // Check if team is in dispatcher's teams array
      const hasTeamInArray = dispatcher.teams?.some(team => 
        team.id === selectedTeam.id || team.name === selectedTeam.name
      );
      
      return isTeamMember || hasTeamInArray;
    })
  : dispatchers;

const handleCreateTeam = async () => {
  try {
    // First create the team
    const teamRef = await addDoc(collection(db, "Teams"), {
      ...newTeam,
      createdAt: new Date().toISOString(),
      totalLoads: 0,
      completedLoads: 0,
      activeLoads: 0
    });

    // Get the new team's ID
    const teamId = teamRef.id;

    // Update each team member's document to include this team
    const updatePromises = newTeam.members.map(async (memberName) => {
      // Find the dispatcher document with this name
      const dispatchersRef = collection(db, 'Dispatchers');
      const q = query(dispatchersRef, where('name', '==', memberName));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach(async (doc) => {
        const dispatcherData = doc.data();
        const currentTeams = dispatcherData.teams || [];
        
        // Add the new team to the dispatcher's teams
        await updateDoc(doc.ref, {
          teams: [...currentTeams, {
            id: teamId,
            name: newTeam.name
          }]
        });
      });
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // Refresh data
    const teamsSnapshot = await getDocs(collection(db, "Teams"));
    const teamsList = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTeams(teamsList);
    
    // Refresh dispatchers to show updated teams
    await fetchDispatchers();
    
    setOpenTeamDialog(false);
    setNewTeam({
      name: '',
      description: '',
      leadDispatcher: '',
      members: [],
      telegramGroupId: ''
    });
  } catch (e) {
    console.error("Error adding team: ", e);
  }
};

  const handleTeamClick = async (team) => {
    try {
      // Get fresh team data
      const teamDoc = await getDoc(doc(db, "Teams", team.id));
      const teamData = teamDoc.data();
      
      // Get team's dispatchers
      const teamDispatchers = dispatchers.filter(d => 
        d.teams && d.teams.includes(team.name)
      );
      
      setSelectedTeamDetails({
        ...team,
        ...teamData,
        dispatchers: teamDispatchers,
        metrics: {
          completionRate: calculateCompletionRate(teamData),
          totalRevenue: calculateTeamRevenue(teamData),
          activeLoads: teamData?.activeLoads || 0,
          completedLoads: teamData?.completedLoads || 0
        }
      });
      setTeamDetailsOpen(true);
    } catch (error) {
      console.error("Error fetching team details:", error);
    }
  };

  // Helper functions for metrics
  const calculateCompletionRate = (teamData) => {
    const completed = teamData?.completedLoads || 0;
    const total = (teamData?.activeLoads || 0) + completed;
    return total ? Math.round((completed / total) * 100) : 0;
  };

  const calculateTeamRevenue = (teamData) => {
    return teamData?.totalRevenue || 0;
  };

  const calculateDispatcherPerformance = (dispatcher) => {
    const completed = dispatcher.loads?.filter(l => l.status === 'Delivered')?.length || 0;
    const total = dispatcher.loads?.length || 0;
    return total ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dispatchers</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)}>
            Add Dispatcher
          </Button>
        </Box>
      </Box>

      {/* Team Management Section */}
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            <GroupsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Team Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<GroupAddIcon />}
            onClick={() => setOpenTeamDialog(true)}
            color="secondary"
          >
            Create Team
          </Button>
        </Box>

        <Grid container spacing={3}>
          {teams.map((team) => (
            <Grid item xs={12} md={6} lg={4} key={team.id || team}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease-in-out'
                  }
                }}
                onClick={() => handleTeamClick(team)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{team.name || team}</Typography>
                    <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 30, height: 30 } }}>
                      {dispatchers
                        .filter(d => d.teams && d.teams.includes(team.name || team))
                        .map((dispatcher) => (
                          <Avatar key={dispatcher.id}>{dispatcher.avatar}</Avatar>
                        ))}
                    </AvatarGroup>
                  </Box>
                  
                  {team.id && (
                    <>
                      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Chip 
                          label={`${team.activeLoads || 0} Active`}
                          color="primary"
                          size="small"
                        />
                        <Chip 
                          label={`${team.completedLoads || 0} Completed`}
                          color="success"
                          size="small"
                        />
                      </Stack>

                      <Collapse in={expandedTeam === team.id}>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2">{team.description}</Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="subtitle2">
                            Lead: {team.leadDispatcher || 'Not assigned'}
                          </Typography>
                        </Box>
                      </Collapse>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <IconButton
                          onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                          sx={{ transform: expandedTeam === team.id ? 'rotate(180deg)' : 'none' }}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

  {/* Team Selection */}
<Box sx={{ mb: 2 }}>
  <Typography variant="h6">View Team:</Typography>
  {teams.map((team) => (
    <Chip
      key={team.id}
      label={team.name}
      onClick={() => handleTeamSelect(team)}
      sx={{ mr: 1, cursor: 'pointer', mb: 1 }}
      color={selectedTeam?.id === team.id ? 'primary' : 'default'}
      variant={selectedTeam?.id === team.id ? 'filled' : 'outlined'}
    />
  ))}
  {selectedTeam && (
    <Button 
      onClick={() => setSelectedTeam(null)} 
      size="small"
      sx={{ ml: 2 }}
      variant="outlined"
    >
      View All
    </Button>
  )}
</Box>

      {/* Add Dispatcher Form */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Dispatcher</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            name="name"
            value={newDispatcher.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            id="username"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            name="username"
            value={newDispatcher.username}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            id="telegram"
            label="Telegram"
            type="text"
            fullWidth
            variant="outlined"
            name="telegram"
            value={newDispatcher.telegram}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            id="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            name="email"
            value={newDispatcher.email}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            id="phone"
            label="Phone"
            type="text"
            fullWidth
            variant="outlined"
            name="phone"
            value={newDispatcher.phone}
            onChange={handleInputChange}
          />
<FormControl sx={{ m: 1, width: '100%' }}>
  <InputLabel id="multiple-teams-label">Teams</InputLabel>
  <Select
    labelId="multiple-teams-label"
    id="multiple-teams"
    multiple
    value={newDispatcher.teams}
    onChange={(event) => {
      const selectedTeamIds = event.target.value;
      const selectedTeamObjects = teams.filter(team => 
        selectedTeamIds.includes(team.id)
      );
      setNewDispatcher(prev => ({
        ...prev,
        teams: selectedTeamObjects
      }));
    }}
    input={<OutlinedInput label="Teams" />}
    renderValue={(selected) => {
      return selected.map(team => team.name).join(', ');
    }}
    MenuProps={MenuProps}
  >
    {teams.map((team) => (
      <MenuItem key={team.id} value={team.id}>
        <Checkbox 
          checked={newDispatcher.teams.some(t => t.id === team.id)}
        />
        <ListItemText primary={team.name} />
      </MenuItem>
    ))}
  </Select>
</FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowForm(false)}>Cancel</Button>
          <Button onClick={addDispatcherToFirestore}>Add</Button>
        </DialogActions>
      </Dialog>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Dispatcher</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Managed Loads</TableCell>
                <TableCell>Teams</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDispatchers.map((dispatcher) => {
                const loads = dispatcher.loads || [];
                const teamsList = dispatcher.teams ? dispatcher.teams.join(', ') : 'No Team';

                return (
                  <TableRow
                    key={dispatcher.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                    onClick={() => handleDispatcherClick(dispatcher)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>{dispatcher.avatar}</Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{dispatcher.name}</Typography>
                          <Typography variant="caption" color="text.secondary">ID: DSP-{dispatcher.id.toString().padStart(4, '0')}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={dispatcher.onDuty ? "On Duty" : "Off Duty"}
                        size="small"
                        color={dispatcher.onDuty ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>{loads.length}</TableCell>
                 <TableCell>
  {((dispatcher.teams && dispatcher.teams.length > 0) 
    ? dispatcher.teams.map(team => typeof team === 'string' ? team : team.name)
    : teams
        .filter(team => team.members?.includes(dispatcher.name))
        .map(team => team.name)
  ).join(', ') || 'No Team'}
</TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="more"
                        aria-controls="dispatcher-menu"
                        aria-haspopup="true"
                        onClick={(event) => handleMenuButtonClick(event, dispatcher.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Menu
        id="dispatcher-menu"
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={() => { handleOpenDeleteConfirmation(selectedDispatcherId); handleMenuClose(); }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
        <MenuItem onClick={() => { setSelectedDispatcher(dispatchers.find(d => d.id === selectedDispatcherId)); handleMenuClose(); setIsDetailsModalOpen(true); }}>
          <InfoOutlined sx={{ mr: 1 }} />
          View Details
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteConfirmationOpen}
        onClose={handleCloseDeleteConfirmation}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Dispatcher?"}</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this dispatcher?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmation} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteDispatcher} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Modal
        open={isDetailsModalOpen}
        onClose={handleDetailsModalClose}
        aria-labelledby="dispatcher-details-modal-title"
        aria-describedby="dispatcher-details-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="dispatcher-details-modal-title" variant="h6" component="h2">
            Dispatcher Details
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleDetailsModalClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          {detailedDispatcher && (
            <Box>
              <Typography variant="body1">Name: {detailedDispatcher.name}</Typography>
              <Typography variant="body1">Username: {detailedDispatcher.username}</Typography>
              <Typography variant="body1">Telegram: {detailedDispatcher.telegram}</Typography>
              <Typography variant="body1">Email: {detailedDispatcher.email}</Typography>
              <Typography variant="body1">Phone: {detailedDispatcher.phone}</Typography>
              <Typography variant="body1">On Duty: {detailedDispatcher.onDuty ? 'Yes' : 'No'}</Typography>
              <Typography variant="body1">Managed Loads: {detailedDispatcher.loads ? detailedDispatcher.loads.length : 0}</Typography>
            <Typography variant="body1">
  Teams: {detailedDispatcher.teams?.map(team => team.name).join(', ') || 'No Team'}
</Typography>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Create Team Dialog */}
      <Dialog open={openTeamDialog} onClose={() => setOpenTeamDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Team</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Team Name"
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={newTeam.description}
            onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Lead Dispatcher</InputLabel>
            <Select
              value={newTeam.leadDispatcher}
              onChange={(e) => setNewTeam({ ...newTeam, leadDispatcher: e.target.value })}
              label="Lead Dispatcher"
            >
              {dispatchers.map((dispatcher) => (
                <MenuItem key={dispatcher.id} value={dispatcher.name}>
                  {dispatcher.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Team Members</InputLabel>
            <Select
              multiple
              value={newTeam.members}
              onChange={(e) => setNewTeam({ ...newTeam, members: e.target.value })}
              input={<OutlinedInput label="Team Members" />}
              renderValue={(selected) => selected.join(', ')}
            >
              {dispatchers.map((dispatcher) => (
                <MenuItem key={dispatcher.id} value={dispatcher.name}>
                  <Checkbox checked={newTeam.members.indexOf(dispatcher.name) > -1} />
                  <ListItemText primary={dispatcher.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Telegram Group ID (Optional)"
            value={newTeam.telegramGroupId}
            onChange={(e) => setNewTeam({ ...newTeam, telegramGroupId: e.target.value })}
            margin="normal"
            helperText="Enter Telegram group ID for notifications"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTeamDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTeam} variant="contained">Create Team</Button>
        </DialogActions>
      </Dialog>

      {/* Team Details Dialog */}
      <Dialog 
        open={teamDetailsOpen} 
        onClose={() => setTeamDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTeamDetails && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5">{selectedTeamDetails.name}</Typography>
                <IconButton onClick={() => setTeamDetailsOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Team Overview */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Team Overview</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">
                            {selectedTeamDetails.metrics.activeLoads}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Active Loads
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="success.main">
                            {selectedTeamDetails.metrics.completionRate}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Completion Rate
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4">
                            {selectedTeamDetails.dispatchers.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Team Members
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="info.main">
                            ${selectedTeamDetails.metrics.totalRevenue.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Revenue
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Team Members */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Team Members</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Dispatcher</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Active Loads</TableCell>
                            <TableCell>Performance</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedTeamDetails.dispatchers.map((dispatcher) => (
                            <TableRow key={dispatcher.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar sx={{ mr: 1, width: 24, height: 24 }}>
                                    {dispatcher.avatar}
                                  </Avatar>
                                  <Typography variant="body2">{dispatcher.name}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={dispatcher.onDuty ? "On Duty" : "Off Duty"}
                                  color={dispatcher.onDuty ? "success" : "default"}
                                />
                              </TableCell>
                              <TableCell>
                                {dispatcher.loads?.length || 0}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={calculateDispatcherPerformance(dispatcher)}
                                    sx={{ flexGrow: 1, mr: 1 }}
                                  />
                                  <Typography variant="caption">
                                    {calculateDispatcherPerformance(dispatcher)}%
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>

                {/* Recent Activity */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
                    <Timeline>
                      {/* Add your timeline items here */}
                      <TimelineItem>
                        <TimelineSeparator>
                          <TimelineDot color="primary" />
                          <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body2">
                            New load assigned to team
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            2 hours ago
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                      {/* Add more timeline items as needed */}
                    </Timeline>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
            <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
    
  );
}

export default Dispatchers;