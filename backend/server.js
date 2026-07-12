const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import routers and middleware
const authRoutes = require('./routes/authRoutes');
const orgRoutes = require('./routes/orgRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const errorHandler = require('./middlewares/errorHandler');

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AssetFlow API Server is running normally',
    timestamp: new Date().toISOString()
  });
});

// Centralized error handling middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
