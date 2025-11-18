# 🎫 Helpdesk System - Backend

RESTful API built with Node.js, Express, and MongoDB for internal IT/HR ticket management.

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Role-Based Access Control** - Admin, Agent, User roles
- ✅ **Auto-Assignment** - Round-robin ticket assignment to agents
- ✅ **SLA Management** - Automatic SLA calculation based on priority
- ✅ **Email Notifications** - Nodemailer integration for ticket updates
- ✅ **Analytics Dashboard** - Performance KPIs and statistics
- ✅ **CORS Enabled** - Frontend-backend communication configured
- ✅ **MongoDB Integration** - Mongoose ODM with validation

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (v14+)
- **Framework:** Express.js (v4.18.2)
- **Database:** MongoDB (v7.5.0)
- **ODM:** Mongoose
- **Authentication:** JWT (jsonwebtoken v9.0.2)
- **Password Hashing:** bcryptjs (v2.4.3)
- **Email:** Nodemailer (v6.9.4)
- **CORS:** cors (v2.8.5)
- **Environment:** dotenv (v16.3.1)

---

## 📦 Prerequisites

Before running the backend, ensure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local or Atlas) - [Download](https://www.mongodb.com/try/download/community)
- **Gmail Account** (for email notifications)
- **npm** or **yarn** package manager

---

## 🚀 Installation

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd helpdesk-system/backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- nodemailer
- cors
- dotenv
- nodemon (dev dependency)

---

## ⚙️ Configuration

### Step 1: Create Environment File
Create a `.env` file in the backend root directory:

```bash
touch .env
```

### Step 2: Add Environment Variables
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/helpdesk

# JWT Secret (Change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### Step 3: Gmail App Password Setup
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification → Enable
3. Security → App passwords → Generate new password
4. Copy the 16-character password
5. Paste in `.env` as `EMAIL_PASS`

---

## 🗄️ Database Setup

### Option 1: Local MongoDB

**Install MongoDB:**
```bash
# macOS (using Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt install mongodb
sudo systemctl start mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
```

**Verify MongoDB is running:**
```bash
mongosh
# Should connect successfully
```

### Option 2: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster
4. Get connection string
5. Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/helpdesk
```

---

## ▶️ Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Seed Database (First Time)
```bash
npm run seed
```

**Expected Output:**
```
✅ MongoDB Connected
🗑️  Cleared existing data
✅ Users created: 6
✅ Sample tickets created: 5

📊 Seed Data Summary:
====================
Total Users: 6
  - Admins: 1
  - Agents: 3
  - Users: 2

Total Tickets: 5
  - Open: 2
  - In Progress: 2
  - Resolved: 1

🔐 Login Credentials:
====================
Admin: admin@company.com / admin123
Agent (IT): agent1@company.com / agent123
Agent (HR): agent2@company.com / agent123
User: user@company.com / user123
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login user | ❌ |
| GET | `/auth/me` | Get current user | ✅ |

### Ticket Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/tickets` | Create ticket | ✅ | User |
| GET | `/tickets` | Get all tickets | ✅ | All |
| GET | `/tickets/:id` | Get ticket by ID | ✅ | All |
| PUT | `/tickets/:id/status` | Update status | ✅ | Agent/Admin |
| POST | `/tickets/:id/comments` | Add comment | ✅ | All |
| DELETE | `/tickets/:id` | Delete ticket | ✅ | Admin |

### User Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/users` | Get all users | ✅ | Admin |
| GET | `/users/agents` | Get all agents | ✅ | Admin |
| PUT | `/users/agents/:id/availability` | Update availability | ✅ | Agent/Admin |

### Analytics Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/analytics/dashboard` | Get dashboard KPIs | ✅ | Admin |
| GET | `/analytics/agents` | Get agent statistics | ✅ | Admin |
| GET | `/analytics/trends` | Get ticket trends | ✅ | Admin |

---

## 📊 Database Schema

### User Model
```javascript
{
  name: String,           // Full name
  email: String,          // Unique email
  password: String,       // Hashed password
  role: String,           // 'user', 'agent', 'admin'
  department: String,     // 'IT', 'HR', 'General'
  isAvailable: Boolean,   // Agent availability
  assignedTickets: Number // Current ticket count
}
```

### Ticket Model
```javascript
{
  ticketId: String,       // Auto-generated (TKT-00001)
  title: String,
  description: String,
  priority: String,       // 'Low', 'Medium', 'High', 'Critical'
  status: String,         // 'Open', 'In Progress', 'Resolved', 'Closed'
  category: String,       // 'IT', 'HR', 'General'
  sla: {
    hours: Number,        // Auto-calculated
    dueDate: Date         // Auto-calculated
  },
  createdBy: ObjectId,    // User reference
  assignedTo: ObjectId,   // Agent reference
  assignedAt: Date,
  resolvedAt: Date,
  comments: [{
    user: ObjectId,
    text: String,
    createdAt: Date
  }]
}
```

---

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | ✅ | `mongodb://localhost:27017/helpdesk` |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ | - |
| `PORT` | Server port | ❌ | `5000` |
| `EMAIL_USER` | Gmail address | ✅ | - |
| `EMAIL_PASS` | Gmail app password | ✅ | - |
| `CLIENT_URL` | Frontend URL for CORS | ❌ | `http://localhost:3000` |

---

## 🧪 Testing

### Test with Postman/Thunder Client

**1. Register User:**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@company.com",
  "password": "test123",
  "role": "user",
  "department": "IT"
}
```

**2. Login:**
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "admin123"
}
```

