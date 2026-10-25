const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB, mongoose } = require('./db');
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Body parsing middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets from public/
app.use(express.static(path.join(__dirname, '..', 'public')));

// Auto-reconnect middleware for API routes to handle sleep/wake network drops
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && req.path !== '/api/health') {
    if (mongoose.connection.readyState !== 1) {
      try {
        await connectDB(2, 1000);
      } catch (err) {
        return res.status(503).json({
          success: false,
          message: 'Database connection temporarily unavailable. Please retry momentarily.'
        });
      }
    }
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB(2, 1000).catch(() => {});
    }
    const isConnected = mongoose.connection.readyState === 1;
    res.json({
      status: isConnected ? 'healthy' : 'degraded',
      service: 'VaccineScheduler Auth & Schedule Service',
      database: isConnected ? 'MongoDB Atlas Connected' : 'Disconnected',
      host: mongoose.connection.host || 'unknown',
      dbName: mongoose.connection.name || 'unknown',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      error: err.message
    });
  }
});

// Single Page Application routing fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start Express server
function startServer() {
  const server = app.listen(PORT, async () => {
    console.log(`\n======================================================`);
    console.log(`🚀 VaccineScheduler Server running on http://localhost:${PORT}`);
    console.log(`✨ Soft Neumorphic UI Ready at http://localhost:${PORT}`);
    console.log(`======================================================\n`);

    try {
      await connectDB();
      console.log(`📡 Connected to MongoDB Atlas Database: ${mongoose.connection.name}`);
    } catch (err) {
      console.warn(`\n⚠️  [MongoDB Notice]: Could not connect on startup.`);
      console.warn(`👉 If this is an IP Whitelist issue, in MongoDB Atlas -> Network Access:`);
      console.warn(`   Click "Add IP Address" -> Select "Allow Access from Anywhere (0.0.0.0/0)" or whitelist your current public IP.`);
      console.warn(`   The server is running and will auto-reconnect once access is granted.\n`);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const ALT_PORT = Number(PORT) + 1;
      console.warn(`⚠️ Port ${PORT} is busy, retrying on port ${ALT_PORT}...`);
      app.listen(ALT_PORT, () => {
        console.log(`🚀 Server running on alternate http://localhost:${ALT_PORT}`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer();
