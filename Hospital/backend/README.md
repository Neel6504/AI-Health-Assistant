# Hospital Management System - Backend

Complete Node.js/Express backend for the Hospital Management System with MongoDB Atlas integration.

## 🚀 Features

- Hospital registration and authentication
- MongoDB Atlas database integration
- Secure password hashing with bcryptjs
- JWT token-based authentication
- Input validation and error handling
- RESTful API design

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn package manager

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster or use an existing one
3. Click "Connect" on your cluster
4. Choose "Connect your application"
5. Copy the connection string

### 3. Environment Variables

Create a `.env` file in the backend directory and add your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/hospital-db?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

Replace:
- `<username>` - Your MongoDB Atlas username
- `<password>` - Your MongoDB Atlas password
- `<cluster-url>` - Your cluster URL
- `JWT_SECRET` - A secure random string for JWT signing

### 4. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Hospital Registration
```http
POST /api/hospitals/register
Content-Type: application/json

{
  "hospitalName": "City General Hospital",
  "registrationNumber": "REG123456",
  "email": "contact@hospital.com",
  "phone": "9876543210",
  "address": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "establishedYear": 2000,
  "hospitalType": "private",
  "totalBeds": 100,
  "specializations": "Cardiology, Neurology",
  "emergencyAvailable": true,
  "ambulanceAvailable": true,
  "adminName": "Dr. John Doe",
  "adminPosition": "Hospital Director",
  "password": "securepassword123"
}
```

### Hospital Login
```http
POST /api/hospitals/login
Content-Type: application/json

{
  "email": "contact@hospital.com",
  "password": "securepassword123"
}
```

### Get All Hospitals
```http
GET /api/hospitals
```

### Get Single Hospital
```http
GET /api/hospitals/:id
```

## 🗂️ Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection configuration
├── models/
│   └── Hospital.js        # Hospital schema and model
├── routes/
│   └── hospitalRoutes.js  # Hospital API routes
├── .env                   # Environment variables (create this)
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore file
├── package.json          # Dependencies and scripts
└── server.js             # Main server file
```

## 🔒 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token authentication
- Input validation
- MongoDB injection prevention
- CORS enabled for frontend integration

## 🛠️ Database Schema

### Hospital Collection
- Hospital information (name, registration number, established year)
- Contact details (email, phone, address)
- Hospital specifications (type, beds, specializations)
- Services (emergency, ambulance)
- Admin information
- Authentication (hashed password)
- Status flags (isActive, isVerified)
- Timestamps (createdAt, updatedAt)

## 🔄 Frontend Integration

Update the frontend API URL in your signup component to:
```javascript
const response = await fetch('http://localhost:5000/api/hospitals/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(hospitalData)
})
```

## 🐛 Troubleshooting

### Cannot Connect to MongoDB
- Verify your connection string in `.env`
- Check if your IP address is whitelisted in MongoDB Atlas
- Ensure database user has proper permissions

### Port Already in Use
- Change the PORT in `.env` file
- Kill the process using port 5000: `netstat -ano | findstr :5000` (Windows)

### CORS Errors
- Make sure the backend server is running
- Check if CORS is properly configured in `server.js`

## 📝 Notes

- The API currently has public endpoints for testing
- In production, implement proper authentication middleware
- Add rate limiting for API endpoints
- Set up proper logging and monitoring
- Use environment-specific configurations

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

ISC
