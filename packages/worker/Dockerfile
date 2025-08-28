FROM mcr.microsoft.com/playwright:v1.55.0-jammy

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy your app
COPY . .

# Run your script
CMD ["npm", "start"]
