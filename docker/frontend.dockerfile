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

# Create volume for config
VOLUME ["/app"]

# Add metadata labels
LABEL maintainer="BiDi Menu Frontend" \
      version="1.0" \
      description="Frontend App"

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]


# Project Root
# ├── frontend/
# │   ├── .env         # Your frontend environment file
# │   └── .env.example
# └── backend/
#     └── storage/          # Host directory
#         ├── models
#         │   ├── glb
#         │   └── usdz
#         ├── thumbnails
#         └── qrcodes
#     ├── .env         # Your backend environment file
#     └── .env.example