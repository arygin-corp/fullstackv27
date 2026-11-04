# # BUILD STAGE
# # Use TMNA Golden Container for Node.js
# FROM 602213570624.dkr.ecr.us-east-1.amazonaws.com/tmna-node:20-alpine AS build

# WORKDIR /app

# # Copy dependency files first to leverage Docker cache
# COPY package*.json ./

# # Install dependencies
# RUN npm ci --legacy-peer-deps

# # Copy source code and build
# COPY . .
# RUN npm run build

# # SERVE STAGE
# # Use TMNA Golden Container for Nginx
# FROM 602213570624.dkr.ecr.us-east-1.amazonaws.com/tmna-nginx:1.25-alpine@sha256:456c6a47de166e97...

# # Copy custom nginx configuration
# COPY --chown=nginx:nginx nginx/default.conf /etc/nginx/conf.d/default.conf

# # Copy build artifacts from the build stage (Update path if your dist folder name differs)
# COPY --from=build --chown=nginx:nginx /app/dist/edmp-gdx-client-app/browser /usr/share/nginx/html

# # Security: Run as a non-root user
# USER nginx

# # Security: Implement Healthcheck
# HEALTHCHECK --interval=1m --timeout=3s --retries=3 \
#   CMD curl -f http://localhost/healthz || exit 1

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]






# BUILD STAGE
FROM 602213570624.dkr.ecr.us-east-1.amazonaws.com/tmna-node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# SERVE STAGE
FROM 602213570624.dkr.ecr.us-east-1.amazonaws.com/tmna-nginx:1.25-alpine

# Copy custom nginx configuration
COPY --chown=nginx:nginx nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts
COPY --from=build --chown=nginx:nginx /app/dist/edmp-gdx-client-app/browser /usr/share/nginx/html

# KICS FIX: Explicitly run as non-root
USER nginx

HEALTHCHECK --interval=1m --timeout=3s --retries=3 \
  CMD curl -f http://localhost/healthz || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]