**3. Create Ticket (with token):**
```bash
POST http://localhost:5000/api/tickets
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Cannot access email",
  "description": "Getting authentication error",
  "priority": "High",
  "category": "IT"
}
```

### Test Email Functionality
```bash
# Create test-email.js in backend folder
node test-email.js
```

---

## 🐛 Troubleshooting

### Issue: MongoDB Connection Failed

**Error:**
```
❌ MongoDB Connection Error: connect ECONNREFUSED
```

**Solutions:**
1. Check if MongoDB is running:
   ```bash
   # macOS/Linux
   sudo systemctl status mongodb
   
   # Check connection
   mongosh
   ```
2. Verify `MONGODB_URI` in `.env`
3. Check firewall settings
4. Try MongoDB Atlas if local fails

---

### Issue: Email Not Sending

**Error:**
```
Email send error: Invalid login
```

**Solutions:**
1. Use Gmail App Password (not regular password)
2. Enable 2-Step Verification
3. Check `EMAIL_USER` and `EMAIL_PASS` in `.env`
4. Try different email service (SendGrid, Mailgun)

---

### Issue: JWT Token Invalid

**Error:**
```
401 Unauthorized: Not authorized, token failed
```

**Solutions:**
1. Check if token is being sent in headers
2. Verify `JWT_SECRET` matches in `.env`
3. Token might be expired (login again)
4. Check `Authorization: Bearer TOKEN` format

---

### Issue: CORS Error

**Error:**
```
Access blocked by CORS policy
```

**Solutions:**
1. Check `CLIENT_URL` in `.env`
2. Verify CORS middleware in `server.js`
3. Restart backend server
4. Check frontend is on correct port

---

### Issue: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
```bash
# Find and kill process on port 5000
# macOS/Linux
lsof -ti:5000 | xargs kill

# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Or change port in .env
PORT=5001
```

---

## 📁 Project Structure

```
backend/
├── models/
│   ├── User.js              # User schema
│   └── Ticket.js            # Ticket schema
├── controllers/
│   ├── authController.js    # Auth logic
│   ├── ticketController.js  # Ticket CRUD
│   └── analyticsController.js # Analytics
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── ticketRoutes.js      # Ticket endpoints
│   ├── userRoutes.js        # User management
│   └── analyticsRoutes.js   # Analytics endpoints
├── middleware/
│   └── auth.js              # JWT verification
├── services/
│   ├── autoAssignService.js # Auto-assignment logic
│   └── emailService.js      # Email templates
├── server.js                # Entry point
├── seed.js                  # Sample data
├── .env                     # Environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## 🔒 Security Considerations

### Production Checklist:
- [ ] Change `JWT_SECRET` to strong random string
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS
- [ ] Implement rate limiting
- [ ] Add helmet for security headers
- [ ] Sanitize user inputs
- [ ] Use production MongoDB (Atlas)
- [ ] Enable MongoDB authentication
- [ ] Set up monitoring and logging
- [ ] Implement request validation

### Recommended Packages (Production):
```bash
npm install helmet express-rate-limit express-validator
```

---

## 📈 Performance Tips

1. **Database Indexing:**
   - Add indexes on frequently queried fields
   - Index `ticketId`, `email`, `status`

2. **Caching:**
   - Use Redis for frequently accessed data
   - Cache analytics results

3. **Connection Pooling:**
   - Already configured in Mongoose
   - Adjust pool size if needed

4. **Query Optimization:**
   - Use lean queries when not modifying data
   - Limit fields returned with select()

---

## 🚀 Deployment

### Deploy to Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create helpdesk-api

# Set environment variables
heroku config:set MONGODB_URI=your-atlas-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set EMAIL_USER=your-email
heroku config:set EMAIL_PASS=your-pass

# Deploy
git push heroku main

# Open app
heroku open
```

### Deploy to Railway
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Deploy to Render
1. Connect repository
2. Configure build command: `npm install`
3. Configure start command: `npm start`
4. Set environment variables
5. Deploy

---

## 📝 Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Start | `npm start` | Run server in production |
| Dev | `npm run dev` | Run with nodemon (auto-reload) |
| Seed | `npm run seed` | Populate database with sample data |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

Created as a technical assessment project demonstrating:
- RESTful API design
- MongoDB database management
- JWT authentication
- Email service integration
- Auto-assignment algorithms
- Analytics and reporting

---

## 📞 Support

For issues or questions:
- Email: your.email@example.com
- GitHub Issues: [repository-url]/issues

---

## 🙏 Acknowledgments

- Express.js documentation
- MongoDB documentation
- Nodemailer guides
- JWT best practices
- MERN stack community

---

**Happy Coding! 🚀**
