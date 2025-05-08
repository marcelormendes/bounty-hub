# Bounty Hub

A streamlined platform connecting startups and open-source projects with talented developers and designers for specific tasks through bounties.

## What is Bounty Hub?

Bounty Hub is a platform that helps companies and open-source projects get things done by offering bounties for specific tasks. By connecting clients with a diverse pool of global talent, the platform enables a seamless, task-focused workflow without the overhead of traditional hiring.

## Features

- **Zero Bureaucracy**: No lengthy proposals or interviews. See a bounty, grab it, and start working.
- **Fair Chance for Everyone**: Skills and availability are what matter, not just established profiles.
- **Task-Focused**: Go straight to coding or designing without complications.
- **Quick Payments**: Fast and reliable payments via Stripe once your work is approved.
- **GitHub Integration**: Create bounties directly from GitHub issues and sync their status.
- **Client Dashboard**: Manage all your bounties, contributors, and payments in one place.
- **Contributor Profiles**: Showcase your completed bounties and build reputation.

## Project Architecture

This is a monorepo using Turborepo with pnpm workspaces:

- `packages/web` - Dashboard application for clients and contributors (Next.js, Tailwind, shadcn/ui)
- `packages/landing` - Landing page website (Next.js, Tailwind, shadcn/ui)
- `packages/api` - Backend API (NestJS, Prisma ORM, PostgreSQL)
- `packages/github-app` - GitHub App integration for issue/bounty synchronization

### Tech Stack

- **Frontend**:
  - Next.js 15 (App Router)
  - React 19
  - Tailwind CSS
  - shadcn/ui components
  - TypeScript

- **Backend**:
  - NestJS 11
  - Prisma ORM
  - PostgreSQL
  - Stripe integration
  - JWT authentication

- **GitHub Integration**:
  - Custom GitHub App
  - Webhooks for issue events
  - Slash commands for bounty creation

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker and Docker Compose (optional, for local database)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/bounty-hub.git
   cd bounty-hub
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Set up environment variables
   ```bash
   # Copy all example env files
   cp packages/api/.env.example packages/api/.env
   cp packages/web/.env.example packages/web/.env
   cp packages/github-app/.env.example packages/github-app/.env
   ```
   
4. Start the PostgreSQL database with Docker (optional)
   ```bash
   cd packages/api
   docker-compose up -d
   ```

5. Run database migrations
   ```bash
   cd packages/api
   pnpm prisma:migrate
   ```

6. Start the development servers
   ```bash
   # From the root directory
   pnpm run dev
   ```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all services in development mode |
| `pnpm build` | Build all packages for production |
| `pnpm lint` | Run ESLint on all packages |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run tests with Vitest |
| `pnpm prisma:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed the database with initial data |

## Database Setup

The API package includes a Docker Compose configuration for PostgreSQL:

1. Start the database:
   ```bash
   cd packages/api
   docker-compose up -d
   ```

2. Access pgAdmin (optional):
   - Visit http://localhost:5050
   - Login with admin@bounty-hub.com / admin
   - Connect to the PostgreSQL server with host `postgres`, username `postgres`, password `postgres`

## GitHub App Setup

To set up the GitHub App integration:

1. Create a GitHub App in your GitHub organization:
   - Webhook URL: Your server's `/webhooks/github` endpoint
   - Permissions: Issues (read/write), Metadata (read), Pull requests (read)
   - Events: Installation, Issues, Issue comment

2. Generate a private key and webhook secret

3. Configure the `.env` file in the `github-app` package with your GitHub App credentials

4. Start the GitHub App service with `pnpm dev` in the github-app directory

## Workflow

1. **Posting**: Companies/projects post bounties (linking GitHub issues or describing tasks with a defined price).
2. **Claiming**: Contributors claim bounties they want to work on.
3. **Working**: Contributors complete the task (code the feature, fix the bug, create the design).
4. **Delivery**: Contributors submit their work through the platform (PR link or design files).
5. **Approval**: Companies/projects review and approve the completed work.
6. **Payment**: Approval triggers automatic payment via Stripe to the contributor.

## Creating Bounties from GitHub Issues

You can create bounties directly from GitHub issues using:

1. **Slash Command**: Comment on any issue with `/bounty 100 USD` to create a $100 bounty
2. **Dashboard**: Link a GitHub issue to a new bounty through the Bounty Hub dashboard
3. **API**: Create bounties programmatically using the API

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Troubleshooting

### Common Issues

- **Database Connection Errors**: Make sure your PostgreSQL instance is running and the connection details in `.env` are correct
- **Missing Environment Variables**: Check that all required variables are set in the appropriate `.env` files
- **Port Conflicts**: Default ports are 3000 (web), 4000 (api), and 4100 (github-app)

## License

This project is licensed under the MIT License - see the LICENSE file for details.