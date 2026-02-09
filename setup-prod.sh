#!/bin/bash

# Bill Splitter - Production Environment Setup Script
# This script sets up and starts the production environment

set -e  # Exit on error

echo "=========================================="
echo "Bill Splitter - Production Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track state for cleanup
CREATED_MONGO_INIT=false
CREATED_SSL_SCRIPT=false
STARTED_CONTAINERS=false
MONGO_INIT_BACKUP=""
SSL_SCRIPT_BACKUP=""

# Cleanup function for errors
cleanup_on_error() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        echo ""
        echo -e "${RED}=========================================="
        echo "Error occurred during setup (exit code: $exit_code)"
        echo "==========================================${NC}"
        echo ""
        
        # Offer to restore backups
        if [ -n "$MONGO_INIT_BACKUP" ] && [ -f "$MONGO_INIT_BACKUP" ]; then
            read -p "Restore mongo-init.js backup? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                cp "$MONGO_INIT_BACKUP" ./backend/mongo/mongo-init.js
                echo -e "${GREEN}✓ Restored mongo-init.js from backup${NC}"
            fi
        fi
        
        if [ -n "$SSL_SCRIPT_BACKUP" ] && [ -f "$SSL_SCRIPT_BACKUP" ]; then
            read -p "Restore init-letsencrypt.sh backup? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                cp "$SSL_SCRIPT_BACKUP" ./init-letsencrypt.sh
                echo -e "${GREEN}✓ Restored init-letsencrypt.sh from backup${NC}"
            fi
        fi
        
        # Offer to stop containers if they were started
        if [ "$STARTED_CONTAINERS" = true ]; then
            read -p "Stop Docker containers that were started? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                docker compose --env-file ./backend/.env down 2>/dev/null || true
                echo -e "${GREEN}✓ Stopped containers${NC}"
            fi
        fi
        
        echo ""
        echo "Setup was interrupted. You can:"
        echo "  1. Fix the issue and run the script again"
        echo "  2. Check logs with: docker compose logs"
        echo "  3. Clean up with: docker compose down -v"
        echo ""
    fi
}

# Set up trap for cleanup on error
trap cleanup_on_error EXIT

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
    echo "  NODE_ENV=production"
    echo "  MONGO_ENV=production"
    echo "  DB_ROOT_USER=root"
    echo "  DB_ROOT_PASSWORD=<your-password>"
    echo "  DB_USER=<your-user>"
    echo "  DB_PASSWORD=<your-password>"
    echo "  DB_NAME=<your-database>"
    echo "  SECRET=<your-secret>"
    echo "  MONGO_URL=mongodb://<DB_USER>:<DB_PASSWORD>@template-mongo:27017/<DB_NAME>"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ .env file found${NC}"

# Check if MONGO_ENV is set to production
source ./backend/.env

# Check if DOMAIN_NAME is set
if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${RED}Error: DOMAIN_NAME is not set in backend/.env${NC}"
    echo ""
    echo "Please add DOMAIN_NAME to your backend/.env file:"
    echo "  DOMAIN_NAME=your-domain.com"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ DOMAIN_NAME is set: $DOMAIN_NAME${NC}"

# Generate nginx.conf from template
echo "Generating nginx.conf from template..."
if [ ! -f "./nginx.conf.template" ]; then
    echo -e "${RED}Error: nginx.conf.template not found!${NC}"
    exit 1
fi

# Use envsubst to replace ${DOMAIN_NAME} in template
export DOMAIN_NAME
envsubst '${DOMAIN_NAME}' < nginx.conf.template > nginx.conf

echo -e "${GREEN}✓ nginx.conf generated with domain: $DOMAIN_NAME${NC}"

if [ "$MONGO_ENV" != "production" ]; then
    echo -e "${YELLOW}Warning: MONGO_ENV is not set to 'production' in .env${NC}"
    echo "Current value: $MONGO_ENV"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if mongo-init.js exists and validate credentials
