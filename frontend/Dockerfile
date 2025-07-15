FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_WEBSITE_NAME
ARG VITE_BASE_URL
ARG VITE_API_URL

ENV VITE_WEBSITE_NAME=$VITE_WEBSITE_NAME
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Serve static files with nginx
FROM nginx:1.25-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
