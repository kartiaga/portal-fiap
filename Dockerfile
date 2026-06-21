FROM node:18-bullseye-slim

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD ["npx", "tsx", "src/server.ts"]
