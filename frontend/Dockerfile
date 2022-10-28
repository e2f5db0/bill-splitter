# first stage
FROM node:16 AS build-stage

WORKDIR /usr/src/template-frontend

ENV REACT_APP_BACKEND_URL=http://localhost:3001

COPY . .

RUN npm install

RUN CI=true npm test

RUN npm run build

# second stage
FROM nginx:1.20-alpine

COPY --from=build-stage /usr/src/template-frontend/build /usr/share/nginx/html