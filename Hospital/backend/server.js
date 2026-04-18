import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';

// Load environment variables from .env file in the current directory
dotenv.config({ path: './.env' });

// Connect to MongoDB
connectDB();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser tools and same-origin requests without Origin header
    if (!origin) return callback(null, true);

    // If no CORS_ORIGIN is set, allow all (development-friendly default)
    if (allowedOrigins.length === 0) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/appointments', appointmentRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Hospital Management System API',
    version: '2.0.0',
    endpoints: {
      hospitals: '/api/hospitals',
      register: 'POST /api/hospitals/register',
      // Authentication
      authRegister: 'POST /api/auth/register',
      authLogin: 'POST /api/auth/login',
      userProfile: 'GET /api/auth/me',
      // Chat History
      chatSessions: '/api/chat/sessions',
      chatStats: 'GET /api/chat/stats',
      login: 'POST /api/hospitals/login',
      // Appointments
      bookAppointment: 'POST /api/appointments',
      myAppointments: 'GET /api/appointments'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📍 API available at port ${PORT}`);
});
