# Hospital Management System - Setup Guide

## 🎯 Complete Setup Instructions

This guide will help you set up the Hospital Management System with MongoDB Atlas database integration.

## 📚 Prerequisites

- Node.js (v14 or higher) - [Download here](https://nodejs.org/)
- MongoDB Atlas account - [Sign up here](https://www.mongodb.com/cloud/atlas)
- Git (optional)

---

## 🗄️ Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account or log in
3. Create a new organization (if needed)

### 1.2 Create a Cluster
1. Click "Build a Cluster"
2. Choose **Free Shared Cluster** (M0)
3. Select your cloud provider and region (choose closest to your location)
4. Name your cluster (e.g., "AIAssistant")
5. Click "Create Cluster" (may take 5-10 minutes)

### 1.3 Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
   - Example: username: `hospital_admin`, password: `SecurePass123!`
5. Set "Database User Privileges" to "Read and write to any database"
6. Click "Add User"

### 1.4 Whitelist IP Address
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP address for better security
4. Click "Confirm"

### 1.5 Get Connection String
1. Go back to "Database" (Clusters)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" driver and version "4.1 or later"
5. Copy the connection string
   - It looks like: `mongodb+srv://hospital_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Replace `<password>` with your actual password
7. Add database name: `mongodb+srv://hospital_admin:SecurePass123!@cluster0.xxxxx.mongodb.net/hospital-db?retryWrites=true&w=majority`

---

## 🔧 Step 2: Backend Setup

### 2.1 Navigate to Backend Directory
```bash
cd "e:\AI Assistant\Hospital\backend"
```

### 2.2 Install Dependencies
```bash
npm install
```

This will install:
- Express.js (web framework)
- Mongoose (MongoDB ODM)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- cors (Cross-Origin Resource Sharing)
- dotenv (environment variables)

### 2.3 Configure Environment Variables
1. Open the `.env` file in the backend directory
2. Replace the placeholder with your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://hospital_admin:SecurePass123!@cluster0.xxxxx.mongodb.net/hospital-db?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
JWT_SECRET=my_super_secret_jwt_key_12345
```

**Important:** Replace:
- `hospital_admin` - Your MongoDB username
- `SecurePass123!` - Your MongoDB password
- `cluster0.xxxxx.mongodb.net` - Your cluster URL
- `my_super_secret_jwt_key_12345` - A secure random string

### 2.4 Start Backend Server
```bash
npm run dev
```

You should see:
```
🚀 Server running in development mode on port 5000
📍 API available at http://localhost:5000
MongoDB Connected: cluster0-shard-00-01.xxxxx.mongodb.net
Database: hospital-db
```

**Keep this terminal running!**

---

## 🎨 Step 3: Frontend Setup

### 3.1 Open New Terminal
Keep the backend running and open a new terminal

### 3.2 Navigate to Frontend Directory
```bash
cd "e:\AI Assistant\Hospital"
```

### 3.3 Install Dependencies (if not already done)
```bash
npm install
```

### 3.4 Start Frontend Development Server
```bash
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## ✅ Step 4: Test the Application

### 4.1 Open Browser
Go to: `http://localhost:5173`

### 4.2 Register a Hospital
1. Click on "Register" or "Signup"
2. Fill in all required fields:
   - Hospital Name: "City General Hospital"
   - Registration Number: "REG123456"
   - Email: "cityhospital@example.com"
   - Phone: "9876543210"
   - Address, City, State, Pincode
   - Hospital Type, Beds, Specializations
   - Admin details
   - Password (at least 8 characters)
3. Click "Register Hospital"

### 4.3 Verify in MongoDB Atlas
1. Go to MongoDB Atlas Dashboard
2. Click "Browse Collections"
3. You should see:
   - Database: `hospital-db`
   - Collection: `hospitals`
   - Your registered hospital data

### 4.4 Test Login
1. Use the email and password you registered with
2. Click "Login"
3. You should be logged in successfully!

---

## 🔍 Step 5: Verify Everything Works

### Check Backend
Open: `http://localhost:5000`

You should see:
```json
{
  "message": "Hospital Management System API",
  "version": "1.0.0",
  "endpoints": {
    "hospitals": "/api/hospitals",
    "register": "POST /api/hospitals/register",
    "login": "POST /api/hospitals/login"
  }
}
```

### Test API Endpoints
You can use Postman or browser:

**Get all hospitals:**
```
GET http://localhost:5000/api/hospitals
```

---

## 🐛 Troubleshooting

### Backend won't start
**Error:** "Cannot connect to MongoDB"
- ✅ Check your `.env` file for correct connection string
- ✅ Verify your IP is whitelisted in MongoDB Atlas
- ✅ Confirm database user credentials are correct

**Error:** "Port 5000 already in use"
- ✅ Change PORT in `.env` to 5001 or another port
- ✅ Update frontend API URL to match new port

### Frontend can't connect to backend
**Error:** "Failed to connect to server"
- ✅ Make sure backend is running on port 5000
- ✅ Check browser console for CORS errors
- ✅ Verify API URL in Signup.jsx and Login.jsx is `http://localhost:5000`

### Registration fails
**Error:** "Email already exists"
- ✅ Use a different email address
- ✅ Or manually delete the hospital from MongoDB Atlas

**Error:** "Validation failed"
- ✅ Check all required fields are filled
- ✅ Verify phone is 10 digits
- ✅ Verify pincode is 6 digits
- ✅ Verify password is at least 8 characters

---

## 📊 Project Structure

```
Hospital/
├── backend/                    # Backend server
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   └── Hospital.js        # Hospital schema
│   ├── routes/
│   │   └── hospitalRoutes.js  # API routes
│   ├── .env                   # Environment variables (configure this!)
│   ├── .env.example           # Example env file
│   ├── package.json           # Backend dependencies
│   ├── server.js              # Main server file
│   └── README.md              # Backend documentation
├── src/                        # Frontend React app
│   ├── components/
│   │   ├── Login.jsx          # Login component (updated)
│   │   ├── Signup.jsx         # Signup component (updated)
│   │   └── Dashboard.jsx      # Dashboard component
│   └── ...
└── package.json               # Frontend dependencies
```

---

## 🚀 Next Steps

1. ✅ Backend is connected to MongoDB Atlas
2. ✅ Frontend can register and login hospitals
3. 📝 Add more features:
   - Appointment management
   - Doctor profiles
   - Patient records
   - Analytics dashboard

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all steps were followed correctly
3. Check MongoDB Atlas connection status
4. Review backend console logs for errors

---

## 🔐 Security Notes

### For Development:
- Using "Allow Access from Anywhere" in MongoDB Atlas
- Simple JWT secret
- No rate limiting

### For Production:
- Whitelist specific IP addresses only
- Use strong, random JWT secret
- Add rate limiting
- Implement refresh tokens
- Add input sanitization
- Use HTTPS
- Enable MongoDB audit logs

---

## ✨ Features Implemented

✅ Hospital registration with validation
✅ Secure password hashing (bcrypt)
✅ MongoDB Atlas cloud database
✅ JWT authentication
✅ Login/Logout functionality
✅ Form validation (frontend & backend)
✅ Error handling
✅ RESTful API design

---

**Your Hospital Management System is now ready to use! 🎉**
