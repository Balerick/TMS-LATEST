import React from 'react';
import PropTypes from 'prop-types';  // Add this at the top
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

function LoadForms({
  load,
  drivers,
  dispatchers,
  onInputChange,
  onDriverChange
}) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          margin="dense"
          label="Load ID"
          name="load_id"
          value={load.load_id}
          onChange={onInputChange}
          fullWidth
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          autoFocus
          margin="dense"
          label="Origin City"
          name="city"
          value={load.city}
          onChange={onInputChange}
          fullWidth
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          margin="dense"
          label="Destination"
          name="destination"
          value={load.destination}
          onChange={onInputChange}
          fullWidth
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          margin="dense"
          label="Total Miles"
          name="totalMiles"
          type="number"
          value={load.totalMiles}
          onChange={onInputChange}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          margin="dense"
          label="Rate"
          name="rate"
          value={load.rate}
          onChange={onInputChange}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          margin="dense"
          label="RPM"
          name="rpm"
          type="number"
          value={load.rpm}
          onChange={onInputChange}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth margin="dense">
          <InputLabel>Driver(s)</InputLabel>
          <Select
            multiple
            name="assigned_to"
            value={load.assigned_to || []}
            onChange={onDriverChange}
          >
            {drivers.map((driver) => (
             <MenuItem key={driver.id} value={driver.id}>
               {driver.name}
               </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth margin="dense">
          <InputLabel>Dispatcher</InputLabel>
          <Select
             name="dispatcher"
             value={load.dispatcher || ''}  // Ensure it always has a default value
             onChange={onInputChange}
           >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {dispatchers.map((dispatcher) => (
             <MenuItem key={dispatcher.id} value={dispatcher.id}>  
               {dispatcher.name}  
             </MenuItem>
))}

          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth margin="dense">
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={load.status || 'Pending'}  // Ensure it always has a default value
            onChange={onInputChange}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Transit">In Transit</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      {/* Additional form fields for new load properties */}
      <Grid item xs={12} sm={6}>
        <TextField
          margin="dense"
          label="Assignment Notes"
          name="assignment_notes"
          value={load.assignment_notes}
          onChange={onInputChange}
          fullWidth
          multiline
          rows={2}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth margin="dense">
          <InputLabel>Assignment Priority</InputLabel>
          <Select
            name="assignment_priority"
            value={load.assignment_priority}
            onChange={onInputChange}
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
LoadForms.propTypes = {
  load: PropTypes.shape({
    load_id: PropTypes.string,
    city: PropTypes.string,
    destination: PropTypes.string,
    totalMiles: PropTypes.string,
    rate: PropTypes.string,
    rpm: PropTypes.string,
    date: PropTypes.string,
    assigned_to: PropTypes.array,
    dispatcher: PropTypes.string,
    status: PropTypes.string,
    assignment_notes: PropTypes.string,
    assignment_priority: PropTypes.string
  }).isRequired,
  drivers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string
    })
  ).isRequired,
  dispatchers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string
    })
  ).isRequired,
  onInputChange: PropTypes.func.isRequired,
  onDriverChange: PropTypes.func.isRequired
};

export default LoadForms;