if [ -f "./backend/mongo/mongo-init.js" ]; then
    echo "Checking mongo-init.js credentials..."
    
    # Extract credentials from existing mongo-init.js
    EXISTING_DB=$(grep "getSiblingDB" ./backend/mongo/mongo-init.js | sed -n "s/.*getSiblingDB('\([^']*\)').*/\1/p")
    EXISTING_USER=$(grep "user:" ./backend/mongo/mongo-init.js | sed -n "s/.*user: '\([^']*\)'.*/\1/p")
    
    # Compare with .env
    if [ "$EXISTING_DB" != "$DB_NAME" ] || [ "$EXISTING_USER" != "$DB_USER" ]; then
        echo -e "${YELLOW}Warning: mongo-init.js credentials don't match .env${NC}"
        echo "  Existing mongo-init.js: user='$EXISTING_USER', db='$EXISTING_DB'"
        echo "  Current .env:          user='$DB_USER', db='$DB_NAME'"
        echo ""
        echo "This mismatch will cause connection issues!"
        echo ""
        read -p "Update mongo-init.js to match .env? (Y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            # Create backup
            MONGO_INIT_BACKUP="./backend/mongo/mongo-init.js.backup.$(date +%Y%m%d_%H%M%S)"
            cp ./backend/mongo/mongo-init.js "$MONGO_INIT_BACKUP"
            echo -e "${GREEN}✓ Backup created: $MONGO_INIT_BACKUP${NC}"
            
            # Update mongo-init.js
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
            echo -e "${GREEN}✓ Updated mongo-init.js with new credentials${NC}"
        else
            echo -e "${YELLOW}⚠ Keeping existing mongo-init.js (may cause issues)${NC}"
        fi
    else
        echo -e "${GREEN}✓ mongo-init.js credentials match .env${NC}"
    fi
else
    echo -e "${YELLOW}Warning: backend/mongo/mongo-init.js not found${NC}"
    echo "Creating mongo-init.js from .env credentials..."
    
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

# Function to check if a port is in use
check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo -e "${YELLOW}⚠ Port $port ($service) is already in use${NC}"
        return 1
    fi
    return 0
}

# Check for port conflicts
echo ""
echo "Checking for port conflicts..."
PORT_CONFLICTS=0

check_port 80 "Nginx HTTP" || PORT_CONFLICTS=$((PORT_CONFLICTS + 1))
check_port 443 "Nginx HTTPS" || PORT_CONFLICTS=$((PORT_CONFLICTS + 1))
check_port 3001 "Backend API" || PORT_CONFLICTS=$((PORT_CONFLICTS + 1))
check_port 3456 "MongoDB" || PORT_CONFLICTS=$((PORT_CONFLICTS + 1))
check_port 5000 "Frontend" || PORT_CONFLICTS=$((PORT_CONFLICTS + 1))

if [ $PORT_CONFLICTS -gt 0 ]; then
    echo ""
    echo -e "${RED}Error: $PORT_CONFLICTS required port(s) are already in use${NC}"
    echo ""
    echo "Options:"
    echo "  1. Stop the conflicting services"
    echo "  2. Modify docker-compose.yaml to use different ports"
    echo "  3. Run 'docker compose down' if old containers are still running"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ All required ports are available${NC}"
fi

# Clean up old containers and volumes if they exist
echo ""
echo "Cleaning up old containers (if any)..."
docker compose --env-file ./backend/.env down -v 2>/dev/null || true

# Ask about cleaning database
echo ""
read -p "Do you want to remove existing database data? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Removing old database data..."
    rm -rf ./backend/mongo_data
    echo -e "${GREEN}✓ Database data removed${NC}"
fi

# Build and start containers
echo ""
echo "Building and starting Docker containers..."
echo "This may take a few minutes on first run..."
echo ""

