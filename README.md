# TaskFlow - Personal Task Manager

A full-stack self-hosted Jira-like personal task manager built with React, Node.js, and MongoDB. Features a Kanban board with drag-and-drop functionality, to-do lists, analytics, and a modern responsive UI.

![TaskFlow Dashboard](https://via.placeholder.com/800x400/3b82f6/ffffff?text=TaskFlow+Dashboard)

## ✨ Features

### 🎯 Core Functionality
- **Kanban Board**: Drag-and-drop task management with Backlog, In Progress, In Review, and Done columns
- **To-Do Lists**: Quick personal task management with categories and priorities
- **User Authentication**: JWT-based authentication with admin user support
- **Real-time Updates**: Live updates across all components
- **Search & Filtering**: Advanced search and filtering capabilities
- **Analytics Dashboard**: Productivity charts and completion statistics

### 🎨 User Experience
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **Dark/Light Mode**: Theme switching with persistence
- **Mobile Responsive**: Fully responsive design for all screen sizes
- **Smooth Animations**: Framer Motion animations for enhanced UX
- **Drag & Drop**: Intuitive task management with react-beautiful-dnd

### 🔧 Technical Features
- **RESTful API**: Comprehensive CRUD operations for tasks and todos
- **Data Validation**: Server-side validation with express-validator
- **Error Handling**: Comprehensive error handling and user feedback
- **Security**: JWT authentication, rate limiting, and input sanitization
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **Health Checks**: Built-in health monitoring for all services

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- MongoDB (if running locally)

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd self-jira
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

4. **Default credentials**
   - Email: admin@taskflow.com
   - Password: admin123

### Local Development

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **MongoDB Setup**
   - Install MongoDB locally
   - Create a database named `taskflow`
   - Update the connection string in backend/.env

## 📁 Project Structure

```
self-jira/
├── backend/                 # Node.js/Express API
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── Dockerfile          # Backend Docker image
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React/Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── lib/           # Utility functions
│   ├── Dockerfile         # Frontend Docker image
│   └── package.json       # Frontend dependencies
├── scripts/               # Database initialization
├── docker-compose.yml     # Production Docker setup
├── docker-compose.dev.yml # Development Docker setup
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/taskflow
MONGODB_URI_PROD=mongodb://mongodb:27017/taskflow

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Admin User
ADMIN_EMAIL=admin@taskflow.com
ADMIN_PASSWORD=admin123
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (admin only)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/preferences` - Update user preferences

### Task Endpoints
- `GET /api/tasks` - Get all tasks with filtering
- `GET /api/tasks/kanban` - Get tasks organized by status
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/status` - Update task status
- `POST /api/tasks/:id/comments` - Add comment to task
- `DELETE /api/tasks/:id` - Delete task

### Todo Endpoints
- `GET /api/todos` - Get all todos with filtering
- `GET /api/todos/stats` - Get todo statistics
- `GET /api/todos/:id` - Get single todo
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `PATCH /api/todos/:id/toggle` - Toggle todo completion
- `DELETE /api/todos/:id` - Delete todo

### Analytics Endpoints
- `GET /api/analytics/overview` - Get overview analytics
- `GET /api/analytics/productivity` - Get productivity data
- `GET /api/analytics/priority-distribution` - Get priority distribution
- `GET /api/analytics/completion-trends` - Get completion trends

## 🎨 UI Components

### Kanban Board
- Drag-and-drop task management
- Status-based columns (Backlog, In Progress, In Review, Done)
- Task cards with priority indicators
- Real-time updates

### To-Do List
- Category-based organization
- Priority levels (Low, Medium, High)
- Completion tracking
- Search and filtering

### Analytics Dashboard
- Task completion statistics
- Productivity trends
- Priority distribution charts
- Time-based analytics

## 🐳 Docker Deployment

### Production Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Development Mode
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Database Management
```bash
# Access MongoDB shell
docker exec -it taskflow-mongodb mongosh

# Backup database
docker exec taskflow-mongodb mongodump --out /data/backup

# Restore database
docker exec taskflow-mongodb mongorestore /data/backup
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured CORS for cross-origin requests
- **Helmet Security**: Security headers with Helmet.js
- **Password Hashing**: bcrypt for secure password storage

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1440px+)

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚀 Performance Optimizations

- **Code Splitting**: Dynamic imports for better loading
- **Image Optimization**: Next.js image optimization
- **Caching**: API response caching
- **Database Indexing**: Optimized MongoDB queries
- **Bundle Optimization**: Minimized production bundles

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Kanban board with drag-and-drop
- To-do list management
- User authentication
- Analytics dashboard
- Dark/light mode
- Mobile responsiveness
- Docker support

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [React Beautiful DnD](https://github.com/atlassian/react-beautiful-dnd) - Drag and drop
- [Recharts](https://recharts.org/) - Chart library
- [MongoDB](https://www.mongodb.com/) - Database
- [Express.js](https://expressjs.com/) - Web framework

---

**TaskFlow** - Your personal productivity companion! 🚀
