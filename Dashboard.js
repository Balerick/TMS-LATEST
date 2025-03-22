import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Container,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import PersonIcon from '@mui/icons-material/Person';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Tooltip,
  Legend,
} from 'recharts';

function Dashboard({ drivers, dispatchers, loads, chartData, statusData, weeklyData, colors }) {
  // Add console.log here to check the data
  console.log("Loads data:", loads);
  console.log("Chart data:", chartData);
  console.log("Status data:", statusData);

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Load
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 80,
              height: 80,
              backgroundColor: 'primary.light',
              opacity: 0.2,
              borderRadius: '0 0 0 100%'
            }} />
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Drivers
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 2 }}>{drivers.length}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  size="small"
                  label={`${drivers.filter(d => d.status === "READY").length} Ready`}
                  color="success"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {Math.round(drivers.filter(d => d.status === "READY").length / drivers.length * 100)}% Available
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 80,
              height: 80,
              backgroundColor: 'secondary.light',
              opacity: 0.2,
              borderRadius: '0 0 0 100%'
            }} />
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Dispatchers
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 2 }}>{dispatchers.length}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  size="small"
                  label={`${dispatchers.filter(d => d.onDuty).length} On Duty`}
                  color="info"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {Math.round(dispatchers.filter(d => d.onDuty).length / dispatchers.length * 100)}% Active
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 80,
              height: 80,
              backgroundColor: 'warning.light',
              opacity: 0.2,
              borderRadius: '0 0 0 100%'
            }} />
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Loads
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 2 }}>{loads.length}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  size="small"
                  label={`${loads.filter(l => l.status === "In Transit").length} In Transit`}
                  color="warning"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {Math.round(loads.filter(l => l.status === "Delivered").length / loads.length * 100)}% Completed
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 80,
              height: 80,
              backgroundColor: 'error.light',
              opacity: 0.2,
              borderRadius: '0 0 0 100%'
            }} />
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Revenue
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 2 }}>
                {loads.map(load => ({ ...load, rate: Number(load.rate.replace('$', '')) }))
                     .reduce((sum, load) => sum + load.rate, 0)
                     .toLocaleString('en-US', {
                       style: 'currency',
                       currency: 'USD',
                       minimumFractionDigits: 0
                     })}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  size="small"
                  label="This Month"
                  color="error"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  +12% vs Last Month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Weekly Loads Activity</Typography>
              <Button size="small" endIcon={<ArrowDropDown />}>This Week</Button>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="loads" stroke="#3f51b5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Load Status Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} loads`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Driver Performance</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="loads" name="Active Loads" fill="#3f51b5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed Loads" fill="#4caf50" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Loads */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Recent Loads</Typography>
            <Button size="small" endIcon={<ArrowDropDown />}>View All</Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Load ID</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Dispatcher</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loads.slice(0, 3).map((load) => {
                  return (
                    <TableRow key={load.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{load.load_id}</Typography>
                        <Typography variant="caption" color="text.secondary">{load.date}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{load.city}</Typography>
                        <Typography variant="caption" color="text.secondary">to {load.destination}</Typography>
                      </TableCell>
                      <TableCell>
                        {load.assigned_to ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                           <PersonIcon/>
                            <Typography variant="body2">
                              {drivers.find(d => d.id === load.assigned_to)?.name}
                            </Typography>
                          </Box>
                        ) : (
                          <Chip label="Unassigned" size="small" color="default" />
                        )}
                      </TableCell>
                      <TableCell>
                        {load.dispatcher ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                             <PersonIcon/>
                            <Typography variant="body2">
                              {dispatchers.find(d => d.id === load.dispatcher)?.name}
                            </Typography>
                          </Box>
                        ) : (
                          <Chip label="Unassigned" size="small" color="default" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={load.status}
                          size="small"
                          color={
                            load.status === "Delivered" ? "success" :
                              load.status === "In Transit" ? "warning" :
                                load.status === "Pending" ? "primary" : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{load.rate.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0
                        })}</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
}

export default Dashboard;