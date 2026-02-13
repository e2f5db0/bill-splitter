#!/bin/bash

# Bill Splitter - Development Environment Setup Script
# This script sets up and starts the development environment

set -e  # Exit on error

echo "=========================================="
echo "Bill Splitter - Development Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed.${NC}"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker is not running.${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed and running${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed.${NC}"
    echo "Please install Node.js and npm from: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ npm is installed${NC}"

# Check if .env file exists
if [ ! -f "./backend/.env" ]; then
    echo -e "${RED}Error: backend/.env file not found!${NC}"
    echo ""
    echo "Please create backend/.env with the following variables:"
    echo "  MONGO_ENV=development"
    echo "  DB_ROOT_USER=root"
    echo "  DB_ROOT_PASSWORD=<your-password>"
    echo "  DB_USER=<your-user>"
    echo "  DB_PASSWORD=<your-password>"
    echo "  DB_NAME=<your-database>"
    echo "  SECRET=<your-secret>"
    echo "  MONGO_URL_DEV=mongodb://<DB_USER>:<DB_PASSWORD>@template-mongo-dev:27017/<DB_NAME>"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ .env file found${NC}"

# Check if mongo-init.js exists
if [ ! -f "./backend/mongo/mongo-init.js" ]; then
    echo -e "${YELLOW}Warning: backend/mongo/mongo-init.js not found${NC}"
    echo "Creating mongo-init.js from .env credentials..."
    
    # Source the .env file
    source ./backend/.env
    
    # Create mongo-init.js
    mkdir -p ./backend/mongo
    cat > ./backend/mongo/mongo-init.js << EOF
// MongoDB initialization script
// This file is executed when the MongoDB container starts for the first time
// Note: This file cannot use environment variables from .env, so credentials must be hardcoded
// Make sure these match your backend/.env file

db = db.getSiblingDB('${DB_NAME}');

db.createUser({
  user: '${DB_USER}',
  pwd: '${DB_PASSWORD}',
  roles: [
    {
      role: 'readWrite',
      db: '${DB_NAME}',
    },
  ],
});
EOF
    echo -e "${GREEN}✓ Created mongo-init.js${NC}"
fi

# Install dependencies with npm
echo ""
echo "Installing dependencies..."

cd backend
echo "Installing backend dependencies..."
npm install
cd ..

cd frontend
echo "Installing frontend dependencies..."
npm install
cd ..

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Clean up old containers and volumes if they exist
echo ""
echo "Cleaning up old containers (if any)..."
docker compose -f docker compose.dev.yaml --env-file ./backend/.env down -v 2>/dev/null || true

# Remove old mongo data for fresh start (optional - commented out by default)
# echo "Removing old database data..."
# rm -rf ./backend/mongo_data

# Build and start containers
echo ""
echo "Building and starting Docker containers..."
echo "This may take a few minutes on first run..."
echo ""

docker compose -f docker compose.dev.yaml --env-file ./backend/.env up --build -d

# Wait for containers to be healthy
echo ""
echo "Waiting for services to start..."
sleep 5

# Check if containers are running
if docker ps | grep -q "template-frontend-dev"; then
    echo ""
    echo -e "${GREEN}=========================================="
    echo "✓ Development environment is ready!"
    echo "==========================================${NC}"
    echo ""
    echo "Services are running at:"
    echo "  • Frontend:        http://localhost:3000"
    echo "  • Backend API:     http://localhost:3001"
    echo "  • Nginx Proxy:     http://localhost:8080"
    echo "  • MongoDB:         localhost:3456"
    echo ""
    echo "To view logs:"
    echo "  docker compose -f docker compose.dev.yaml logs -f"
    echo ""
    echo "To stop the environment:"
    echo "  docker compose -f docker compose.dev.yaml down"
    echo ""
else
    echo -e "${RED}Error: Containers failed to start${NC}"
    echo "Check logs with: docker compose -f docker compose.dev.yaml logs"
    exit 1
fi
