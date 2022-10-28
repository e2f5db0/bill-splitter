FROM node:lts-alpine@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b

WORKDIR /usr/src/template-backend

COPY . .

RUN npm install

CMD ["npm", "run", "dev"]