require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// ── Route Imports ──────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const diagnosisRoutes = require('./routes/diagnosisRoutes');

// ── Connect to MongoDB ─────────────────────────────────────────────────
connectDB();

const app = express();

// ── Core Middleware ────────────────────────────────────────────────────
app.use(compression());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging (only in development)
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// ── Health Check ───────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🏥 HealthCare API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
    });
});

// ── API Routes ─────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/diagnosis', diagnosisRoutes);

// ── 404 Handler (unknown routes) ───────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found.`,
    });
});

// ── Global Error Handler (must be last) ───────────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 API Base URL: http://localhost:${PORT}/api`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/api/health\n`);
});

// ── Graceful Shutdown ─────────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Promise Rejection: ${err.message}`);
    server.close(() => {
        console.log('Server closed due to unhandled rejection.');
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

module.exports = app;
