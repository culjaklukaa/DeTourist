# Branching and PR Conventions

This document outlines the standard branching model and pull request conventions for the DeTourist project. These guidelines feed directly into our CI gate design (as outlined in §18 of the project documentation).

## Branching Model

We use a feature-branch workflow. All development work should occur in dedicated branches and merge into `main` via Pull Requests.

- **`main`**: The primary branch. It is protected and must always be in a deployable state. Direct commits to `main` are restricted.
- **Feature Branches**: Used for developing new features.
  - Naming convention: `feat/<short-description>` or `feat/<issue-number>-<short-description>` (e.g., `feat/offline-fallback`, `feat/12-ocr-draft`)
- **Bugfix Branches**: Used for resolving bugs and issues.
  - Naming convention: `fix/<short-description>` or `fix/<issue-number>-<short-description>` (e.g., `fix/gps-drift`, `fix/34-route-score`)
- **Maintenance Branches**: Used for non-user-facing changes.
  - Naming convention: `chore/...`, `docs/...`, `refactor/...`, `test/...`

## Pull Request Conventions

When opening a Pull Request, ensure you follow these conventions:

1. **Meaningful Titles**: Use [Conventional Commits](https://www.conventionalcommits.org/) for your PR title. Examples:
   - `feat: implement offline-mode fallback for tracking`
   - `fix: correct uneven payment settlement logic`
   - `docs: update setup instructions`
2. **Detailed Description**: Provide a clear summary of what was changed and why. If the PR relates to an existing issue, link the issue in the description.
3. **Small and Focused**: Try to keep PRs focused on a single feature or bug fix to make the review process efficient and minimize merge conflicts.

## CI/CD Gates (Testing Strategy §18)

Our Continuous Integration pipeline ensures code quality and stability. The following rules are enforced on all PRs targeting the `main` branch:

### Pre-Merge Requirements (Required Status Checks)

Every PR must pass the following automated GitHub Actions checks before it can be merged:
- **Linting & Formatting**: Code must meet the project's styling and linting standards.
- **Unit Tests**: All unit tests (`*.test.ts(x)` for mobile, `test_*.py` for backend) must pass successfully. This explicitly includes tests for:
  - RouteScore calculation and pacing-tier logic
  - Settlement algorithms and uneven payments
  - OCR-draft confirmation state machine
- **Integration Tests**: The backend integration test suite must pass against the Docker-provisioned PostgreSQL + PostGIS instance, verifying API contracts, geospatial queries, and Celery task execution.

### Post-Merge / Scheduled Checks

To keep PR turnaround times fast, longer-running UI automation tests are deferred to post-merge workflows:
- **Mobile E2E Tests (Maestro)**: End-to-end user flows (trip setup, tracking session start/stop, expense entry, invite-code join, and offline-mode fallback) are executed nightly on the `main` branch and immediately prior to release builds.
