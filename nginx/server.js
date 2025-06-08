// const express = require("express")
// const cors = require("cors")
// const multer = require("multer")
// const FormData = require("form-data")
// const path = require("path")

// const app = express()
// const PORT = process.env.PORT || 3000

// // Configure multer for handling multipart/form-data
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 50 * 1024 * 1024, // 50MB limit
//   },
// })

// // Middleware
// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
//     credentials: true,
//   }),
// )

// // Don't use express.json() globally - handle it per route
// app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// // Security headers
// app.use((req, res, next) => {
//   res.setHeader("X-Content-Type-Options", "nosniff")
//   res.setHeader("X-Frame-Options", "DENY")
//   res.setHeader("X-XSS-Protection", "1; mode=block")
//   res.removeHeader("X-Powered-By")
//   next()
// })

// // Rate limiting store
// const rateLimitStore = {}
// const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
// const MAX_REQUESTS = 100

// // Rate limiting middleware
// app.use((req, res, next) => {
//   const clientId = req.ip || req.connection.remoteAddress || "unknown"
//   const now = Date.now()

//   // Clean expired entries
//   Object.keys(rateLimitStore).forEach((key) => {
//     if (rateLimitStore[key].resetTime < now) {
//       delete rateLimitStore[key]
//     }
//   })

//   if (!rateLimitStore[clientId]) {
//     rateLimitStore[clientId] = { count: 1, resetTime: now + RATE_LIMIT_WINDOW }
//   } else {
//     rateLimitStore[clientId].count++
//   }

//   if (rateLimitStore[clientId].count > MAX_REQUESTS) {
//     return res.status(429).json({
//       error: "Too many requests",
//       message: `Rate limit exceeded. Maximum ${MAX_REQUESTS} requests per 15 minutes.`,
//     })
//   }

//   next()
// })

// // Microservice URLs
// const SERVICES = {
//   auth: process.env.AUTH_SERVICE_URL || "https://auth-service-k5aq.onrender.com",
//   emotion: process.env.EMOTION_SERVICE_URL || "https://emotion-learning-microservice.onrender.com",
//   analytics: process.env.ANALYTICS_SERVICE_URL || "https://analytics-service-47zl.onrender.com",
//   notification: process.env.NOTIFICATION_SERVICE_URL || "https://notification-service-qaxu.onrender.com",
//   video: process.env.VIDEO_SERVICE_URL || "https://video-service-w4ir.onrender.com",
// }

// // Logging storage
// const proxyLogs = []

// // Enhanced proxy function with better debugging
// async function proxyRequest(req, res, targetUrl, serviceName, files = null) {
//   const startTime = Date.now()

//   try {
//     console.log(`\n=== PROXY REQUEST DEBUG ===`)
//     console.log(`Service: ${serviceName}`)
//     console.log(`Method: ${req.method}`)
//     console.log(`Target URL: ${targetUrl}`)
//     console.log(`Original Content-Type: ${req.headers["content-type"]}`)
//     console.log(`Files received:`, files ? files.length : 0)

//     if (files && files.length > 0) {
//       files.forEach((file, index) => {
//         console.log(`File ${index}:`, {
//           fieldname: file.fieldname,
//           originalname: file.originalname,
//           mimetype: file.mimetype,
//           size: file.size,
//         })
//       })
//     }

//     console.log(`Body keys:`, Object.keys(req.body))
//     console.log(`Body:`, req.body)

//     const headers = {
//       "User-Agent": "Nginx-Proxy-Server/1.0",
//     }

//     // Copy important headers
//     if (req.headers.authorization) {
//       headers.Authorization = req.headers.authorization
//     }
//     if (req.headers.cookie) {
//       headers.Cookie = req.headers.cookie
//     }

//     const fetchOptions = {
//       method: req.method,
//       headers,
//       signal: AbortSignal.timeout(60000), // 60 seconds timeout
//     }

//     // Handle different content types
//     if (req.method !== "GET" && req.method !== "HEAD") {
//       if (files && files.length > 0) {
//         // Handle multipart/form-data
//         const formData = new FormData()

//         // Add files first
//         files.forEach((file) => {
//           console.log(`Adding file to FormData: ${file.fieldname} -> ${file.originalname}`)
//           formData.append(file.fieldname, file.buffer, {
//             filename: file.originalname,
//             contentType: file.mimetype,
//           })
//         })

