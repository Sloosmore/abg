# Build stage
FROM node:20-alpine AS builder

# Install dependencies for node-gyp
RUN apk add --no-cache python3 make g++ gcc

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Copy env file for build
COPY .env.production .env.production

# Build with env vars
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.env.production ./.env.production

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]