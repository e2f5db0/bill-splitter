# first stage
FROM node:18-alpine AS build-stage

WORKDIR /usr/src/template-frontend

# Accept build argument for backend URL
ARG REACT_APP_BACKEND_URL=/api
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}
ENV DISABLE_ESLINT_PLUGIN=true
ENV BABEL_DISABLE_CACHE=1

COPY package.json yarn.lock* ./

RUN yarn install --frozen-lockfile || yarn install

# Remove the placeholder package that causes issues
RUN rm -rf node_modules/@babel/preset-env/node_modules/@babel/plugin-proposal-private-property-in-object

COPY . .

#RUN CI=true yarn test

# Suppress the babel warning by setting environment variable
RUN BABEL_ENV=production yarn build

# second stage
FROM nginx:1.20-alpine

COPY --from=build-stage /usr/src/template-frontend/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
