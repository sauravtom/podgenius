# Use the official Node.js 20 image with Alpine Linux for smaller size
FROM node:20-alpine AS base

# Install system dependencies including ffmpeg
RUN apk add --no-cache \
    ffmpeg \
    libc6-compat \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files from client directory
COPY client/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS deps
COPY client/package*.json ./
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app
COPY client/package*.json ./
RUN npm install --force

# Copy client source code
COPY client/ .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Install ffmpeg in production image
RUN apk add --no-cache \
    ffmpeg \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set up environment
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"] 