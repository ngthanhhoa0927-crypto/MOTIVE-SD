# Motive-SD

A web application with a Next.js frontend and a Node.js backend.

## Project Structure

- /frontend: Next.js application for the user interface.
- /backend: Node.js server with Drizzle ORM for data management.

## Setup Instructions

### Backend
1. Navigate to the backend directory.
2. Install dependencies: npm install
3. Configure environment variables in .env.
4. Run the development server: npm run dev

### Frontend
1. Navigate to the frontend directory.
2. Install dependencies: npm install
3. Run the development server: npm run dev

## Deployment
Use Docker Compose to orchestrate both services:
docker-compose up --build
