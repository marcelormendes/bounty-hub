# Bounty Hub

A streamlined platform connecting startups and open-source projects with talented developers and designers for specific tasks.

## Features

- **Zero Bureaucracy**: No lengthy proposals or interviews. See a bounty, grab it, and start working.
- **Fair Chance for Everyone**: Skills and availability are what matter, not just established profiles.
- **Task-Focused**: Go straight to coding or designing without complications.
- **Quick Payments**: Fast and reliable payments via Stripe once your work is approved.

## Project Structure

This is a monorepo using Turborepo with the following packages:

- `packages/web` - Dashboard application for clients and contributors (Next.js, Tailwind, shadcn/ui)
- `packages/landing` - Landing page website (Next.js, Tailwind, shadcn/ui)
- `packages/api` - Backend API (NestJS, Prisma ORM, PostgreSQL)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL

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
   Create `.env` files in each package directory based on the provided examples.

4. Start the development servers
   ```bash
   pnpm run dev
   ```

## Workflow

1. **Posting**: Companies/projects post bounties (linking GitHub issues or describing design tasks with a defined price).
2. **Claiming**: Contributors claim bounties they want to work on.
3. **Working**: Contributors complete the task (code the feature, fix the bug, create the design).
4. **Delivery**: Contributors submit their work through the platform (PR link or design files).
5. **Approval**: Companies/projects review and approve the completed work.
6. **Payment**: Approval triggers automatic payment via Stripe to the contributor.

## License

This project is licensed under the MIT License - see the LICENSE file for details.