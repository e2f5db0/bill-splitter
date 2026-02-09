FROM node:20-alpine

ENV NODE_ENV production

WORKDIR /usr/src/template-backend

COPY package*.json ./

RUN npm ci --only=production

COPY . .

USER node

ENV DEBUG=false

CMD ["npm", "start"]
