# StatusScout

StatusScout is an all-in-one status monitoring tool for websites and services. It tracks uptime, detects outages, checks for security issues, and provides instant alerts through a modern dashboard.

StatusScout is currently in active development. The initial release supports manual website health checks. The monitoring features will be available soon.

Run a health check on:

[https://statusscout.dev/](https://statusscout.dev/)

## Features

- Website health checks (SEO, accessibility, performance, security headers, sensitive files)
- Custom test flows
- Automated background worker for status checks
- Cron job scheduling
- REST API for data access
- Modern React frontend dashboard

## Project Structure

```
packages/api/        # Fastify-based REST API server
packages/cron/       # Cron job scheduler to trigger worker jobs
packages/frontend/   # App Frontend
packages/landing/    # Landing Page
packages/shared/     # Shared functions
packages/worker/     # Background worker for executing checks
assets/              # Static assets (e.g., logo)
```

## Getting Started

Disclaimer: The self-hosting guide is in progress. I'm working on a lot of improvements to make the inital setup way easier. Stay tuned!

### Prerequisites

- Node.js (v18+ recommended)
- Docker (for running services in containers)
- MongoDB & Redis (can be started via Docker Compose)

### Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/vincenius/status-scout.git
   cd status-scout
   ```

2. Copy `.env.dist` to `.env` and fill in your secrets:
   ```sh
   cp .env.dist .env
   ```

3. Start all services using Docker Compose:
   ```sh
   docker-compose up --build
   ```

4. Access the frontend at [http://localhost:5173](http://localhost:5173).

### Development

This project uses [Lerna](https://lerna.js.org/) for managing subprojects in the `packages/` folder.

1. Install dependencies for all packages:
```sh
npx lerna bootstrap
```

2. Run Frontend, API and Worker
```sh
yarn
yarn dev
```

Or run each package separately

- **Frontend:**  
  ```sh
  cd packages/frontend
  cp .env.dist .env
  yarn
  yarn dev
  ```
- **API:**  
  ```sh
  cd packages/api
  cp .env.dist .env
  yarn install
  yarn dev
  ```
- **Worker:**  
  ```sh
  cd packages/worker
  cp .env.dist .env
  yarn
  yarn dev
  ```
- **Cron:**  
  ```sh
  cd packages/cron
  cp .env.dist .env
  yarn
  yarn start
  ```

## Usage

- Visit the frontend to add your website and view health checks.
- The worker runs periodic checks and stores results in MongoDB.
- The API provides endpoints for fetching status data.
- Custom flows can be configured for advanced checks.

## License

This project is licensed under a source-available license with restrictions on offering it as a hosted service.

This means it’s free and open for personal or commercial use, but you can’t resell it as a hosted service.

---

For more details, see the documentation in each subfolder or contact [hello@statusscout.dev](mailto:hello@statusscout.dev).