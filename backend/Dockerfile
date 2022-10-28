FROM node:lts-alpine@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b

ENV NODE_ENV production

WORKDIR /usr/src/template-backend

COPY --chown=node:node . .

RUN npm ci --omit=dev

USER node

ENV DEBUG=false

CMD ["npm", "start"]