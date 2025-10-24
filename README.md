# Connection Status App

A full-stack application that monitors the connection status of frontend, backend, and database components in real-time.

## Project Structure

```
connection-status-app/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## Features

✅ Real-time connection status monitoring  
✅ Auto-refresh every 5 seconds  
✅ Manual refresh button  
✅ Visual status indicators with colors  
✅ Responsive design  
✅ Dockerized full stack  
✅ Health check endpoints  

## Setup Instructions

### Prerequisites
- Docker
- Docker Compose

### Running the Application

1. Clone or download this repository
2. Navigate to the project directory: `cd connection-status-app`
3. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health
- MongoDB: localhost:27017

### Useful Docker Compose Commands

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
```

## API Endpoints

- `GET /api/health` - Returns the health status of backend and database
- `GET /api/test` - Simple test endpoint

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Containerization**: Docker & Docker Compose