docker compose --env-file ./backend/.env up --build -d
STARTED_CONTAINERS=true

# Wait for containers to be healthy
echo ""
echo "Waiting for services to start..."
sleep 10

# Check if containers are running
if docker ps | grep -q "template-frontend"; then
    echo ""
    echo -e "${GREEN}=========================================="
    echo "✓ Production environment is ready!"
    echo "==========================================${NC}"
    echo ""
    echo "Services are running at:"
    echo "  • Application:     http://localhost:5000"
    echo "  • Nginx (HTTP):    http://localhost:80"
    echo "  • Nginx (HTTPS):   https://localhost:443"
    echo "  • Backend API:     http://localhost:3001"
    echo "  • MongoDB:         localhost:3456"
    echo ""
    echo "To view logs:"
    echo "  docker compose logs -f"
    echo ""
    echo "To stop the environment:"
    echo "  docker compose down"
    echo ""
    
    # Ask about SSL setup
    echo -e "${YELLOW}=========================================="
    echo "SSL/HTTPS Setup (Optional)"
    echo "==========================================${NC}"
    echo ""
    echo "Would you like to set up SSL/HTTPS with Let's Encrypt?"
    echo ""
    read -p "Set up SSL now? (y/N) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "SSL Setup requires:"
        echo "  1. A domain name pointing to this server's public IP"
        echo "  2. Ports 80 and 443 accessible from the internet"
        echo "  3. A valid email address for Let's Encrypt notifications"
        echo ""
        
        # Get domain name
        read -p "Enter your domain name (e.g., example.com): " DOMAIN
        if [ -z "$DOMAIN" ]; then
            echo -e "${RED}Error: Domain name is required for SSL setup${NC}"
            echo "You can run ./init-letsencrypt.sh manually later"
            exit 0
        fi
        
        # Get email
        read -p "Enter your email address: " EMAIL
        if [ -z "$EMAIL" ]; then
            echo -e "${RED}Error: Email address is required for SSL setup${NC}"
            echo "You can run ./init-letsencrypt.sh manually later"
            exit 0
        fi
        
        # Ask about staging vs production
        echo ""
        echo "Certificate type:"
        echo "  1. Staging (recommended for testing, no rate limits)"
        echo "  2. Production (real certificates, rate limited)"
        echo ""
        read -p "Choose certificate type (1/2): " CERT_TYPE
        
        if [ "$CERT_TYPE" = "1" ]; then
            STAGING=1
            echo -e "${YELLOW}Using staging certificates (for testing)${NC}"
        else
            STAGING=0
            echo -e "${GREEN}Using production certificates${NC}"
        fi
        
        # Check if init-letsencrypt.sh already exists
        if [ -f "./init-letsencrypt.sh" ]; then
            echo ""
            echo -e "${YELLOW}init-letsencrypt.sh already exists${NC}"
            echo ""
            read -p "Overwrite existing SSL script? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}Skipping SSL script creation${NC}"
                echo "Using existing init-letsencrypt.sh"
                echo ""
                echo "To reconfigure SSL, either:"
                echo "  1. Delete init-letsencrypt.sh and run this script again"
                echo "  2. Edit init-letsencrypt.sh manually"
                echo ""
                exit 0
            fi
            
            # Create backup
            SSL_SCRIPT_BACKUP="./init-letsencrypt.sh.backup.$(date +%Y%m%d_%H%M%S)"
            cp ./init-letsencrypt.sh "$SSL_SCRIPT_BACKUP"
            echo -e "${GREEN}✓ Backup created: $SSL_SCRIPT_BACKUP${NC}"
        fi
        
        # Create/update init-letsencrypt.sh with user's values
        echo ""
        echo "Creating SSL initialization script..."
        
        cat > ./init-letsencrypt.sh << 'EOFSSL'
#!/bin/bash

# Initialize Let's Encrypt certificates
# This script should be run once before starting the docker-compose services

