import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { collection, getDocs, addDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';


function DriverForm({ onDriverAdded }) {
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverTelegramUsername, setNewDriverTelegramUsername] = useState('');
  const [newDriverEmail, setNewDriverEmail] = useState('');
  const [newDriverPhoneNumber, setNewDriverPhoneNumber] = useState('');
  const [newDriverAddress, setNewDriverAddress] = useState('');
  const [newDriverLicenseNumber, setNewDriverLicenseNumber] = useState('');
  const [newDriverLicenseExpirationDate, setNewDriverLicenseExpirationDate] = useState('');

  const addDriver = async () => {
    try {
      await addDoc(collection(db, "Drivers"), {
        name: newDriverName,
        telegramUsername: newDriverTelegramUsername,
        email: newDriverEmail,
        phoneNumber: newDriverPhoneNumber,
        address: newDriverAddress,
        licenseNumber: newDriverLicenseNumber,
        licenseExpirationDate: newDriverLicenseExpirationDate,
        status: 'READY', // Default status
        history: [],
        loads: [],
        avatar: newDriverName.substring(0, 2).toUpperCase(),
      });
      setNewDriverName('');
      setNewDriverTelegramUsername('');
      setNewDriverEmail('');
      setNewDriverPhoneNumber('');
      setNewDriverAddress('');
      setNewDriverLicenseNumber('');
      setNewDriverLicenseExpirationDate('');
      onDriverAdded(); // Notify parent component to refresh the driver list
    } catch (error) {
      console.error("Error adding driver: ", error);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6">Add New Driver</Typography>
      <TextField
        label="Name"
        fullWidth
        margin="normal"
        value={newDriverName}
        onChange={(e) => setNewDriverName(e.target.value)}
      />
      <TextField
        label="Telegram Username"
        fullWidth
        margin="normal"
        value={newDriverTelegramUsername}
        onChange={(e) => setNewDriverTelegramUsername(e.target.value)}
      />
      <TextField
        label="Email"
        fullWidth
        margin="normal"
        value={newDriverEmail}
        onChange={(e) => setNewDriverEmail(e.target.value)}
      />
      <TextField
        label="Phone Number"
        fullWidth
        margin="normal"
        value={newDriverPhoneNumber}
        onChange={(e) => setNewDriverPhoneNumber(e.target.value)}
      />
      <TextField
        label="Address"
        fullWidth
        margin="normal"
        value={newDriverAddress}
        onChange={(e) => setNewDriverAddress(e.target.value)}
      />
      <TextField
        label="License Number"
        fullWidth
        margin="normal"
        value={newDriverLicenseNumber}
        onChange={(e) => setNewDriverLicenseNumber(e.target.value)}
      />
      <TextField
        label="License Expiration Date"
        fullWidth
        margin="normal"
        value={newDriverLicenseExpirationDate}
        onChange={(e) => setNewDriverLicenseExpirationDate(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={addDriver}>
        Add Driver
      </Button>
    </Box>
  );
}

export default DriverForm;