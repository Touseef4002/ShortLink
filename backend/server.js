const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const ratelimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const app = express();

connectDB();

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        }
    },
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    }
}));


if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            return res.redirect(`https://${req.header('host')}${req.url}`);
        }
        next();
    });
}

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'production'){
    app.use(morgan('combined'), {
        stream: {write: (message) => logger.info(message.trim())}
    });
}
else {
    app.use(morgan('dev'));
}

const limiter = ratelimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message:'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api',limiter);

const authLimiter = ratelimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message:'Too many authentication attempts from this IP, please try again later.'
    }
});

const authRoutes = require('./routes/auth');
const linkRoutes = require('./routes/links');
const analyticsRoutes = require('./routes/analytics');
const {redirectLink} = require('./controllers/linkController');

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    })
})

app.get('/:shortCode', redirectLink);

app.use((req, res, next) => {
    logger.warn('Route not found', {
        method: req.method,
        url: req.url,
        ip: req.ip
    });
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use((err, req, res, next) => {
    logger.logError(err, {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userId: req.user?._id
    });

    const message = process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message;

    res.status(err.statusCode ||500).json({
        success: false,
        message, 
        ...(process.env.NODE_ENV !== 'production' && {stack: err.stack})
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    logger.info('Server started', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        frontend: process.env.FRONTEND_URL || 'http://localhost:5173'
    });

    console.log('');
    console.log('🚀 ================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`💻 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log('🚀 ================================');
    console.log('');
});