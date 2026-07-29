# DeTourist

App made for individual tourists exploring countries.

Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for branching and PR conventions.

## Project Structure

This repository uses a monorepo structure:
- `apps/mobile/`: React Native (Expo) mobile app.
- `services/backend/`: FastAPI Python backend (managed by Poetry).
- `packages/api-types/`: Shared TypeScript types and API client.
- `infra/`: Infrastructure as Code (Terraform) and Docker Compose configuration.

## Setup Instructions

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) (v9+)
- [Python](https://www.python.org/) (v3.12+)
- [Poetry](https://python-poetry.org/)
- [Docker & Docker Compose](https://www.docker.com/)

### 1. Frontend & Shared Packages (pnpm workspace)

The mobile app and the API types are managed within a pnpm workspace at the root of the project.

```bash
# From the repository root, install Node dependencies
pnpm install

# Start the mobile app
cd apps/mobile
pnpm start
```

### 2. Backend (Poetry)

The backend is intentionally kept outside the pnpm workspace and uses its own tooling.

```bash
# Navigate to the backend service
cd services/backend

# Install Python dependencies using Poetry
poetry install

# Activate the virtual environment
poetry shell

# Start the development server
fastapi dev app/main.py
```

### 3. Infrastructure & Local Services

To spin up the required local services (PostgreSQL + PostGIS, Redis, etc.):

```bash
# Start Docker services
cd infra
docker compose up -d
```
*(Note: `docker-compose.yml` is in progress).*