//         // Add other form fields
//         Object.keys(req.body).forEach((key) => {
//           if (req.body[key] !== undefined && req.body[key] !== null) {
//             console.log(`Adding form field: ${key} -> ${req.body[key]}`)
//             formData.append(key, req.body[key])
//           }
//         })

//         fetchOptions.body = formData
//         console.log(`FormData created with headers:`, formData.getHeaders())

//         // Let FormData set the Content-Type with boundary
//         // Don't manually set Content-Type for multipart data
//       } else if (req.headers["content-type"]?.includes("application/json")) {
//         // Handle JSON data
//         headers["Content-Type"] = "application/json"
//         fetchOptions.body = JSON.stringify(req.body)
//         console.log(`Using JSON body:`, req.body)
//       } else {
//         // Handle other content types
//         headers["Content-Type"] = req.headers["content-type"] || "application/json"
//         fetchOptions.body = JSON.stringify(req.body)
//         console.log(`Using default JSON body:`, req.body)
//       }
//     }

//     console.log(`Final headers being sent:`, headers)
//     console.log(`Sending request...`)

//     const response = await fetch(targetUrl, fetchOptions)
//     const responseTime = Date.now() - startTime

//     console.log(`Response received:`)
//     console.log(`Status: ${response.status}`)
//     console.log(`Response Time: ${responseTime}ms`)
//     console.log(`Response Headers:`, Object.fromEntries(response.headers.entries()))

//     // Log the request
//     proxyLogs.unshift({
//       id: Date.now(),
//       method: req.method,
//       path: req.path,
//       targetService: serviceName,
//       statusCode: response.status,
//       responseTime,
//       timestamp: new Date().toISOString(),
//       filesCount: files ? files.length : 0,
//     })

//     // Keep only last 100 logs
//     if (proxyLogs.length > 100) {
//       proxyLogs.splice(100)
//     }

//     res.status(response.status)

//     const contentType = response.headers.get("content-type")
//     if (contentType?.includes("application/json")) {
//       const data = await response.json()
//       console.log(`Response JSON:`, data)
//       res.json(data)
//     } else {
//       const text = await response.text()
//       console.log(`Response Text:`, text.substring(0, 200))
//       res.send(text)
//     }

//     console.log(`=== END PROXY REQUEST ===\n`)
//   } catch (error) {
//     const responseTime = Date.now() - startTime
//     console.error(`\n=== PROXY ERROR ===`)
//     console.error(`Service: ${serviceName}`)
//     console.error(`Error after ${responseTime}ms:`, error.message)
//     console.error(`Error name:`, error.name)
//     console.error(`Error stack:`, error.stack)
//     console.error(`=== END PROXY ERROR ===\n`)

//     proxyLogs.unshift({
//       id: Date.now(),
//       method: req.method,
//       path: req.path,
//       targetService: serviceName,
//       statusCode: error.name === "TimeoutError" || error.name === "AbortError" ? 504 : 502,
//       responseTime,
//       timestamp: new Date().toISOString(),
//       error: error.message,
//     })

//     if (error.name === "TimeoutError" || error.name === "AbortError") {
//       res.status(504).json({
//         error: "Gateway Timeout",
//         message: `The ${serviceName} service took too long to respond (>60s)`,
//         details: error.message,
//       })
//     } else {
//       res.status(502).json({
//         error: "Bad Gateway",
//         message: `Failed to connect to ${serviceName} service`,
//         details: error.message,
//       })
//     }
//   }
// }

