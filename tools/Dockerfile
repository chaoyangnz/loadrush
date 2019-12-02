FROM node:11-alpine

WORKDIR /app
COPY package*.json ./
COPY src ./src
COPY examples ./examples
COPY tsconfig.json ./

RUN npm i

ENV DEBUG=loadflux:*

CMD ["node_modules/.bin/ts-node", "examples/main.ts"]
