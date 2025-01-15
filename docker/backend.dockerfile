# Build stage
FROM golang:1.23-alpine AS builder

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
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o main ./cmd/api

# Final stage
FROM alpine:3.19

# Set working directory
WORKDIR /app

# Copy binary from builder
COPY --from=builder /build/main .

# Use root user
USER root

# Add metadata labels
LABEL maintainer="BiDi Menu" \
      version="1.0" \
      description="Backend API service"

# Expose API port
EXPOSE 8000

# Run the application
CMD ["/app/main"]