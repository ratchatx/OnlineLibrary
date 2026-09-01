# ============================================================
# Multi-Stage Production Dockerfile (Single-Container Target)
# Project: Online Library Management System
# Base Image: Node.js 20 LTS Alpine (Lightweight & Secure)
# ============================================================

# ------------------------------------------------------------
# STAGE 1: Frontend Build Stage
# Compiles React 18 + Vite 5 SPA into static assets (dist/)
# ------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------
# STAGE 2: Backend Production Dependencies Stage
# Installs only production dependencies (--omit=dev)
# ------------------------------------------------------------
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --omit=dev

# ------------------------------------------------------------
# STAGE 3: Final Production Runner Stage
# Bundles Express server and serves compiled React SPA from ./public
# ------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Copy production node_modules from Stage 2
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY backend/package*.json ./
COPY backend/src ./src

# Copy compiled frontend static assets from Stage 1 into ./public
COPY --from=frontend-builder /app/frontend/dist ./public

# Run as non-root user for enhanced security
RUN chown -R node:node /app
USER node

EXPOSE 5001

# Start the Express server
CMD ["node", "src/server.js"]
