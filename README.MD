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
api/        # Fastify-based REST API server
cron/       # Cron job scheduler to trigger worker jobs
frontend/   # React frontend (Vite + Mantine)
worker/     # Background worker for executing checks
assets/     # Static assets (e.g., logo)
```

## Getting Started

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

- **Frontend:**  
  ```sh
  cd frontend
  cp .env.dist .env
  npm install
  npm run dev
  ```
- **API:**  
  ```sh
  cd api
  cp .env.dist .env
  npm install
  npm run dev
  ```
- **Worker:**  
  ```sh
  cd worker
  cp .env.dist .env
  npm install
  npm run dev
  ```
- **Cron:**  
  ```sh
  cd cron
  cp .env.dist .env
  npm install
  npm start
  ```

## Usage

- Visit the frontend to add your website and view health checks.
- The worker runs periodic checks and stores results in MongoDB.
- The API provides endpoints for fetching status data.
- Custom flows can be configured for advanced checks.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the ISC License.

---

For more details, see the documentation in each subfolder or contact [mail@vincentwill.com](mailto:mail@vincentwill.com).