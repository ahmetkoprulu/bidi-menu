# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /build

# Copy package files for better cache utilization
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy only necessary source files
COPY frontend/components ./components
COPY frontend/pages ./pages
COPY frontend/public ./public
COPY frontend/next.config.js ./
COPY frontend/postcss.config.js ./
COPY frontend/tailwind.config.js ./

# Set production environment
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Add non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files
COPY --from=builder /build/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application
COPY --from=builder /build/.next ./.next
COPY --from=builder /build/public ./public
COPY --from=builder /build/next.config.js ./

# Create config directory for environment files
RUN mkdir -p /app/config && \
    chown -R nextjs:nodejs /app/config

# Create volume for config
VOLUME ["/app/config"]

# Switch to non-root user
USER nextjs

# Add metadata labels
LABEL maintainer="BiDi Menu" \
      version="1.0" \
      description="Frontend Next.js application"

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]


# Project Root
# ├── frontend/
# │   └── config/          # Host directory
# │       ├── .env         # Your frontend environment file
# │       └── .env.example
# └── go/
#     └── config/          # Host directory
#         ├── .env         # Your backend environment file
#         └── .env.example