const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB before starting the server
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Health check — handy for deployment platforms
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);

// 404 – anything that didn't match above
app.use((req, res) => {
  res.status(404).json({ message: 'The requested route does not exist.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`HRMS Lite API running on port ${PORT}`);
});
