# Quick Start Guide

## Initial Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Configure Environment Variables

Update backend/.env:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRE=7d
```

### 3. Start with Docker

```bash
docker-compose up --build
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017

## Initial Login Credentials

The system automatically creates these users on first startup:

### Admin Account
- Email: admin@example.com
- Password: admin123
- Role: Admin

### Regular Users
- Email: john@example.com
- Password: password123
- Role: User

- Email: jane@example.com
- Password: password123
- Role: User

## Features

### For All Users:
- ✅ Login/Register
- ✅ Profile Management
- ✅ Change Password
- ✅ Task Management (Kanban Board)
- ✅ Todo List
- ✅ Dark Mode

### For Admin Users:
- ✅ User Management Dashboard
- ✅ Create/Edit/Delete Users
- ✅ Activate/Deactivate Accounts
- ✅ View User Statistics
- ✅ Role Management

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user
- PUT /api/auth/profile - Update profile
- PUT /api/auth/change-password - Change password

### Users (Admin Only)
- GET /api/users - Get all users
- GET /api/users/stats - Get user statistics
- GET /api/users/:id - Get user by ID
- POST /api/users - Create user
- PUT /api/users/:id - Update user
- PATCH /api/users/:id/toggle-status - Toggle user status
- DELETE /api/users/:id - Delete user

### Tasks
- GET /api/tasks - Get all tasks
- POST /api/tasks - Create task
- PUT /api/tasks/:id - Update task
- PUT /api/tasks/:id/move - Move task
- DELETE /api/tasks/:id - Delete task

### Todos
- GET /api/todos - Get all todos
- POST /api/todos - Create todo
- PUT /api/todos/:id - Update todo
- PATCH /api/todos/:id/toggle - Toggle todo
- DELETE /api/todos/:id - Delete todo

## Troubleshooting

### Users Not Created Automatically
```bash
cd backend
npm run seed-users
```

### Reset Database
```bash
docker-compose down -v
docker-compose up --build
```

### Check Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Security Notes

⚠️ Important for Production:

- Change JWT_SECRET to a strong random string (min 32 characters)
- Update ALLOWED_ORIGINS with your production domain
- Use HTTPS in production
- Change default admin password immediately
- Enable rate limiting for authentication endpoints
- Set up proper backup strategy for MongoDB

## Development

### Run Backend Locally
```bash
cd backend
npm run dev
```

### Run Frontend Locally
```bash
cd frontend
npm start
```

### Seed Sample Data
```bash
cd backend
npm run seed
npm run seed-users
```