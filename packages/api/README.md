# Bounty Hub API

Backend API for the Bounty Hub platform, built with NestJS, Prisma, and PostgreSQL.

## Getting Started with Docker

1. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

2. **Start PostgreSQL with Docker**:
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations**:
   ```bash
   pnpm prisma:migrate
   ```

4. **Generate Prisma client**:
   ```bash
   pnpm prisma:generate
   ```

5. **Start the API server**:
   ```bash
   pnpm dev
   ```

## Docker Services

The `docker-compose.yml` file sets up:

- **PostgreSQL**: Running on port 5432
  - Username: postgres
  - Password: postgres
  - Database: bounty_hub

- **PgAdmin** (optional): Running on http://localhost:5050
  - Email: admin@bounty-hub.com
  - Password: admin
  - Connect to the postgres service using host `postgres`

## API Documentation

Once the server is running, you can access the Swagger documentation at:
```
http://localhost:4000/api/docs
```

## GitHub App Integration

The API supports integration with the Bounty Hub GitHub App (in the `github-app` package). This allows:

1. Creating clients from GitHub App installations
2. Creating bounties from GitHub issues
3. Syncing issue status with bounty status

The GitHub App must be properly configured to communicate with this API.