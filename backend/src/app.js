require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const tripRoutes = require('./routes/trip.routes');
const stopRoutes = require('./routes/stop.routes');
const cityRoutes = require('./routes/city.routes');
const authMiddleware = require('./middleware/auth.middleware');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', authMiddleware, tripRoutes);
app.use('/api/stops', authMiddleware, stopRoutes);
app.use('/api/cities', cityRoutes);

app.use(errorMiddleware);

module.exports = app;
