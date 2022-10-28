# React node template (containerized)

A containerized starting point for a react node web application using mongoDB.

## Todo

- Figure out the database setup after deployment (MongoDB)
- Figure out how to deploy the whole containerized setup to Heroku with the github actions pipeline (One dyno for each Dockerfile? How will the containers communicate without docker-compose?)

## Development

Clone the repository

```bash
git clone <repository>
```

Install & run [Docker desktop](https://www.docker.com/products/docker-desktop/)

Create the file `.env` in the root of the `./backend/` directory.

Define the necessary environment variables in `.env`.

Example contents of `.env` to get the development environment running:

```
MONGO_ENV=development
DB_ROOT_USER=root
DB_ROOT_PASSWORD=example
DB_USER=the_user
DB_PASSWORD=the_password
DB_NAME=the_database
# Replace the values in <> and remove the <>
MONGO_URL_DEV=mongodb://<same-as-DB_USER>:<same-as-DB_PASSWORD>@template-mongo-dev:27017/<same-as-DB_NAME>
# production mongo url (use your own credentials)
MONGO_URL=mongodb://<DB_USER>:<DB_PASSWORD>@template-mongo:27017/<DB_NAME>

```

`Note:` Remember to set & change these in the environment where you deploy (ex. Heroku)!

## Running the development containers

`Note:` Make sure you are not connected to a VPN or else the network created by docker-compose will be unreachable during development.

`Note:` It may be a good idea to delete package-lock.json files from both frontend and backend before continuing.

In the root folder:

```bash
# The frontend runs on localhost:3000.
# nginx serves the frontend on localhost:8080.
# The backend runs on localhost:3001.
> docker-compose -f docker-compose.dev.yaml up --env-file ./backend/.env # with docker-compose
> docker compose -f docker-compose.dev.yaml --env-file ./backend/.env up # with docker desktop
```

`Note:` You may have to type sudo in front of the *docker-compose* and *docker* commands.

### Linting

Make sure to lint the code before trying to make PRs and fix all lint issues

```bash
> cd ./backend/
> cd ./frontend/
> npm run eslint
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

```bash
# Build the docker images
> cd ./backend/ && docker build -t template-backend .
> cd ./frontend/ && docker build -t template-frontend .
# The app runs on localhost:5000
> docker-compose --env-file ./backend/.env up # with docker-compose
> docker compose --env-file ./backend/.env up # with docker desktop
```

## E2E tests in production mode

Run end-to-end tests (cypress)

```bash
> docker-compose --env-file ./backend/.env up # with docker-compose
> docker compose --env-file ./backend/.env up # with docker desktop
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
 