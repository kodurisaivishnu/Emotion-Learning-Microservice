#!/usr/bin/env node

/**
 * Health Check Service for API Gateway
 * Monitors all upstream services and provides detailed status
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    port: 8000,
    checkInterval: 30000, // 30 seconds
    timeout: 10000, // 10 seconds
    services: [
        {
            name: 'Authentication Service',
            url: 'https://auth-service-k5aq.onrender.com/api/auth/check',
            type: 'auth'
        },
        {
            name: 'Emotion Detection Service',
            url: 'https://emotion-learning-microservice.onrender.com/health',
            type: 'emotion'
        },
        {
            name: 'Analytics Service',
            url: 'https://analytics-service-47zl.onrender.com/health',
            type: 'analytics'
        },
        {
            name: 'Notification Service',
            url: 'https://notification-service-qaxu.onrender.com/health',
            type: 'notification'
        },
        {
            name: 'Video Service',
            url: 'https://video-service-w4ir.onrender.com/health',
            type: 'video'
        }
    ]
};

// Service status storage
let serviceStatuses = {};
let lastCheck = new Date();

/**
 * Check individual service health
 */
async function checkService(service) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const url = new URL(service.url);
        const client = url.protocol === 'https:' ? https : http;
        
        const req = client.get(service.url, {
            timeout: CONFIG.timeout,
            headers: {
                'User-Agent': 'Health-Check-Service/1.0'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                resolve({
                    name: service.name,
                    type: service.type,
                    status: res.statusCode >= 200 && res.statusCode < 400 ? 'healthy' : 'unhealthy',
                    statusCode: res.statusCode,
                    responseTime,
                    lastCheck: new Date().toISOString(),
                    error: null
                });
            });
        });

        req.on('error', (error) => {
            const responseTime = Date.now() - startTime;
            resolve({
                name: service.name,
                type: service.type,
                status: 'unhealthy',
                statusCode: 0,
                responseTime,
                lastCheck: new Date().toISOString(),
                error: error.message
            });
        });

        req.on('timeout', () => {
            req.destroy();
            const responseTime = Date.now() - startTime;
            resolve({
                name: service.name,
                type: service.type,
                status: 'unhealthy',
                statusCode: 0,
                responseTime,
                lastCheck: new Date().toISOString(),
                error: 'Request timeout'
            });
        });
    });
}

/**
 * Check all services
 */
async function checkAllServices() {
    console.log(`🔍 Checking all services at ${new Date().toISOString()}`);
    
    const checks = CONFIG.services.map(service => checkService(service));
    const results = await Promise.all(checks);
    
    // Update service statuses
    serviceStatuses = {};
    results.forEach(result => {
        serviceStatuses[result.type] = result;
        const statusIcon = result.status === 'healthy' ? '✅' : '❌';
        console.log(`${statusIcon} ${result.name}: ${result.status} (${result.responseTime}ms)`);
    });
    
    lastCheck = new Date();
}

/**
 * Generate health report
 */
function generateHealthReport() {
    const overallHealth = Object.values(serviceStatuses).every(s => s.status === 'healthy');
    const healthyCount = Object.values(serviceStatuses).filter(s => s.status === 'healthy').length;
    const totalCount = Object.values(serviceStatuses).length;
    
    return {
        status: overallHealth ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        lastCheck: lastCheck.toISOString(),
        summary: {
            total: totalCount,
            healthy: healthyCount,
            unhealthy: totalCount - healthyCount
        },
        services: serviceStatuses,
        uptime: process.uptime(),
        version: '1.0.0'
    };
}

/**
 * Create HTTP server
 */
const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    const url = req.url;
    
    if (req.method === 'GET' && url === '/health') {
        // Return health status
        const report = generateHealthReport();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(report, null, 2));
        
    } else if (req.method === 'GET' && url === '/health/detailed') {
        // Return detailed health status
        const report = generateHealthReport();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(report, null, 2));
        
    } else if (req.method === 'GET' && url === '/health/check') {
        // Force a new health check
        checkAllServices().then(() => {
            const report = generateHealthReport();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(report, null, 2));
        }).catch(error => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        });
        
    } else if (req.method === 'GET' && url === '/') {
        // Return simple health page
        const report = generateHealthReport();
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Health Check Service</title>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="30">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .healthy { color: green; }
        .unhealthy { color: red; }
        .service { margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>🏥 Health Check Service</h1>
    <div class="summary">
        <h2>System Status: <span class="${report.status}">${report.status.toUpperCase()}</span></h2>
        <p>Services: ${report.summary.healthy}/${report.summary.total} healthy</p>
        <p>Last Check: ${new Date(report.lastCheck).toLocaleString()}</p>
        <p>Uptime: ${Math.floor(report.uptime)} seconds</p>
    </div>
    <h3>Service Details:</h3>
    ${Object.values(report.services).map(service => `
        <div class="service">
            <h4>${service.name}</h4>
            <p>Status: <span class="${service.status}">${service.status}</span></p>
            <p>Response Time: ${service.responseTime}ms</p>
            <p>Last Check: ${new Date(service.lastCheck).toLocaleString()}</p>
            ${service.error ? `<p>Error: ${service.error}</p>` : ''}
        </div>
    `).join('')}
    <p><em>Auto-refresh every 30 seconds</em></p>
</body>
</html>`;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
        
    } else {
        // 404 Not Found
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

/**
 * Start the health check service
 */
async function start() {
    console.log('🚀 Starting Health Check Service...');
    
    // Initial health check
    await checkAllServices();
    
    // Set up periodic health checks
    setInterval(checkAllServices, CONFIG.checkInterval);
    
    // Start HTTP server
    server.listen(CONFIG.port, '0.0.0.0', () => {
        console.log(`✅ Health Check Service running on http://0.0.0.0:${CONFIG.port}`);
        console.log(`📊 Monitoring ${CONFIG.services.length} services`);
        console.log(`🔄 Check interval: ${CONFIG.checkInterval / 1000} seconds`);
    });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Health Check Service...');
    server.close(() => {
        console.log('✅ Health Check Service stopped');
        process.exit(0);
    });
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the service
start().catch(error => {
    console.error('❌ Failed to start Health Check Service:', error);
    process.exit(1);
});
