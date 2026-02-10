# 🚀 Quick Start - Hospital Management System

## Start the Application (Both servers must run simultaneously)

### Terminal 1 - Backend Server
```bash
cd "e:\AI Assistant\Hospital\backend"
npm install
npm run dev
```
**Expected Output:**
```
🚀 Server running in development mode on port 5000
📍 API available at http://localhost:5000
MongoDB Connected: cluster0.xxxxx.mongodb.net
Database: hospital-db
```

### Terminal 2 - Frontend Server
```bash
cd "e:\AI Assistant\Hospital"
npm install
npm run dev
```
**Expected Output:**
```
VITE ready in xxx ms
➜  Local: http://localhost:5173/
```

## ⚠️ Before First Run

### 1. Configure MongoDB Atlas (.env file)
Open `backend/.env` and update:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/hospital-db?retryWrites=true&w=majority
```

### 2. Get your MongoDB connection string:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Paste into `.env` file

## 📱 Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## ✅ Test Registration
1. Open http://localhost:5173
2. Click "Register"
3. Fill in hospital details
4. Submit form
5. Check MongoDB Atlas to see your data!

## 🔍 API Endpoints
- `POST /api/hospitals/register` - Register hospital
- `POST /api/hospitals/login` - Login
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/:id` - Get single hospital

---

**For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**
