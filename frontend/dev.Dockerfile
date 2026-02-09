FROM node:18-alpine

WORKDIR /usr/src/template-frontend

# Accept build argument for backend URL
ARG REACT_APP_BACKEND_URL=http://localhost:3001
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}

COPY package.json yarn.lock* ./

# install all dependencies
RUN yarn install

COPY . .

# run in development mode
CMD ["yarn", "start"]
