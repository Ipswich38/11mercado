# Multi-stage build for production AI Orchestrator
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ && \
    npm install -g typescript

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm ci --only=development

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build && \
    npm prune --production

# Production image
FROM node:18-alpine AS production

# Install runtime dependencies for ML/AI workloads
RUN apk add --no-cache \
    curl \
    ca-certificates \
    tzdata \
    python3 \
    py3-pip && \
    pip3 install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S orchestrator -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=orchestrator:nodejs /app/dist ./dist
COPY --from=builder --chown=orchestrator:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=orchestrator:nodejs /app/package.json ./

# Create directories for data and logs
RUN mkdir -p /app/data /app/logs && \
    chown -R orchestrator:nodejs /app/data /app/logs

# Switch to non-root user
USER orchestrator

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/app.js"]

# Labels for container metadata
LABEL maintainer="Cherwin Fernandez <11mercado.pta@gmail.com>"
LABEL description="AI Orchestrator for Mental Health Support - Production Backend"
LABEL version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/11mercado/ai-orchestrator"
LABEL org.opencontainers.image.description="Self-reliant AI orchestrator with intelligent routing, safety guardrails, and continuous learning for mental health applications"
LABEL org.opencontainers.image.licenses="MIT"