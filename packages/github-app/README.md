# Bounty Hub GitHub App

A GitHub App integration for the Bounty Hub platform that allows creating bounties directly from GitHub issues.

## Features

- Receive GitHub webhook events
- Create bounties from GitHub issues via slash commands
- Sync issue status with bounty status
- API endpoints for managing bounties on GitHub issues

## Setup

1. Create a GitHub App in your GitHub account:
   - Set webhook URL to your server's `/webhooks/github` endpoint
   - Generate a webhook secret and a private key
   - Required permissions:
     - Issues: Read & Write
     - Metadata: Read
     - Pull requests: Read
   - Subscribe to events:
     - Installation
     - Issues
     - Issue comment

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Then fill in the required GitHub App credentials and API connection details.

3. Install dependencies and run the app:
   ```bash
   pnpm install
   pnpm run dev
   ```

## Usage

### Creating a Bounty from a GitHub Issue

There are two ways to create a bounty from a GitHub issue:

1. **Via Slash Command**: 
   In the GitHub issue, add a comment with:
   ```
   /bounty 100 USD
   ```
   Replace `100` with the desired amount and `USD` with the currency.

2. **Via API Call**:
   ```
   POST /issues/bounty
   ```
   ```json
   {
     "installationId": 12345,
     "owner": "username",
     "repo": "repo-name",
     "issueNumber": 42,
     "amount": 100,
     "currency": "USD"
   }
   ```

## Integration with Bounty Hub API

The GitHub App communicates with the main Bounty Hub API to create and manage bounties:

1. When a `/bounty` command is detected in a GitHub issue comment, the GitHub App:
   - Fetches the issue details from GitHub
   - Calls the Bounty Hub API to create a new bounty
   - Posts a comment back to the GitHub issue with a link to the bounty

2. When an issue with a bounty is updated, closed, or reopened:
   - The GitHub App detects the changes via webhook
   - Updates the bounty status in the Bounty Hub API accordingly

## API Documentation

The API documentation is available at `/docs` when the server is running.

## Workflow

1. Install the GitHub App on a repository
2. Create an issue or use an existing one
3. Add a comment with `/bounty <amount> [currency]` to the issue
4. The app will create a bounty in the Bounty Hub platform
5. When the issue is closed, the bounty status will be updated

## Development

```bash
# Run in development mode
pnpm run dev

# Run tests
pnpm run test

# Build for production
pnpm run build
```