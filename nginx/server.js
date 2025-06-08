// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const { createProxyMiddleware } = require('http-proxy-middleware');
// const cookieParser = require('cookie-parser');
// const compression = require('compression');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware setup
// app.use(compression());
// app.use(cookieParser());
// app.use(morgan('combined'));

// // CORS configuration - allow all origins as requested
// app.use(cors({
//   origin: true, // Allow all origins
//   credentials: true, // Allow cookies to be included
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: [
//     'DNT',
//     'User-Agent',
//     'X-Requested-With',
//     'If-Modified-Since',
//     'Cache-Control',
//     'Content-Type',
//     'Range',
//     'Authorization',
//     'Accept',
//     'Origin',
//     'X-CSRF-Token'
//   ],
//   exposedHeaders: ['Content-Length', 'Content-Range', 'Set-Cookie']
// }));

// // Security headers with relaxed CSP for development
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "http:", "https:", "data:", "blob:"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https:"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
//       imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
//       connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"]
//     }
//   },
//   crossOriginEmbedderPolicy: false
// }));

// // Custom headers for better compatibility
// app.use((req, res, next) => {
//   res.header('X-Frame-Options', 'SAMEORIGIN');
//   res.header('X-XSS-Protection', '1; mode=block');
//   res.header('X-Content-Type-Options', 'nosniff');
//   res.header('Referrer-Policy', 'no-referrer-when-downgrade');
  
//   // Handle preflight requests
//   if (req.method === 'OPTIONS') {
//     res.header('Access-Control-Max-Age', '86400'); // 24 hours
//     return res.status(204).end();
//   }
  
//   next();
// });

// // Rate limiting middleware (simple implementation)
// const rateLimitMap = new Map();
// const RATE_LIMIT_WINDOW = 60000; // 1 minute
// const RATE_LIMIT_MAX = 600; // 600 requests per minute

// app.use((req, res, next) => {
//   const clientIp = req.ip || req.connection.remoteAddress;
//   const now = Date.now();
  
//   if (!rateLimitMap.has(clientIp)) {
//     rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
//   } else {
//     const limit = rateLimitMap.get(clientIp);
//     if (now > limit.resetTime) {
//       limit.count = 1;
//       limit.resetTime = now + RATE_LIMIT_WINDOW;
//     } else {
//       limit.count++;
//       if (limit.count > RATE_LIMIT_MAX) {
//         return res.status(429).json({ error: 'Too many requests' });
//       }
//     }
//   }
  
//   next();
// });

// // Base proxy configuration
// const baseProxyConfig = {
//   changeOrigin: true,
//   timeout: 240000,
//   proxyTimeout: 240000,
//   secure: true,
//   followRedirects: true,
//   onProxyReq: (proxyReq, req, res) => {
//     // Preserve original headers
//     proxyReq.setHeader('X-Real-IP', req.ip || req.connection.remoteAddress);
//     proxyReq.setHeader('X-Forwarded-For', req.ip || req.connection.remoteAddress);
//     proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
//     proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
    
//     // Handle cookies properly for JWT
//     if (req.headers.cookie) {
//       proxyReq.setHeader('Cookie', req.headers.cookie);
//     }
//   },
//   onProxyRes: (proxyRes, req, res) => {
//     // Handle Set-Cookie headers for JWT tokens
//     if (proxyRes.headers['set-cookie']) {
//       // Modify cookies to be visible in browser dev tools
//       const cookies = proxyRes.headers['set-cookie'].map(cookie => {
//         // Make sure HttpOnly is not set so cookies are visible in dev tools
//         return cookie.replace(/HttpOnly;?\s*/gi, '');
//       });
//       proxyRes.headers['set-cookie'] = cookies;
//     }
    
//     // Add CORS headers to response
//     res.header('Access-Control-Allow-Credentials', 'true');
//   }
// };

// // Auth Service Proxy
// app.use('/api/auth', createProxyMiddleware({
//   ...baseProxyConfig,
//   target: 'https://auth-service-k5aq.onrender.com',
//   onError: (err, req, res) => {
//     console.error('Auth Proxy Error:', err.message);
//     if (!res.headersSent) {
//       res.status(502).json({ error: 'Auth service unavailable' });
//     }
//   }
// }));

// // Emotion Detection Service Proxy
// app.use('/api/emotion-service', createProxyMiddleware({
//   ...baseProxyConfig,
//   target: 'https://emotion-learning-microservice.onrender.com',
//   onError: (err, req, res) => {
//     console.error('Emotion Proxy Error:', err.message);
//     if (!res.headersSent) {
//       res.status(502).json({ error: 'Emotion service unavailable' });
//     }
//   }
// }));

// // Analytics Service Proxy
// app.use('/api/logs', createProxyMiddleware({
//   ...baseProxyConfig,
//   target: 'https://analytics-service-47zl.onrender.com',
//   onError: (err, req, res) => {
//     console.error('Analytics Proxy Error:', err.message);
//     if (!res.headersSent) {
//       res.status(502).json({ error: 'Analytics service unavailable' });
//     }
//   }
// }));

// // Notification Service Proxy
// app.use('/api/send-email', createProxyMiddleware({
//   ...baseProxyConfig,
//   target: 'https://notification-service-qaxu.onrender.com',
//   onError: (err, req, res) => {
//     console.error('Email Proxy Error:', err.message);
//     if (!res.headersSent) {
//       res.status(502).json({ error: 'Email service unavailable' });
//     }
//   }
// }));

// // Video Service Proxy - Upload
// app.use('/api/upload', createProxyMiddleware({
//   ...baseProxyConfig,
//   target: 'https://video-service-w4ir.onrender.com',
//   onError: (err, req, res) => {
//     console.error('Upload Proxy Error:', err.message);
//     if (!res.headersSent) {
//       res.status(502).json({ error: 'Upload service unavailable' });
//     }
//   }
// }));

// // Video Service Proxy - Videos API
// app.use('/api/videos', createProxyMiddleware({
//   ...baseProxyConfig,
//   target: 'https://video-service-w4ir.onrender.com',
//   onError: (err, req, res) => {
//     console.error('Videos Proxy Error:', err.message);
//     if (!res.headersSent) {
//       res.status(502).json({ error: 'Videos service unavailable' });
//     }
//   }
// }));

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'healthy',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     memory: process.memoryUsage(),
//     version: process.version
//   });
// });

// // Root endpoint
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Nginx Reverse Proxy Server',
//     status: 'running',
//     services: [
//       'Auth Service: /api/auth/*',
//       'Emotion Detection: /api/emotion-service/*',
//       'Analytics: /api/logs/*',
//       'Notification: /api/send-email/*',
//       'Video Upload: /api/upload/*',
//       'Video API: /api/videos/*'
//     ],
//     health: '/health'
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     error: 'Not Found',
//     message: `The requested path ${req.originalUrl} was not found on this server`,
//     timestamp: new Date().toISOString()
//   });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error('Server Error:', err);
//   res.status(500).json({
//     error: 'Internal Server Error',
//     message: 'An unexpected error occurred',
//     timestamp: new Date().toISOString()
//   });
// });

// // Graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('SIGTERM received, shutting down gracefully');
//   process.exit(0);
// });

// process.on('SIGINT', () => {
//   console.log('SIGINT received, shutting down gracefully');
//   process.exit(0);
// });

// // Start server
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`🚀 Reverse Proxy Server running on port ${PORT}`);
//   console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`📡 Health check available at: http://localhost:${PORT}/health`);
//   console.log('🔧 Configured services:');
//   console.log('  - Auth Service: /api/auth/*');
//   console.log('  - Emotion Detection: /api/emotion-service/*');
//   console.log('  - Analytics: /api/logs/*');
//   console.log('  - Notification: /api/send-email/*');
//   console.log('  - Video Upload: /api/upload/*');
//   console.log('  - Video API: /api/videos/*');
// });

