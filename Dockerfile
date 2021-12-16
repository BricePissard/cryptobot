FROM node:current-alpine3.12 AS development
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

USER node
WORKDIR /usr/src/app

RUN npm install -g @nestjs/cli@7
RUN npm install glob rimraf ansi-styles
RUN npm install

COPY . .
COPY package*.json yarn.lock tsconfig*.json ./
COPY --from=development /usr/src/app/node_modules/ ./node_modules/
COPY --from=development /usr/src/app/dist ./dist

RUN npm ci \
    && npm run build \
    && npm prune --production

CMD ["node", "dist/main"]