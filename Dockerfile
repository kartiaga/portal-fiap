FROM node:18-bullseye-slim AS builder

WORKDIR /app
ENV NODE_ENV=development

# Install dependencies (prefer lockfile when present)
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

## Runtime image
FROM node:18-bullseye-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy built files and node_modules from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000
CMD ["node","build/server.js"]
