# StatusScout

StatusScout is an all-in-one status monitoring tool for websites and services. It tracks uptime, detects outages, checks for security issues, and provides instant alerts through a modern dashboard.

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

> Disclaimer: The self-hosting guide is in progress. Help me improving it by letting me know if you run into issues.

### Prerequisites

- Docker and docker-compose

### Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/vincenius/statusscout.git
   cd statusscout
   ```

2. Copy `.env.dist` to `.env` and fill in your secrets:
   ```sh
   cp .env.dist .env
   ```

3. Start all services using Docker Compose:
   ```sh
   docker compose up -d
   ```

4. Access the frontend at [http://localhost:3000](http://localhost:3000).


### Development

For developing you need:

- Node.js (v20+ recommended)
- MongoDB & Redis

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

## License

This project is licensed under a source-available license with restrictions on offering it as a hosted service.

This means it’s free and open for personal or commercial use, but you can’t resell it as a hosted service.
