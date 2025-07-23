FROM node:20-alpine AS build

WORKDIR /app

# Install corepack to enable Yarn 4
RUN corepack enable

# Copy only package.json and yarn.lock and install dependencies
COPY package*.json ./
COPY yarn.lock ./
RUN yarn

COPY . .

RUN yarn build

# Serve static files with nginx
FROM nginx:1.25-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
