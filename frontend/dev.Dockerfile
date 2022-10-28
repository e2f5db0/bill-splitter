FROM node:16

WORKDIR /usr/src/template-frontend

ENV REACT_APP_BACKEND_URL=http://localhost:3001

COPY . .

# install all dependencies
RUN npm install

# run in development mode
CMD ["npm", "start"]