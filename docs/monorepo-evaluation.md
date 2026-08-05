# Monorepo vs. Multi-repo Evaluation

As part of the initial project scaffolding for DeTourist, we have chosen a monorepo structure with the following directories:

- `apps/mobile/` (React Native/Expo frontend)
- `services/backend/` (FastAPI Python backend)
- `packages/api-types/` (Shared types/API client)
- `infra/` (Terraform/Docker Compose)
- `docs/` (Architecture and planning)

This document evaluates whether this structure "earns its keep" compared to a multi-repo approach early in the development lifecycle.

## Why the Monorepo Structure Earns Its Keep

1. **API Contract Colocation (The Biggest Win)**:
   The primary technical justification for this setup is the tight coupling between the backend's OpenAPI schema and the mobile app's data structures via `packages/api-types`. In a multi-repo setup, coordinating API changes requires generating types in the backend repo, publishing them to a private npm registry (or using git submodules), and bumping versions in the mobile repo. In a monorepo with `pnpm workspaces`, the mobile app can consume local changes in `api-types` instantly during development.

2. **Unified E2E Testing**:
   A core component of the Testing Strategy (§18) is the Maestro E2E suite. Running full E2E tests often requires a specific backend version and a specific mobile app version. A monorepo guarantees that any commit on `main` represents a synchronized, working snapshot of both the backend and frontend.

3. **Streamlined Infrastructure**:
   Having `infra/docker-compose.yml` at the root allows developers to spin up the Postgres database, Redis, and backend services with a single `docker compose up` command, immediately ready to serve the mobile app running locally.

4. **Single Source of Truth for Documentation**:
   Product specs, roadmaps, and architecture docs apply to the system as a whole. Splitting them into backend/frontend repos leads to fragmentation and out-of-sync knowledge.

## When It Might Not Earn Its Keep (The Trade-offs)

1. **Tooling Overhead**:
   Since the backend is Python (Poetry) and the frontend/packages are JS/TS (pnpm), there is no single build orchestrator that naturally handles both natively. We rely on pnpm workspaces just to link the frontend to the generated types, while the backend sits somewhat isolated in `services/backend`. If the project grows and we introduce Turborepo to cache tasks, we'd have to write custom scripts to make it aware of Poetry.

2. **CI Pipeline Complexity**:
   A monorepo means every PR triggers the CI pipeline. To keep builds fast and reduce costs, the `.github/workflows/` must use path filtering (e.g., only running `mobile.yml` if files in `apps/mobile/` or `packages/api-types/` change). This requires careful initial setup and maintenance.

3. **Scale and Permissions**:
   If the team grows significantly, giving everyone read/write access to the entire codebase might be undesirable (though for a project of this scale, it's typically fine).

## Conclusion

At this early stage, the monorepo **is highly justified and earns its keep**.
The minor overhead of configuring path-based CI filtering is heavily outweighed by the developer experience of instantly synchronized API types (`packages/api-types`) and the ease of unified local environments and E2E testing. The decision to keep it a "plain pnpm workspace" instead of immediately introducing Turborepo (since there's only one frontend) is also a wise, pragmatic choice that avoids unnecessary complexity.
