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
  CircularProgress,
  TableSortLabel,
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  Modal,
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  InfoOutlined,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import DriverForm from './DriverForm';
import { collection, getDocs, addDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

import { visuallyHidden } from '@mui/utils';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'name', numeric: false, disablePadding: false, label: 'Driver' },
  { id: 'truckNumber', numeric: false, disablePadding: false, label: 'Truck #' },
  { id: 'totalGross', numeric: true, disablePadding: false, label: 'Total Gross' },
  { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
  { id: 'completedLoads', numeric: true, disablePadding: false, label: 'Completed Loads' },
  { id: 'loads', numeric: true, disablePadding: false, label: 'Active Loads' },
  { id: 'actions', numeric: false, disablePadding: false, label: 'Actions' },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

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

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('name');
  const [newDriverName, setNewDriverName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const querySnapshot = await getDocs(collection(db, 'Drivers'));
    const driverList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setDrivers(driverList);
    setLoading(false);
  };

  const handleDriverAdded = () => {
    fetchDrivers();
    setShowForm(false);
  };

  const addDriverToFirestore = async () => {
    try {
      const docRef = await addDoc(collection(db, "Drivers"), {
        name: newDriverName,
        status: 'READY',
        history: [],
        loads: [],
        avatar: newDriverName.substring(0, 2).toUpperCase(),
        email: '',
        truckNumber: '',
        totalGross: 0,
      });
      console.log("Document written with ID: ", docRef.id);
      setNewDriverName('');
      await fetchDrivers();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const enhancedTableProps = {
    order: order,
    orderBy: orderBy,
    onRequestSort: handleRequestSort,
  };

  const filteredDrivers = drivers.filter((driver) =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDeleteConfirmation = (driverId) => {
    setSelectedDriverId(driverId);
    setDeleteConfirmationOpen(true);
  };

  const handleCloseDeleteConfirmation = () => {
    setDeleteConfirmationOpen(false);
  };

  const handleDeleteDriver = async () => {
    if (selectedDriverId) {
      try {
        await deleteDoc(doc(db, "Drivers", selectedDriverId));
        console.log("Document successfully deleted!");
        await fetchDrivers();
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
      setDeleteConfirmationOpen(false);
      setSelectedDriverId(null);
    }
  };

  const handleMenuOpen = (event, driverId) => {
    setSelectedDriverId(driverId);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedDriverId(null);
  };

  const handleDriverClick = (driver) => {
    setSelectedDriver(driver);
    setIsDetailsModalOpen(true);
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false);
    setSelectedDriver(null);
  };

  const handleMenuButtonClick = (event, driverId) => { // Add this function
    event.stopPropagation(); // Stop event propagation
    handleMenuOpen(event, driverId);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Drivers</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Search Drivers"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)}>
            Add Driver
          </Button>
        </Box>
      </Box>

      {showForm ? (
        <Box sx={{ mb: 2 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setShowForm(false)}>
            Go Back
          </Button>
          <DriverForm onDriverAdded={handleDriverAdded} />
        </Box>
      ) : null}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table
              sx={{ minWidth: 750 }}
              aria-labelledby="tableTitle"
            >
              <EnhancedTableHead {...enhancedTableProps} />
              <TableBody>
                {stableSort(filteredDrivers, getComparator(order, orderBy))
                  .map((driver) => {
                    if (!driver) {
                      console.warn('Driver is undefined!');
                      return null;
                    }

                    const history = driver.history || [];
                    const loads = driver.loads || [];

                    const completedLoads = Array.isArray(history)
                      ? history.filter((h) => h.includes('Completed')).length
                      : 0;

                    return (
                      <TableRow
                        hover
                        key={driver.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                        onClick={() => handleDriverClick(driver)}
                      >
                        <TableCell component="th" scope="row" padding="normal">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2 }}>{driver.avatar}</Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {driver.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {driver.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{driver.truckNumber}</TableCell>
                        <TableCell align="right">{driver.totalGross}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={driver.status}
                            size="small"
                            color={
                              driver.status === 'READY' ? 'success' : driver.status === 'BUSY' ? 'warning' : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell align="right">{completedLoads}</TableCell>
                        <TableCell align="right">{loads.length}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            aria-label="more"
                            aria-controls="driver-menu"
                            aria-haspopup="true"
                            onClick={(event) => handleMenuButtonClick(event, driver.id)} // Use the new function
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
      )}

      <Menu
        id="driver-menu"
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={() => { handleOpenDeleteConfirmation(selectedDriverId); handleMenuClose(); }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
        <MenuItem onClick={() => { setSelectedDriver(drivers.find(d => d.id === selectedDriverId)); handleMenuClose(); setIsDetailsModalOpen(true); }}>
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
        <DialogTitle id="alert-dialog-title">{"Delete Driver?"}</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this driver?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmation} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteDriver} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Modal
        open={isDetailsModalOpen}
        onClose={handleDetailsModalClose}
        aria-labelledby="driver-details-modal-title"
        aria-describedby="driver-details-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="driver-details-modal-title" variant="h6" component="h2">
            Driver Details
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
          {selectedDriver && (
            <Box>
              <Typography variant="body1">Name: {selectedDriver.name}</Typography>
              <Typography variant="body1">Email: {selectedDriver.email}</Typography>
              <Typography variant="body1">Truck Number: {selectedDriver.truckNumber}</Typography>
              <Typography variant="body1">Total Gross: {selectedDriver.totalGross}</Typography>
              {/* Display completed loads and other history here */}
            </Box>
          )}
        </Box>
      </Modal>
    </Container>
  );
}

export default Drivers;