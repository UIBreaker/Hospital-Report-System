const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const staffRoutes = require('./routes/staffRoutes');
const customFormRoutes = require('./routes/customFormRoutes');
const { auth } = require('./middleware/auth');
const { getStaffByDepartment } = require('./controllers/staffController');
const errorHandler = require('./middleware/errorHandler');
const pool = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Welcome & Status endpoints
app.get('/', (req, res) => {
  res.json({
    name: 'Hospital Report System API - BVĐK KV Bình Long',
    status: 'online',
    frontendUrl: 'http://localhost:5173',
    endpoints: {
      auth: '/api/auth/login',
      reports: '/api/reports',
      admin: '/api/admin/dashboard',
      staff: '/api/staff'
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    message: 'Hệ thống API Báo cáo Giao ban đang hoạt động bình thường',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/custom-forms', customFormRoutes);
app.get('/api/staff-by-department', auth, getStaffByDepartment);

// Error Handler
app.use(errorHandler);

module.exports = app;
