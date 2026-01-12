const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

// =======================
// Basic middleware
// =======================
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// =======================
// Health endpoint
// =======================
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'ElectroMart Admin API' });
});

// =======================
// Uploads directory (STEP-7C)
// =======================
const path = require('path');
const fs = require('fs');

const uploadsRoot = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(path.join(uploadsRoot, 'vendors'), { recursive: true });
fs.mkdirSync(path.join(uploadsRoot, 'products'), { recursive: true });

// Serve uploads statically
app.use('/uploads', express.static(uploadsRoot));

// =======================
// API routes (existing)
// =======================
app.use('/api/v1', routes);

// =======================
// 404 handler
// =======================
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// =======================
// Error handler
// =======================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

module.exports = app;
