# Emotoin-Learning-Microservice

# 🔐 Auth Service – Emotion Learning Platform

This is the authentication microservice for the Emotion Learning Platform. It handles user registration, login, logout, and role/email updates using JWT and cookies.

## 🚀 Features

- User Registration
- Secure Login with JWT
- Cookie-based Authentication
- Logout Functionality
- Update User Email and Role
- Middleware-based Route Protection

## 🌐 Base URL

https://auth-service-k5aq.onrender.com/api/auth


## 📦 API Endpoints

| Method | Endpoint     | Description                  |
|--------|--------------|------------------------------|
| POST   | `/register`  | Register new user            |
| POST   | `/login`     | Login and receive JWT cookie |
| POST   | `/logout`    | Logout and clear cookie      |
| GET    | `/check`     | Check authentication status  |
| PUT    | `/update`    | Update email or role         |

## 🛠️ Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs
- cookie-parser
- dotenv

## 📄 License

MIT

---

> Part of the Emotion Learning Microservice Architecture.
