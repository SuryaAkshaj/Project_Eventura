FROM node:20-alpine AS base
RUN apk add --no-cache openssl curl
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Prune devDependencies
RUN npm prune --production

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD curl -fs http://localhost:4000/health || exit 1

# Start server — run migrations first, then start node
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]


