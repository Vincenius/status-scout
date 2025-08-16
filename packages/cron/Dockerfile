FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy your app
COPY . .

# Run your script
CMD ["npm", "start"]