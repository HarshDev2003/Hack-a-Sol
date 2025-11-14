# LUMEN Financial Intelligence Platform - Backend

Backend API for the LUMEN Financial Intelligence Platform built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Transaction management
- Document upload and processing
- Analytics and insights
- Smart reminders
- Anomaly detection
- User management (admin)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lumen-finance
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
UPLOAD_DIR=uploads
```

4. Make sure MongoDB is running on your system.

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` by default.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Documents
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get single document
- `POST /api/documents` - Upload document
- `DELETE /api/documents/:id` - Delete document

### Analytics
- `GET /api/analytics/summary` - Get user analytics summary
- `GET /api/analytics/admin/dashboard` - Get admin dashboard stats (admin only)

### Reminders
- `GET /api/reminders` - Get all reminders
- `GET /api/reminders/:id` - Get single reminder
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

### Anomalies
- `GET /api/anomalies` - Get all anomalies
- `GET /api/anomalies/:id` - Get single anomaly
- `PUT /api/anomalies/:id` - Update anomaly status
- `DELETE /api/anomalies/:id` - Delete anomaly

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Project Structure

```
backend/
├── config/
│   └── database.js       # MongoDB connection
├── models/
│   ├── User.js          # User model
│   ├── Transaction.js   # Transaction model
│   ├── Document.js      # Document model
│   ├── Reminder.js      # Reminder model
│   └── Anomaly.js       # Anomaly model
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── transactions.js  # Transaction routes
│   ├── documents.js     # Document routes
│   ├── analytics.js     # Analytics routes
│   ├── reminders.js     # Reminder routes
│   ├── anomalies.js     # Anomaly routes
│   └── users.js         # User management routes
├── middleware/
│   └── auth.js          # Authentication middleware
├── uploads/             # Uploaded files directory
├── .env                 # Environment variables
├── .env.example         # Example environment variables
├── .gitignore          # Git ignore file
├── package.json        # Dependencies
└── server.js           # Main server file
```

## Default User Roles

- `user` - Regular user with access to personal data
- `driver` - Driver role with additional vehicle management
- `admin` - Full administrative access

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Protected routes with middleware
- Role-based access control

## Development

To add new features:

1. Create model in `models/` directory
2. Create routes in `routes/` directory
3. Add routes to `server.js`
4. Test endpoints

## License

ISC