// // Health check
// app.get("/api/health", (req, res) => {
//   res.json({
//     status: "healthy",
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     services: [
//       { name: "Authentication Service", status: "online", responseTime: 245 },
//       { name: "Emotion Detection Service", status: "online", responseTime: 1200 },
//       { name: "Analytics Service", status: "online", responseTime: 180 },
//       { name: "Notification Service", status: "online", responseTime: 320 },
//       { name: "Video Service", status: "online", responseTime: 580 },
//     ],
//     recentRequests: proxyLogs.length,
//   })
// })

// // Services info
// app.get("/api/services", (req, res) => {
//   res.json([
//     {
//       id: 1,
//       name: "Authentication Service",
//       baseUrl: SERVICES.auth,
//       status: "online",
//       responseTime: 245,
//       lastChecked: new Date().toISOString(),
//       endpoints: 5,
//     },
//     {
//       id: 2,
//       name: "Emotion Detection Service",
//       baseUrl: SERVICES.emotion,
//       status: "online",
//       responseTime: 1200,
//       lastChecked: new Date().toISOString(),
//       endpoints: 1,
//     },
//     {
//       id: 3,
//       name: "Analytics Service",
//       baseUrl: SERVICES.analytics,
//       status: "online",
//       responseTime: 180,
//       lastChecked: new Date().toISOString(),
//       endpoints: 1,
//     },
//     {
//       id: 4,
//       name: "Notification Service",
//       baseUrl: SERVICES.notification,
//       status: "online",
//       responseTime: 320,
//       lastChecked: new Date().toISOString(),
//       endpoints: 1,
//     },
//     {
//       id: 5,
//       name: "Video Service",
//       baseUrl: SERVICES.video,
//       status: "online",
//       responseTime: 580,
//       lastChecked: new Date().toISOString(),
//       endpoints: 4,
//     },
//   ])
// })

// // Logs endpoint
// app.get("/api/logs", (req, res) => {
//   const limit = Number.parseInt(req.query.limit) || 100
//   res.json(proxyLogs.slice(0, limit))
// })

// // Debug endpoint to test file uploads
// app.post("/api/debug-upload", upload.any(), (req, res) => {
//   console.log("\n=== DEBUG UPLOAD ===")
//   console.log("Files:", req.files)
//   console.log("Body:", req.body)
//   console.log("Headers:", req.headers)
//   console.log("=== END DEBUG ===\n")

//   res.json({
//     message: "Debug upload endpoint",
//     filesReceived: req.files ? req.files.length : 0,
//     files: req.files,
//     body: req.body,
//     headers: req.headers,
//   })
// })

// // Auth Service Proxy (JSON only)
// app.all("/api/auth/*", express.json({ limit: "50mb" }), async (req, res) => {
//   const targetUrl = `${SERVICES.auth}${req.path}${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`
//   await proxyRequest(req, res, targetUrl, "auth")
// })

// // Emotion Detection Service Proxy (handles both JSON and form-data)
// app.all("/api/emotion-service*", upload.any(), async (req, res) => {
//   console.log(`\n=== EMOTION SERVICE REQUEST ===`)
//   console.log(`Full URL: ${req.url}`)
//   console.log(`Path: ${req.path}`)
//   console.log(`Method: ${req.method}`)
//   console.log(`Content-Type: ${req.headers["content-type"]}`)
//   console.log(`Files: ${req.files ? req.files.length : 0}`)
//   console.log(`Body: ${JSON.stringify(req.body)}`)

//   const targetUrl = `${SERVICES.emotion}${req.path}${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`
//   console.log(`Target URL: ${targetUrl}`)
//   console.log(`=== END EMOTION SERVICE REQUEST ===\n`)

//   await proxyRequest(req, res, targetUrl, "emotion", req.files)
// })

// // Analytics Service Proxy (JSON only)
// app.all("/api/logs/*", express.json({ limit: "50mb" }), async (req, res) => {
//   const targetUrl = `${SERVICES.analytics}${req.path}${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`
//   await proxyRequest(req, res, targetUrl, "analytics")
// })

// // Notification Service Proxy (JSON only)
// app.all("/api/send-email", express.json({ limit: "50mb" }), async (req, res) => {
//   const targetUrl = `${SERVICES.notification}${req.path}${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`
//   await proxyRequest(req, res, targetUrl, "notification")
// })

// // Video Service Proxies (handles form-data for uploads)
// app.all("/api/upload", upload.any(), async (req, res) => {
//   const targetUrl = `${SERVICES.video}${req.path}${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`
//   await proxyRequest(req, res, targetUrl, "video", req.files)
// })

// app.all("/api/videos/*", express.json({ limit: "50mb" }), async (req, res) => {
//   const targetUrl = `${SERVICES.video}${req.path}${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`
//   await proxyRequest(req, res, targetUrl, "video")
// })

// // Catch-all for unknown routes
// app.all("/api/*", (req, res) => {
//   res.status(404).json({
//     error: "API endpoint not found",
//     path: req.path,
//     availableServices: [
//       "/api/auth/*",
//       "/api/emotion-service",
//       "/api/logs/*",
//       "/api/send-email",
//       "/api/upload",
//       "/api/videos/*",
//     ],
//   })
// })

// // Root endpoint for basic info
// app.get("/", (req, res) => {
//   res.json({
//     name: "Nginx Microservices Proxy",
//     version: "1.0.0",
//     status: "running",
//     endpoints: {
//       health: "/api/health",
//       services: "/api/services",
//       logs: "/api/logs",
//       debug: "/api/debug-upload",
//     },
//     microservices: [
//       "/api/auth/*",
//       "/api/emotion-service",
//       "/api/logs/*",
//       "/api/send-email",
//       "/api/upload",
//       "/api/videos/*",
//     ],
//   })
// })

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 Nginx Proxy Server running on port ${PORT}`)
//   console.log(`📍 Health check: http://localhost:${PORT}/api/health`)
//   console.log(`📍 Debug upload: http://localhost:${PORT}/api/debug-upload`)
// })


// const express = require("express")
// const cors = require("cors")
// const multer = require("multer")
// const FormData = require("form-data")
// const path = require("path")

// const app = express()
// const PORT = process.env.PORT || 3000

// // Configure multer for handling multipart/form-data
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 50 * 1024 * 1024, // 50MB limit
//   },
// })

// // Middleware
// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
//     credentials: true,
//   }),
// )

// // Don't use express.json() globally - handle it per route
// app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// // Security headers
// app.use((req, res, next) => {
//   res.setHeader("X-Content-Type-Options", "nosniff")
//   res.setHeader("X-Frame-Options", "DENY")
//   res.setHeader("X-XSS-Protection", "1; mode=block")
//   res.removeHeader("X-Powered-By")
//   next()
// })

// // Rate limiting store
// const rateLimitStore = {}
// const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
// const MAX_REQUESTS = 100

// // Rate limiting middleware
// app.use((req, res, next) => {
//   const clientId = req.ip || req.connection.remoteAddress || "unknown"
//   const now = Date.now()

//   // Clean expired entries
//   Object.keys(rateLimitStore).forEach((key) => {
//     if (rateLimitStore[key].resetTime < now) {
//       delete rateLimitStore[key]
//     }
//   })

//   if (!rateLimitStore[clientId]) {
//     rateLimitStore[clientId] = { count: 1, resetTime: now + RATE_LIMIT_WINDOW }
//   } else {
//     rateLimitStore[clientId].count++
//   }

//   if (rateLimitStore[clientId].count > MAX_REQUESTS) {
//     return res.status(429).json({
//       error: "Too many requests",
//       message: `Rate limit exceeded. Maximum ${MAX_REQUESTS} requests per 15 minutes.`,
//     })
//   }

//   next()
// })

// // Microservice URLs
// const SERVICES = {
//   auth: process.env.AUTH_SERVICE_URL || "https://auth-service-k5aq.onrender.com",
//   emotion: process.env.EMOTION_SERVICE_URL || "https://emotion-learning-microservice.onrender.com",
//   analytics: process.env.ANALYTICS_SERVICE_URL || "https://analytics-service-47zl.onrender.com",
//   notification: process.env.NOTIFICATION_SERVICE_URL || "https://notification-service-qaxu.onrender.com",
//   video: process.env.VIDEO_SERVICE_URL || "https://video-service-w4ir.onrender.com",
// }

// // Logging storage
// const proxyLogs = []

// // Enhanced proxy function with better debugging
// async function proxyRequest(req, res, targetUrl, serviceName, files = null) {
//   const startTime = Date.now()

//   try {
//     console.log(`\n=== PROXY REQUEST DEBUG ===`)
//     console.log(`Service: ${serviceName}`)
//     console.log(`Method: ${req.method}`)
//     console.log(`Target URL: ${targetUrl}`)
//     console.log(`Original Content-Type: ${req.headers["content-type"]}`)
//     console.log(`Files received:`, files ? files.length : 0)

//     if (files && files.length > 0) {
//       files.forEach((file, index) => {
//         console.log(`File ${index}:`, {
//           fieldname: file.fieldname,
//           originalname: file.originalname,
//           mimetype: file.mimetype,
//           size: file.size,
//         })
//       })
//     }

//     console.log(`Body keys:`, Object.keys(req.body))
//     console.log(`Body:`, req.body)

//     const headers = {
//       "User-Agent": "Nginx-Proxy-Server/1.0",
//     }

//     // Copy important headers
//     if (req.headers.authorization) {
//       headers.Authorization = req.headers.authorization
//     }
//     if (req.headers.cookie) {
//       headers.Cookie = req.headers.cookie
//     }

//     const fetchOptions = {
//       method: req.method,
//       headers,
//       signal: AbortSignal.timeout(60000), // 60 seconds timeout
//     }

//     // Handle different content types
//     if (req.method !== "GET" && req.method !== "HEAD") {
//       if (files && files.length > 0) {
//         // Handle multipart/form-data
//         const formData = new FormData()

//         // Add files first
//         files.forEach((file) => {
//           console.log(`Adding file to FormData: ${file.fieldname} -> ${file.originalname}`)
//           formData.append(file.fieldname, file.buffer, {
//             filename: file.originalname,
//             contentType: file.mimetype,
//           })
//         })

//         // Add other form fields
//         Object.keys(req.body).forEach((key) => {
//           if (req.body[key] !== undefined && req.body[key] !== null) {
//             console.log(`Adding form field: ${key} -> ${req.body[key]}`)
//             formData.append(key, req.body[key])
//           }
//         })

//         fetchOptions.body = formData
//         console.log(`FormData created with headers:`, formData.getHeaders())

//         // Let FormData set the Content-Type with boundary
//         // Don't manually set Content-Type for multipart data
//       } else if (req.headers["content-type"]?.includes("application/json")) {
//         // Handle JSON data
//         headers["Content-Type"] = "application/json"
//         fetchOptions.body = JSON.stringify(req.body)
//         console.log(`Using JSON body:`, req.body)
//       } else {
//         // Handle other content types
//         headers["Content-Type"] = req.headers["content-type"] || "application/json"
//         fetchOptions.body = JSON.stringify(req.body)
//         console.log(`Using default JSON body:`, req.body)
//       }
//     }

//     console.log(`Final headers being sent:`, headers)
//     console.log(`Sending request...`)

//     const response = await fetch(targetUrl, fetchOptions)
//     const responseTime = Date.now() - startTime

//     console.log(`Response received:`)
//     console.log(`Status: ${response.status}`)
//     console.log(`Response Time: ${responseTime}ms`)
//     console.log(`Response Headers:`, Object.fromEntries(response.headers.entries()))

//     // Log the request
//     proxyLogs.unshift({
//       id: Date.now(),
//       method: req.method,
//       path: req.path,
//       targetService: serviceName,
//       statusCode: response.status,
//       responseTime,
//       timestamp: new Date().toISOString(),
//       filesCount: files ? files.length : 0,
//     })

//     // Keep only last 100 logs
//     if (proxyLogs.length > 100) {
//       proxyLogs.splice(100)
//     }

//     res.status(response.status)

//     const contentType = response.headers.get("content-type")
//     if (contentType?.includes("application/json")) {
//       const data = await response.json()
//       console.log(`Response JSON:`, data)
//       res.json(data)
//     } else {
//       const text = await response.text()
//       console.log(`Response Text:`, text.substring(0, 200))
//       res.send(text)
//     }

//     console.log(`=== END PROXY REQUEST ===\n`)
//   } catch (error) {
//     const responseTime = Date.now() - startTime
//     console.error(`\n=== PROXY ERROR ===`)
//     console.error(`Service: ${serviceName}`)
//     console.error(`Error after ${responseTime}ms:`, error.message)
//     console.error(`Error name:`, error.name)
//     console.error(`Error stack:`, error.stack)
//     console.error(`=== END PROXY ERROR ===\n`)

//     proxyLogs.unshift({
//       id: Date.now(),
//       method: req.method,
//       path: req.path,
//       targetService: serviceName,
//       statusCode: error.name === "TimeoutError" || error.name === "AbortError" ? 504 : 502,
//       responseTime,
//       timestamp: new Date().toISOString(),
//       error: error.message,
//     })

//     if (error.name === "TimeoutError" || error.name === "AbortError") {
//       res.status(504).json({
//         error: "Gateway Timeout",
//         message: `The ${serviceName} service took too long to respond (>60s)`,
//         details: error.message,
//       })
//     } else {
//       res.status(502).json({
//         error: "Bad Gateway",
//         message: `Failed to connect to ${serviceName} service`,
//         details: error.message,
//       })
//     }
//   }
// }

// // Health check
// app.get("/api/health", (req, res) => {
//   res.json({
//     status: "healthy",
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     services: [
//       { name: "Authentication Service", status: "online", responseTime: 245 },
//       { name: "Emotion Detection Service", status: "online", responseTime: 1200 },
//       { name: "Analytics Service", status: "online", responseTime: 180 },
//       { name: "Notification Service", status: "online", responseTime: 320 },
//       { name: "Video Service", status: "online", responseTime: 580 },
//     ],
//     recentRequests: proxyLogs.length,
//   })
// })

// // Services info
// app.get("/api/services", (req, res) => {
//   res.json([
//     {
//       id: 1,
//       name: "Authentication Service",
//       baseUrl: SERVICES.auth,
//       status: "online",
//       responseTime: 245,
//       lastChecked: new Date().toISOString(),
//       endpoints: 5,
//     },
//     {
//       id: 2,
//       name: "Emotion Detection Service",
//       baseUrl: SERVICES.emotion,
//       status: "online",
//       responseTime: 1200,
//       lastChecked: new Date().toISOString(),
//       endpoints: 1,
//     },
//     {
//       id: 3,
//       name: "Analytics Service",
//       baseUrl: SERVICES.analytics,
//       status: "online",
//       responseTime: 180,
//       lastChecked: new Date().toISOString(),
//       endpoints: 1,
//     },
//     {
//       id: 4,
//       name: "Notification Service",
//       baseUrl: SERVICES.notification,
//       status: "online",
//       responseTime: 320,
//       lastChecked: new Date().toISOString(),
//       endpoints: 1,
//     },
//     {
//       id: 5,
//       name: "Video Service",
//       baseUrl: SERVICES.video,
//       status: "online",
//       responseTime: 580,
//       lastChecked: new Date().toISOString(),
//       endpoints: 4,
//     },
//   ])
// })

// // Logs endpoint
// app.get("/api/logs", (req, res) => {
//   const limit = Number.parseInt(req.query.limit) || 100
//   res.json(proxyLogs.slice(0, limit))
// })

// // Debug endpoint to test file uploads
// app.post("/api/debug-upload", upload.any(), (req, res) => {
//   console.log("\n=== DEBUG UPLOAD ===")
//   console.log("Files:", req.files)
//   console.log("Body:", req.body)
//   console.log("Headers:", req.headers)
//   console.log("=== END DEBUG ===\n")

//   res.json({
//     message: "Debug upload endpoint",
//     filesReceived: req.files ? req.files.length : 0,
//     files: req.files,
//     body: req.body,
//     headers: req.headers,
//   })
// })

// // Auth Service Proxy (JSON only)
// app.all("/api/auth/*", express.json({ limit: "50mb" }), async (req, res) => {
//   const targetUrl = `${SERVICES.auth}${req.path}${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`
//   await proxyRequest(req, res, targetUrl, "auth")
// })

// // Emotion Detection Service Proxy (handles both JSON and form-data)
// app.all("/api/emotion-service*", upload.any(), async (req, res) => {
//   console.log(`\n=== EMOTION SERVICE REQUEST ===`)
//   console.log(`Full URL: ${req.url}`)
//   console.log(`Path: ${req.path}`)
//   console.log(`Method: ${req.method}`)
//   console.log(`Content-Type: ${req.headers["content-type"]}`)
//   console.log(`Files: ${req.files ? req.files.length : 0}`)
//   console.log(`Body: ${JSON.stringify(req.body)}`)

//   const targetUrl = `${SERVICES.emotion}${req.path}${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`
//   console.log(`Target URL: ${targetUrl}`)
//   console.log(`=== END EMOTION SERVICE REQUEST ===\n`)

//   await proxyRequest(req, res, targetUrl, "emotion", req.files)
// })

// // Analytics Service Proxy (JSON only)
// app.all("/api/logs/*", express.json({ limit: "50mb" }), async (req, res) => {
//   const targetUrl = `${SERVICES.analytics}${req.path}${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`
//   await proxyRequest(req, res, targetUrl, "analytics")
// })

// // Notification Service Proxy (JSON only)
// app.all("/api/send-email", express.json({ limit: "50mb" }), async (req, res) => {
//   const targetUrl = `${SERVICES.notification}${req.path}${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`
//   await proxyRequest(req, res, targetUrl, "notification")
// })

// // Video Service Proxies (handles form-data for uploads)
// app.all("/api/upload", upload.any(), async (req, res) => {
//   const targetUrl = `${SERVICES.video}${req.path}${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`
//   await proxyRequest(req, res, targetUrl, "video", req.files)
// })

// app.all("/api/videos/*", express.json({ limit: "50mb" }), async (req, res) => {
//   const targetUrl = `${SERVICES.video}${req.path}${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`
//   await proxyRequest(req, res, targetUrl, "video")
// })

// // Catch-all for unknown routes
// app.all("/api/*", (req, res) => {
//   res.status(404).json({
//     error: "API endpoint not found",
//     path: req.path,
//     availableServices: [
//       "/api/auth/*",
//       "/api/emotion-service",
//       "/api/logs/*",
//       "/api/send-email",
//       "/api/upload",
//       "/api/videos/*",
//     ],
//   })
// })

// // Root endpoint for basic info
// app.get("/", (req, res) => {
//   res.json({
//     name: "Nginx Microservices Proxy",
//     version: "1.0.0",
//     status: "running",
//     endpoints: {
//       health: "/api/health",
//       services: "/api/services",
//       logs: "/api/logs",
//       debug: "/api/debug-upload",
//     },
//     microservices: [
//       "/api/auth/*",
//       "/api/emotion-service",
//       "/api/logs/*",
//       "/api/send-email",
//       "/api/upload",
//       "/api/videos/*",
//     ],
//   })
// })

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 Nginx Proxy Server running on port ${PORT}`)
//   console.log(`📍 Health check: http://localhost:${PORT}/api/health`)
//   console.log(`📍 Debug upload: http://localhost:${PORT}/api/debug-upload`)
// })



const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');
const compression = require('compression');

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

// Base proxy configuration
const baseProxyConfig = {
  changeOrigin: true,
  timeout: 240000,
  proxyTimeout: 240000,
  secure: true,
  followRedirects: true,
  onProxyReq: (proxyReq, req, res) => {
    // Preserve original headers
    proxyReq.setHeader('X-Real-IP', req.ip || req.connection.remoteAddress);
    proxyReq.setHeader('X-Forwarded-For', req.ip || req.connection.remoteAddress);
    proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
    proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
    
    // Handle cookies properly for JWT
    if (req.headers.cookie) {
      proxyReq.setHeader('Cookie', req.headers.cookie);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
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
  }
};

// Auth Service Proxy
app.use('/api/auth', createProxyMiddleware({
  ...baseProxyConfig,
  target: 'https://auth-service-k5aq.onrender.com',
  onError: (err, req, res) => {
    console.error('Auth Proxy Error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Auth service unavailable' });
    }
  }
}));

// Emotion Detection Service Proxy
app.use('/api/emotion-service', createProxyMiddleware({
  ...baseProxyConfig,
  target: 'https://emotion-learning-microservice.onrender.com',
  onError: (err, req, res) => {
    console.error('Emotion Proxy Error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Emotion service unavailable' });
    }
  }
}));

// Analytics Service Proxy
app.use('/api/logs', createProxyMiddleware({
  ...baseProxyConfig,
  target: 'https://analytics-service-47zl.onrender.com',
  onError: (err, req, res) => {
    console.error('Analytics Proxy Error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Analytics service unavailable' });
    }
  }
}));

// Notification Service Proxy
app.use('/api/send-email', createProxyMiddleware({
  ...baseProxyConfig,
  target: 'https://notification-service-qaxu.onrender.com',
  onError: (err, req, res) => {
    console.error('Email Proxy Error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Email service unavailable' });
    }
  }
}));

// Video Service Proxy - Upload
app.use('/api/upload', createProxyMiddleware({
  ...baseProxyConfig,
  target: 'https://video-service-w4ir.onrender.com',
  onError: (err, req, res) => {
    console.error('Upload Proxy Error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Upload service unavailable' });
    }
  }
}));

// Video Service Proxy - Videos API
app.use('/api/videos', createProxyMiddleware({
  ...baseProxyConfig,
  target: 'https://video-service-w4ir.onrender.com',
  onError: (err, req, res) => {
    console.error('Videos Proxy Error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Videos service unavailable' });
    }
  }
}));

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
    health: '/health'
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
