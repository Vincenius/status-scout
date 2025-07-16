FROM mcr.microsoft.com/playwright:v1.54.0-noble

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy your app
COPY . .

# If your app needs to launch Chrome standalone via chrome-launcher,
# install Chromium explicitly (optional — Playwright already has Chromium)
RUN apt-get update && apt-get install -y chromium-browser && apt-get clean

# Run your script
CMD ["node", "cron.js"]
