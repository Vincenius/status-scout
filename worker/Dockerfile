FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy your app
COPY . .

# Run your script
CMD ["node", "cron.js"]
