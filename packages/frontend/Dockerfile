FROM node:20-alpine AS build

WORKDIR /app

# Install corepack to enable Yarn 4
RUN corepack enable

# Copy monorepo root package.json and yarn.lock so workspaces are available
COPY package.json yarn.lock ./

# Copy packages and shared into the build context
COPY packages/ ./packages/

# Force node_modules mode (node-modules linker) and install from monorepo root so @statusscout/shared resolves as workspace
RUN yarn config set nodeLinker node-modules && yarn install --frozen-lockfile --production=false

# Accept build arguments from docker-compose
ARG VITE_BASE_URL
ARG VITE_API_URL
ARG VITE_ENABLE_ANALYTICS
ARG VITE_DISABLE_REGISTRATION

# Inject environment variables into a .env.production file for Vite inside the frontend package folder
RUN mkdir -p packages/frontend && \
    echo "VITE_ENABLE_ANALYTICS=${VITE_ENABLE_ANALYTICS}" > packages/frontend/.env.production && \
    echo "VITE_BASE_URL=${VITE_BASE_URL}" >> packages/frontend/.env.production && \
    echo "VITE_API_URL=${VITE_API_URL}" >> packages/frontend/.env.production && \
    echo "VITE_DISABLE_REGISTRATION=${VITE_DISABLE_REGISTRATION}" >> packages/frontend/.env.production && \
    echo "VITE_GTM_ID=${VITE_GTM_ID}" >> packages/frontend/.env.production && \
    echo "VITE_GTM_CONVERSION=${VITE_GTM_CONVERSION}" >> packages/frontend/.env.production && \
    echo "VITE_GTM_REGISTER=${VITE_GTM_REGISTER}" >> packages/frontend/.env.production && \
    echo "VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY}" >> packages/frontend/.env.production

# Build the frontend from the workspace
RUN yarn --cwd packages/frontend build

# Serve static files with nginx
FROM nginx:1.25-alpine

# Copy custom nginx config
COPY --from=build /app/packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=build /app/packages/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
