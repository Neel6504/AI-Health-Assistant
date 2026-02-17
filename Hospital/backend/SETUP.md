# Backend Server Setup Guide

## Quick Start

The backend server needs MongoDB to run. You have **two options**:

---

## ✅ **Option 1: MongoDB Atlas (Cloud - Easiest, Recommended)**

### Steps:

1. **Create Free MongoDB Atlas Account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up (it's free!)
   - Choose the FREE tier (M0 Sandbox)

2. **Create a Cluster**
   - Click "Build a Database"
   - Select "FREE" tier (M0)
   - Choose a cloud provider and region (any)
   - Click "Create Cluster" (takes 3-5 minutes)

3. **Create Database User**
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Username: `healthassistant`
   - Password: `HealthAssist2026` (or your own)
   - User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist Your IP**
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

6. **Update .env File**
   - Open `Hospital/backend/.env`
   - Replace the MONGODB_URI with your connection string
   - Replace `<username>` with `healthassistant`
   - Replace `<password>` with `HealthAssist2026`
   - Add database name: `...mongodb.net/hospital-db?retryWrites...`

**Example:**
```env
MONGODB_URI=mongodb+srv://healthassistant:HealthAssist2026@cluster0.abcde.mongodb.net/hospital-db?retryWrites=true&w=majority
```

7. **Start the Server**
   ```bash
   cd Hospital/backend
   npm start
   ```

---

## 🔧 **Option 2: Local MongoDB (Advanced)**

### For Windows:

1. **Install MongoDB**
   - Download: https://www.mongodb.com/try/download/community
   - Install MongoDB Community Server
   - During installation:
     - Choose "Complete" installation
     - Install MongoDB as a Service
     - Install MongoDB Compass (optional GUI)

2. **Verify Installation**
   ```powershell
   mongod --version
   ```

3. **Update .env File**
   ```env
   MONGODB_URI=mongodb://localhost:27017/hospital-db
   ```

4. **Start the Server**
   ```bash
   cd Hospital/backend
   npm start
   ```

### For Mac/Linux:

```bash
# Mac (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb

# Verify
mongod --version
```

---

## 🚀 **Starting the Backend**

Once MongoDB is configured:

```bash
# Navigate to backend directory
cd E:\AI-Health-Assistant\Hospital\backend

# Install dependencies (if not already done)
npm install

# Start the server
npm start
```

### Expected Output:
```
🚀 Server running in development mode on port 5000
📍 API available at http://localhost:5000
MongoDB Connected: cluster0.xxxxx.mongodb.net
Database: hospital-db
```

---

## ✅ **Test the Server**

Open your browser and visit:
```
http://localhost:5000
```

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

---

## 🐛 **Troubleshooting**

### Error: "MongoNetworkError" or "ECONNREFUSED"
- **MongoDB Atlas**: Check your connection string, username, password
- **Local MongoDB**: Make sure MongoDB service is running
  ```bash
  # Windows
  net start MongoDB
  
  # Mac
  brew services start mongodb-community
  
  # Linux
  sudo systemctl start mongodb
  ```

### Error: "Authentication failed"
- Check username and password in connection string
- Make sure database user was created in Atlas

### Error: "IP not whitelisted"
- Add your IP address in MongoDB Atlas Network Access
- Or allow access from anywhere (0.0.0.0/0) for development

---

## 📝 **Environment Variables (.env)**

The `.env` file should contain:

```env
# MongoDB Connection
MONGODB_URI=your_connection_string_here

# Server Config
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=hospital_management_secret_key_2026_dev
```

⚠️ **Never commit `.env` to git!** (It's already in `.gitignore`)

---

## 🎯 **Quick Recommendation**

**Use MongoDB Atlas (Option 1)** - It's:
- ✅ Free
- ✅ No installation needed
- ✅ Works anywhere
- ✅ Automatically backed up
- ✅ Easy to share with team

Takes only **5 minutes** to set up!