// module.exports = app;











const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(compression());
app.use(cookieParser());
app.use(morgan('combined'));

// CORS configuration - allow all origins as requested
app.use(cors({
  origin: true, // Allow all origins
  credentials: true, // Allow cookies to be included
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'DNT',
    'User-Agent',
    'X-Requested-With',
    'If-Modified-Since',
    'Cache-Control',
    'Content-Type',
    'Range',
    'Authorization',
    'Accept',
    'Origin',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['Content-Length', 'Content-Range', 'Set-Cookie']
}));

// Security headers with relaxed CSP for development
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "http:", "https:", "data:", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
      imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
      connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Custom headers for better compatibility
app.use((req, res, next) => {
  res.header('X-Frame-Options', 'SAMEORIGIN');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Referrer-Policy', 'no-referrer-when-downgrade');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    return res.status(204).end();
  }
  
  next();
});

// Rate limiting middleware (simple implementation)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 600; // 600 requests per minute

app.use((req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(clientIp)) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    const limit = rateLimitMap.get(clientIp);
    if (now > limit.resetTime) {
      limit.count = 1;
      limit.resetTime = now + RATE_LIMIT_WINDOW;
    } else {
      limit.count++;
      if (limit.count > RATE_LIMIT_MAX) {
        return res.status(429).json({ error: 'Too many requests' });
      }
    }
  }
  
  next();
});

