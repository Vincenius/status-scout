FROM node:20

WORKDIR /app

# Copy monorepo root package.json and yarn.lock so workspaces are available
COPY package.json yarn.lock ./

# Copy packages into image
COPY packages/ ./packages/

# Ensure yarn is used and install workspace deps from root so @statusscout/shared resolves locally
RUN corepack enable && yarn config set nodeLinker node-modules && yarn install --frozen-lockfile --production=false

# Copy api sources (already copied via packages/ but keep for clarity)
WORKDIR /app/packages/api

EXPOSE 4000

CMD ["node", "index.js"]
