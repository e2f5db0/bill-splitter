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

`Note:` Change these values before running docker compose and.

```bash
MONGO_ENV=development
DB_ROOT_USER=root
DB_ROOT_PASSWORD=supersecret # change this
DB_USER=the_user # change this
DB_PASSWORD=the_password # change this
DB_NAME=the_database # change this

# Replace the values in <> and remove the <>
MONGO_URL_DEV=mongodb://<same-as-DB_USER>:<same-as-DB_PASSWORD>@template-mongo-dev:27017/<same-as-DB_NAME>

# production mongo url (use same credentials in dev and prod, keep both safe)
MONGO_URL=mongodb://<DB_USER>:<DB_PASSWORD>@template-mongo:27017/<DB_NAME>

```

Now change the credentials in [mongo-init.js](https://github.com/e2f5db0/bill-splitter/blob/master/backend/mongo/mongo-init.js) to match the .env file. mongo-init.js cannot utilize dotenv, unfortunately.

`Note:` Do NOT push your credentials in *mongo-init.js* to github! You can for example add *mongo-init.js* to *.gitignore* after you have changed the credentials.

## Running the development containers

`Note:` Make sure you are not connected to a VPN or else the network created by docker-compose will be unreachable during development.

`Note:` It may be a good idea to delete *package-lock.json* files from both frontend and backend before continuing.

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

`Note:` Remember to change the .env variable MONGO_ENV from 'development' to 'production'!

`Note:` Remember also to set the variables in the environment where you deploy (ex. Heroku)!

If the database setup doesn't go smoothly, you can delete all containers, images and volumes from Docker desktop, and also run:

```bash
# all existing data in the database(s) will be lost
$ sudo rm -rf backend/mongo_data/
```

And then run from a clean slate in production mode:

```bash
# Create package-lock.json files, which are mandatory when building the production docker images
> cd ./backend/ && npm install
> cd ./frontend/ && npm install
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
 