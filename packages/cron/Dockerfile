FROM node:20-alpine

WORKDIR /app

# Copy monorepo root package.json and yarn.lock so workspaces are available
COPY package.json yarn.lock ./

# Copy packages into image
COPY packages/ ./packages/

# Use yarn from root to install workspace deps so @statusscout/shared resolves locally
RUN corepack enable && yarn config set nodeLinker node-modules && yarn install --frozen-lockfile --production=false

WORKDIR /app/packages/cron

# Run your script
CMD ["node", "index.js"]