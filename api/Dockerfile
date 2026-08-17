# ---- Build ----
  FROM node:20-alpine AS builder

  WORKDIR /app
  
  COPY package.json package-lock.json ./
  RUN npm ci
  
  COPY . .
  RUN npm run build
  
  # ---- Production ----
  FROM node:20-alpine AS production
  
  WORKDIR /app
  
  # bcrypt precisa compilar no Alpine
  RUN apk add --no-cache python3 make g++
  
  COPY package.json package-lock.json ./
  RUN npm ci --omit=dev && apk del python3 make g++
  
  COPY --from=builder /app/build ./build
  COPY migrations ./migrations
  
  ENV NODE_ENV=production
  
  EXPOSE 3000
  
  COPY docker-entrypoint.sh ./
  RUN chmod +x docker-entrypoint.sh
  
  CMD ["./docker-entrypoint.sh"]