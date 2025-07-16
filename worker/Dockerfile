FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy your app
COPY . .

# If your app needs to launch Chrome standalone via chrome-launcher,
# install Chromium explicitly (optional — Playwright already has Chromium)
RUN apt-get update && apt-get install -y chromium-browser && apt-get clean

# Run your script
CMD ["node", "cron.js"]
