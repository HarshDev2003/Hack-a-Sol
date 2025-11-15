# LUMEN Financial Intelligence Platform - Setup Guide

This guide will help you set up and run the complete LUMEN Financial Intelligence Platform with both frontend and backend.

## Project Overview

The project has been restructured with:
- **Frontend**: React + Vite (existing)
- **Backend**: Node.js + Express + MongoDB (newly created)

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (v4.4 or higher) - Install from [mongodb.com](https://www.mongodb.com/try/download/community)
3. **npm** or **yarn**

## Quick Start

### 1. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
# If installed as a service, it should auto-start
# Otherwise, run:
"C:\Program Files\MongoDB\Server\{version}\bin\mongod.exe"
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
# or
sudo service mongod start
```

### 2. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies (already done)
npm install

# The .env file is already configured with default values:
# - PORT=5000
# - MONGODB_URI=mongodb://localhost:27017/lumen-finance
# - JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Setup Frontend

Open a new terminal:

```bash
# Navigate to project root (from backend, go up one level)
cd ..

# The .env file is already configured:
# - VITE_API_URL=http://localhost:5000/api

# Start the frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or the next available port)

## Testing the Application

### 1. Register a New User

1. Open your browser to `http://localhost:5173`
2. Click on "Sign up" link
3. Create an account with:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: user

### 2. Create Test Data

#### Option 1: Via Frontend UI
- Upload documents
- Create transactions manually
- Set up reminders

#### Option 2: Via API (Postman/cURL)

**Create a Transaction:**
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant": "Walmart",
    "amount": 125.50,
    "category": "Groceries",
    "type": "expense",
    "date": "2024-11-14"
  }'
```



## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Transactions
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Documents
- `GET /api/documents` - List all documents
- `POST /api/documents` - Upload document (multipart/form-data)
- `DELETE /api/documents/:id` - Delete document

### Analytics
- `GET /api/analytics/summary` - User analytics

### Reminders
- `GET /api/reminders` - List reminders
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

### Anomalies
- `GET /api/anomalies` - List anomalies
- `PUT /api/anomalies/:id` - Update anomaly status

## Project Structure

```
Finance/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   ├── Document.js
│   │   ├── Reminder.js
│   │   └── Anomaly.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   ├── documents.js
│   │   ├── analytics.js
│   │   ├── reminders.js
│   │   ├── anomalies.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── uploads/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── src/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   └── utils/
├── .env
├── .env.example
└── package.json
```

## Features Implemented

### Frontend (Updated)
✅ Removed all hardcoded data
✅ Connected to backend API
✅ Environment configuration with .env
✅ Real-time data fetching
✅ Loading states
✅ Error handling with toast notifications

### Backend (New)
✅ RESTful API with Express
✅ MongoDB database integration
✅ User authentication with JWT
✅ Password hashing with bcrypt
✅ File upload support (multer)
✅ Role-based access control
✅ Input validation
✅ Error handling middleware
✅ CORS enabled

### Models
✅ User (with role: user)
✅ Transaction
✅ Document
✅ Reminder
✅ Anomaly

### API Routes
✅ Authentication (register, login, me)
✅ Transactions (CRUD)
✅ Documents (upload, list, delete)
✅ Analytics (user summary)
✅ Reminders (CRUD)
✅ Anomalies (list, update status)

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify .env file exists and has correct values
- Check if port 5000 is available

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check .env file has `VITE_API_URL=http://localhost:5000/api`
- Clear browser cache and restart dev server

### Database connection errors
- Ensure MongoDB is running
- Check MongoDB URI in backend/.env
- Verify MongoDB is accessible on localhost:27017

### CORS errors
- Backend has CORS enabled for all origins
- If you change the backend port, update VITE_API_URL

## Development

### Add New Features

1. **Backend**:
   - Create model in `backend/models/`
   - Create routes in `backend/routes/`
   - Add routes to `backend/server.js`

2. **Frontend**:
   - Create component in `src/components/`
   - Add API calls using `apiClient`
   - Update routes if needed

### Security Notes

- Change JWT_SECRET in production
- Add rate limiting for production
- Implement proper error logging
- Add input sanitization
- Enable HTTPS in production

## Next Steps

1. Add data seeding script for demo data
2. Implement email notifications
3. Add password reset functionality
4. Implement real AI/ML for anomaly detection
5. Add OCR for document processing
6. Implement real-time notifications with WebSockets
7. Add comprehensive tests
8. Deploy to production

## Support

For issues or questions:
1. Check backend logs in terminal
2. Check browser console for frontend errors
3. Verify MongoDB connection
4. Check API responses in Network tab

## License

ISC