// Base proxy configuration with extended timeouts for sleeping services
const baseProxyConfig = {
  changeOrigin: true,
  timeout: 300000, // 5 minutes for initial connection
  proxyTimeout: 300000, // 5 minutes for response
  secure: true,
  followRedirects: true,
  headers: {
    'Connection': 'keep-alive',
    'Keep-Alive': 'timeout=300, max=1000'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.originalUrl} to target service`);
    
    // Set extended timeout for the request
    proxyReq.setTimeout(300000, () => {
      console.log(`Request timeout for ${req.originalUrl}`);
    });
    
    // Preserve original headers
    proxyReq.setHeader('X-Real-IP', req.ip || req.connection.remoteAddress);
    proxyReq.setHeader('X-Forwarded-For', req.ip || req.connection.remoteAddress);
    proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
    proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
    proxyReq.setHeader('User-Agent', req.get('User-Agent') || 'nginx-proxy/1.0');
    
    // Handle cookies properly for JWT
    if (req.headers.cookie) {
      proxyReq.setHeader('Cookie', req.headers.cookie);
    }
    
    // Add wake-up headers for sleeping services
    proxyReq.setHeader('X-Wake-Service', 'true');
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Response from ${req.originalUrl}: ${proxyRes.statusCode}`);
    
    // Handle Set-Cookie headers for JWT tokens
    if (proxyRes.headers['set-cookie']) {
      // Modify cookies to be visible in browser dev tools
      const cookies = proxyRes.headers['set-cookie'].map(cookie => {
        // Make sure HttpOnly is not set so cookies are visible in dev tools
        return cookie.replace(/HttpOnly;?\s*/gi, '');
      });
      proxyRes.headers['set-cookie'] = cookies;
    }
    
    // Add CORS headers to response
    res.header('Access-Control-Allow-Credentials', 'true');
  },
  onError: (err, req, res) => {
    console.error(`Proxy Error for ${req.originalUrl}:`, err.message);
    
    if (!res.headersSent) {
      if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        res.status(503).json({
          error: 'Service Temporarily Unavailable',
          message: 'The service is starting up. This may take 1-2 minutes on free hosting. Please try again.',
          code: err.code,
          timestamp: new Date().toISOString(),
          retryAfter: 120
        });
      } else {
        res.status(502).json({
          error: 'Bad Gateway',
          message: 'Unable to connect to the upstream service',
          timestamp: new Date().toISOString()
        });
      }
    }
  }
};

