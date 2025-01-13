# Build stage
FROM golang:1.21-alpine AS builder

# Add necessary build tools
RUN apk add --no-cache git

# Set working directory
WORKDIR /build

# Copy go mod files
COPY go/go.mod go/go.sum ./
RUN go mod download

# Copy source code
COPY go/ .

# Build the application with security flags
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o main ./cmd

# Final stage
FROM alpine:3.19

# Set working directory
WORKDIR /app

# Copy binary from builder
COPY --from=builder /build/main .

# Create storage directories as specified in custom instructions
RUN mkdir -p /storage/models /storage/qrcodes /storage/uploads && \
    chown -R appuser:appuser /storage && \
    chmod -R 755 /storage

# Create config directory for environment files
RUN mkdir -p /app/config && \
    chown -R appuser:appuser /app/config

# Create volume for persistent storage
VOLUME ["/storage/models", "/storage/qrcodes", "/storage/uploads"]
VOLUME ["/app/config"]

# Switch to non-root user
USER appuser

# Add metadata labels
LABEL maintainer="BiDi Menu" \
      version="1.0" \
      description="Backend API service"

# Expose API port
EXPOSE 8000

# Run the application with environment file from config volume
CMD ["./main"]