if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed.' >&2
  exit 1
fi

domains=(__DOMAIN__)
rsa_key_size=4096
data_path="./certbot"
email="__EMAIL__"
staging=__STAGING__

if [ -d "$data_path" ]; then
  read -p "Existing data found for $domains. Continue and replace existing certificate? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit
  fi
fi

if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
  echo "### Downloading recommended TLS parameters ..."
  mkdir -p "$data_path/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
  echo
fi

echo "### Creating dummy certificate for $domains ..."
path="/etc/letsencrypt/live/$domains"
mkdir -p "$data_path/conf/live/$domains"
docker compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1\
    -keyout '$path/privkey.pem' \
    -out '$path/fullchain.pem' \
    -subj '/CN=localhost'" certbot
echo

echo "### Starting nginx ..."
docker compose up --force-recreate -d nginx
echo

echo "### Deleting dummy certificate for $domains ..."
docker compose run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$domains && \
  rm -Rf /etc/letsencrypt/archive/$domains && \
  rm -Rf /etc/letsencrypt/renewal/$domains.conf" certbot
echo

echo "### Requesting Let's Encrypt certificate for $domains ..."
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

case "$email" in
  "") email_arg="--register-unsafely-without-email" ;;
  *) email_arg="--email $email" ;;
esac

if [ $staging != "0" ]; then staging_arg="--staging"; fi

docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    $email_arg \
    $domain_args \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --force-renewal" certbot
echo

echo "### Reloading nginx ..."
docker compose exec nginx nginx -s reload
EOFSSL
        
        # Replace placeholders
        sed -i "s/__DOMAIN__/$DOMAIN/g" ./init-letsencrypt.sh
        sed -i "s/__EMAIL__/$EMAIL/g" ./init-letsencrypt.sh
        sed -i "s/__STAGING__/$STAGING/g" ./init-letsencrypt.sh
        
        chmod +x ./init-letsencrypt.sh
        
        echo -e "${GREEN}✓ SSL initialization script created${NC}"
        echo ""
        echo "Running SSL setup..."
        echo ""
        
        # Run the SSL setup
        if ./init-letsencrypt.sh; then
            echo ""
            echo -e "${GREEN}=========================================="
            echo "✓ SSL setup completed successfully!"
            echo "==========================================${NC}"
            echo ""
            echo "Your application is now available at:"
            echo "  • HTTPS: https://$DOMAIN"
            echo "  • HTTP:  http://$DOMAIN (redirects to HTTPS)"
            echo ""
            if [ "$STAGING" = "1" ]; then
                echo -e "${YELLOW}Note: You're using staging certificates (not trusted by browsers)${NC}"
                echo "To get production certificates:"
                echo "  1. Edit init-letsencrypt.sh and set staging=0"
                echo "  2. Run: ./init-letsencrypt.sh"
                echo ""
            fi
        else
            echo ""
            echo -e "${RED}=========================================="
            echo "SSL setup failed"
            echo "==========================================${NC}"
            echo ""
            echo "Common issues:"
            echo "  • Domain doesn't point to this server's IP"
            echo "  • Ports 80/443 are not accessible from internet"
            echo "  • Firewall blocking connections"
            echo ""
            echo "Your application is still running without SSL at:"
            echo "  • HTTP: http://localhost:80"
            echo ""
            echo "To retry SSL setup later:"
            echo "  ./init-letsencrypt.sh"
            echo ""
            echo "For detailed troubleshooting, see docs/SSL_SETUP.md"
            echo ""
        fi
    else
        echo ""
        echo -e "${YELLOW}Skipping SSL setup${NC}"
        echo "To set up SSL later, see docs/SSL_SETUP.md or run:"
        echo "  ./init-letsencrypt.sh"
        echo ""
    fi
else
    echo -e "${RED}Error: Containers failed to start${NC}"
    echo "Check logs with: docker compose logs"
    exit 1
fi
