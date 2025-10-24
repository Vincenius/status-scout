
FROM node:20-alpine AS build

WORKDIR /app

# Install corepack to enable Yarn 4
RUN corepack enable

# Copy monorepo root package.json and yarn.lock so workspaces are available
COPY package.json yarn.lock ./

# Copy packages into image
COPY packages/ ./packages/

# Use yarn from root to install workspace deps so local packages resolve
RUN yarn config set nodeLinker node-modules && yarn install --frozen-lockfile --production=false

# Accept build arguments from docker-compose
ARG VITE_BASE_URL
ARG VITE_APP_URL
ARG VITE_API_URL
ARG VITE_ENABLE_ANALYTICS

# Inject environment variables into a .env.production file for Vite inside the landing package
RUN mkdir -p packages/landing && \
    echo "VITE_ENABLE_ANALYTICS=${VITE_ENABLE_ANALYTICS}" > packages/landing/.env.production && \
    echo "VITE_BASE_URL=${VITE_BASE_URL}" >> packages/landing/.env.production && \
    echo "VITE_APP_URL=${VITE_APP_URL}" >> packages/landing/.env.production && \
    echo "VITE_API_URL=${VITE_API_URL}" >> packages/landing/.env.production

# Build the landing package
RUN yarn --cwd packages/landing build

# Serve static files with nginx
FROM nginx:1.25-alpine

# Copy custom nginx config
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
