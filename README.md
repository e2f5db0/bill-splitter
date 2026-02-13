# bill-splitter (containerized)

(Initial commit in Oct 2022)

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Node.js and npm](https://nodejs.org/) installed (optional, but recommended for local development)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository>
   cd bill-splitter
   ```

2. **Create environment file**
   
   Create `backend/.env` with your configuration:
   ```bash
   MONGO_ENV=development
   DB_ROOT_USER=root
   DB_ROOT_PASSWORD=supersecret # change this
   DB_USER=the_user # change this
   DB_PASSWORD=the_password # change this
   DB_NAME=the_database # change this
   SECRET=change_me # change this
   DOMAIN_NAME=your-domain.com # change this (for production SSL/HTTPS)
   LOGIN_PASSWORD_HASH= # will be set during setup
   
   # For development
   MONGO_URL_DEV=mongodb://<DB_USER>:<DB_PASSWORD>@template-mongo-dev:27017/<DB_NAME>
   
   # For production (use same credentials)
   MONGO_URL=mongodb://<DB_USER>:<DB_PASSWORD>@template-mongo:27017/<DB_NAME>
   ```
   
   **Note:** The `DOMAIN_NAME` is used to automatically configure nginx for your domain. 
   See [DOMAIN_CONFIGURATION.md](docs/DOMAIN_CONFIGURATION.md) for details.

3. **Set up login password**
   
   Run the password setup utility to create a secure login password:
   ```bash
   cd backend
   npm install
   npm run setup-password
   ```
   
   This will:
   - Prompt you to enter a new password
   - Generate a bcrypt hash
   - Display the `LOGIN_PASSWORD_HASH` value to add to your `.env` file
   
   Copy the generated hash and add it to `backend/.env`:
   ```bash
   LOGIN_PASSWORD_HASH=<generated-hash>
   ```
   
   For detailed password setup instructions, see [PASSWORD_SETUP.md](docs/PASSWORD_SETUP.md).

3. **Run the setup script**
   
   For development:
   ```bash
   ./setup-dev.sh
   ```
   
   For production:
   ```bash
   ./setup-prod.sh
   ```

The script will:
- ✓ Check Docker installation
- ✓ Install dependencies with npm
- ✓ Create MongoDB initialization file
- ✓ Build Docker images
- ✓ Start all containers
- ✓ Optionally set up SSL/HTTPS (production only)

### Access the Application

**Development mode:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Nginx Proxy: http://localhost:8080
- MongoDB: localhost:3456

**Production mode:**
- Application: http://localhost:5000
- Nginx (HTTP): http://localhost:80
- Nginx (HTTPS): https://localhost:443 (after SSL setup)

### SSL/HTTPS Setup (Production)

The production setup script (`./setup-prod.sh`) includes an optional SSL setup wizard that will:
- Guide you through Let's Encrypt certificate setup
- Configure your domain and email
- Choose between staging (testing) or production certificates
- Automatically configure nginx for HTTPS

You can also set up SSL manually later by running:
```bash
./init-letsencrypt.sh
```

For detailed SSL setup instructions, see [SSL_SETUP.md](docs/SSL_SETUP.md).

### Changing the Login Password

To change the login password at any time:

1. Run the password setup utility:
   ```bash
   cd backend
   npm run setup-password
   ```

2. Update the `LOGIN_PASSWORD_HASH` value in `backend/.env` with the newly generated hash

3. Restart the backend service:
   ```bash
   # If using Docker
   docker compose restart template-backend
   
   # If running manually
   # Stop the backend process and restart it
   ```

**Security Note:** The password hash is stored in the `.env` file, which should never be committed to version control. Make sure `backend/.env` is listed in your `.gitignore` file.

## Manual Setup (Alternative)

If you prefer to run commands manually:

### Development

```bash
# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Start containers
docker compose -f docker compose.dev.yaml --env-file ./backend/.env up --build
```

### Production

```bash
# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Start containers
docker compose --env-file ./backend/.env up --build
```

`Note:` You may need to add `sudo` before docker commands on some systems.

`Debug:` If changes do not trigger nodemon live-reload, try to add -L (--legacy-watch) flag to dev script in *package.json*:
```
"dev": "nodemon -L index.js"
```

### Linting

Make sure to lint the code before trying to make PRs and fix all lint issues

```bash
$ cd ./backend/
$ npm run lint
$ cd ./frontend/
$ npm run lint
```

### Testing

Run frontend tests (jest)

```bash
> cd ./frontend/
> npm run test
```

Backend unit tests are yet to be implemented.

## Production

To run in production mode (run all commands in the root folder):

`Note:` Remember to change the .env variable MONGO_ENV from 'development' to 'production'!

`Note:` Remember also to set the variables in the environment where you deploy (ex. Heroku)!

If the database setup doesn't go smoothly, you can delete all containers, images and volumes from Docker desktop, and also run:

```bash
# all existing data in the database(s) will be lost
$ sudo rm -rf backend/mongo_data/
```

And then run from a clean slate in production mode:

Note that you need to have matching secret values in the .env file and backend/mongo/mongo-init.js

Users and database tables must be initialized in mongo-init.js

```bash
# Install dependencies with npm (creates package-lock.json files)
> cd ./backend/ && npm install
> cd ./frontend/ && npm install
# The app runs on localhost:5000
> docker-compose --env-file ./backend/.env up # with docker-compose
> docker compose --env-file ./backend/.env up # with docker desktop
> docker compose --env-file ./backend/.env up > /dev/null 2>&1 & # start in background
```

`Debug:` If refreshing a view results in error 404, you probably need to go to the frontend container and add the following to */etc/nginx/conf.d/default.conf*

```bash
# start a shell in the frontend container
> docker exec -it <CONTAINER_ID> sh
# edit the nginx default conf file
> vi /etc/nginx/conf.d/default.conf
```

Make sure the file contains the following:

location / {
    root /usr/share/nginx/html;
    index index.html;
    try_files $uri /index.html;
}

By default nginx searches for files for each path and thi may cause problems for one page applications. The try_files line ensures that index.html is served if nginx finds no other file to serve.

```bash
# restart the frontend container
> docker container restart <CONTAINER_ID>
```

## E2E tests in production mode

Run end-to-end tests (cypress)

```bash
> docker compose --env-file ./backend/.env up # with docker compose
> docker compose --env-file ./backend/.env up # with docker desktop
> docker compose --env-file ./backend/.env up > /dev/null 2>&1 & # start in background
# Run in other terminal
> cd ./backend/
> npm run test:e2e
```

Run e2e tests in interactive mode

```bash
# Expects that the production environment is running
> cd ./backend/
> npm run cypress:open
```
 