// Service wake-up helper function using native https module
const wakeUpService = async (url) => {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'nginx-proxy-wakeup/1.0' },
      timeout: 10000
    }, (res) => {
      console.log(`Wake-up ping to ${url}: ${res.statusCode}`);
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    
    req.on('error', (error) => {
      console.log(`Wake-up ping failed for ${url}: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`Wake-up ping timeout for ${url}`);
      req.destroy();
      resolve(false);
    });
  });
};

// Service status tracking
const serviceStatus = new Map();

// Service status endpoint (must be before proxy middleware)
app.get('/api/status', (req, res) => {
  const services = [
    { name: 'auth', url: 'https://auth-service-k5aq.onrender.com', path: '/api/auth' },
    { name: 'emotion', url: 'https://emotion-learning-microservice.onrender.com', path: '/api/emotion-service' },
    { name: 'analytics', url: 'https://analytics-service-47zl.onrender.com', path: '/api/logs' },
    { name: 'notification', url: 'https://notification-service-qaxu.onrender.com', path: '/api/send-email' },
    { name: 'video-upload', url: 'https://video-service-w4ir.onrender.com', path: '/api/upload' },
    { name: 'video-api', url: 'https://video-service-w4ir.onrender.com', path: '/api/videos' }
  ];

  const status = services.map(service => {
    const lastCheck = serviceStatus.get(service.name);
    return {
      name: service.name,
      proxyPath: service.path,
      originalUrl: service.url,
      lastChecked: lastCheck ? new Date(lastCheck).toISOString() : 'never',
      estimatedStatus: lastCheck && (Date.now() - lastCheck) < 60000 ? 'awake' : 'possibly sleeping'
    };
  });

  res.json({
    proxy: 'healthy',
    timestamp: new Date().toISOString(),
    services: status,
    note: 'Free tier services may sleep after 15 minutes of inactivity and take 1-2 minutes to wake up'
  });
});

// Middleware to handle sleeping service detection and user notification
app.use(async (req, res, next) => {
  // Skip status endpoint
  if (req.originalUrl === '/api/status') {
    return next();
  }

  const serviceMap = {
    '/api/auth': 'https://auth-service-k5aq.onrender.com',
    '/api/emotion-service': 'https://emotion-learning-microservice.onrender.com',
    '/api/logs': 'https://analytics-service-47zl.onrender.com',
    '/api/send-email': 'https://notification-service-qaxu.onrender.com',
    '/api/upload': 'https://video-service-w4ir.onrender.com',
    '/api/videos': 'https://video-service-w4ir.onrender.com'
  };

  // Check if this is a service request
  for (const [path, serviceUrl] of Object.entries(serviceMap)) {
    if (req.originalUrl.startsWith(path)) {
      const serviceName = path.replace('/api/', '');
      const lastCheck = serviceStatus.get(serviceName);
      const now = Date.now();
      
      // If we haven't checked this service recently, try to wake it up
      if (!lastCheck || (now - lastCheck) > 30000) { // 30 seconds
        console.log(`Attempting to wake up ${serviceName} service`);
        wakeUpService(serviceUrl + '/health').then(isAwake => {
          serviceStatus.set(serviceName, now);
          if (!isAwake) {
            console.log(`${serviceName} service appears to be sleeping`);
          }
        });
      }
      break;
    }
  }
  
  next();
});

// Auth Service Proxy
app.use('/api/auth', createProxyMiddleware({
  ...baseProxyConfig,
  target: 'https://auth-service-k5aq.onrender.com'
}));

// Emotion Detection Service Proxy
app.use('/api/emotion-service', createProxyMiddleware({
  ...baseProxyConfig,
  target: 'https://emotion-learning-microservice.onrender.com'
}));

// Analytics Service Proxy
app.use('/api/logs', createProxyMiddleware({
  ...baseProxyConfig,
  target: 'https://analytics-service-47zl.onrender.com'
}));

// Notification Service Proxy
app.use('/api/send-email', createProxyMiddleware({
  ...baseProxyConfig,
  target: 'https://notification-service-qaxu.onrender.com'
}));

// Video Service Proxy - Upload
app.use('/api/upload', createProxyMiddleware({
  ...baseProxyConfig,
  target: 'https://video-service-w4ir.onrender.com'
}));

// Video Service Proxy - Videos API
app.use('/api/videos', createProxyMiddleware({
  ...baseProxyConfig,
  target: 'https://video-service-w4ir.onrender.com'
}));

// Service status endpoint
app.get('/api/status', (req, res) => {
  const services = [
    { name: 'auth', url: 'https://auth-service-k5aq.onrender.com', path: '/api/auth' },
    { name: 'emotion', url: 'https://emotion-learning-microservice.onrender.com', path: '/api/emotion-service' },
    { name: 'analytics', url: 'https://analytics-service-47zl.onrender.com', path: '/api/logs' },
    { name: 'notification', url: 'https://notification-service-qaxu.onrender.com', path: '/api/send-email' },
    { name: 'video-upload', url: 'https://video-service-w4ir.onrender.com', path: '/api/upload' },
    { name: 'video-api', url: 'https://video-service-w4ir.onrender.com', path: '/api/videos' }
  ];

  const status = services.map(service => {
    const lastCheck = serviceStatus.get(service.name);
    return {
      name: service.name,
      proxyPath: service.path,
      originalUrl: service.url,
      lastChecked: lastCheck ? new Date(lastCheck).toISOString() : 'never',
      estimatedStatus: lastCheck && (Date.now() - lastCheck) < 60000 ? 'awake' : 'possibly sleeping'
    };
  });

  res.json({
    proxy: 'healthy',
    timestamp: new Date().toISOString(),
    services: status,
    note: 'Free tier services may sleep after 15 minutes of inactivity and take 1-2 minutes to wake up'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Nginx Reverse Proxy Server',
    status: 'running',
    services: [
      'Auth Service: /api/auth/*',
      'Emotion Detection: /api/emotion-service/*',
      'Analytics: /api/logs/*',
      'Notification: /api/send-email/*',
      'Video Upload: /api/upload/*',
      'Video API: /api/videos/*'
    ],
    endpoints: {
      health: '/health',
      status: '/api/status'
    },
    note: 'Free tier services may take 1-2 minutes to wake up when sleeping. Use /api/status to check service states.'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested path ${req.originalUrl} was not found on this server`,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Reverse Proxy Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Health check available at: http://localhost:${PORT}/health`);
  console.log('🔧 Configured services:');
  console.log('  - Auth Service: /api/auth/*');
  console.log('  - Emotion Detection: /api/emotion-service/*');
  console.log('  - Analytics: /api/logs/*');
  console.log('  - Notification: /api/send-email/*');
  console.log('  - Video Upload: /api/upload/*');
  console.log('  - Video API: /api/videos/*');
});

module.exports = app;

