FROM node:20-alpine

WORKDIR /usr/src/template-backend

COPY . .

RUN npm install

CMD ["npm", "run", "dev"]
