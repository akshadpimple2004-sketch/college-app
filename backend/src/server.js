const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection, pool } = require('./config/db');
const { metricsMiddleware, metricsHandler } = require('./middleware/metrics');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Enable HTTP metrics tracking
app.use(metricsMiddleware);

// API Routes
app.use('/api', apiRoutes);

// Health Check Endpoint
app.get('/health', async (req, res) => {
  try {
    // Ping MySQL to verify active connection
    const connection = await pool.getConnection();
    connection.release();
    
    res.status(200).json({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date(),
      database: 'CONNECTED'
    });
  } catch (err) {
    res.status(503).json({
      status: 'DOWN',
      uptime: process.uptime(),
      timestamp: new Date(),
      database: 'DISCONNECTED',
      error: err.message
    });
  }
});

// Scraping endpoint for Prometheus
app.get('/metrics', metricsHandler);

// Fallback path handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start listening
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  
  // Test connection to the database
  await testConnection();
});

module.exports = app;
