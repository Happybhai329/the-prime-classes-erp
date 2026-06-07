# Contributing to The Prime Classes ERP

Thank you for your interest in contributing to The Prime Classes ERP platform!

## Development Setup

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 20.x | Runtime |
| pnpm | ≥ 9.x | Package manager |
| Docker | Latest | PostgreSQL, Redis, MinIO |
| Git | Latest | Version control |

### Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/your-org/prime-erp.git
cd prime-erp

# 2. Start infrastructure
docker compose up -d

# 3. Install dependencies
pnpm install

# 4. Build shared types
pnpm --filter @prime/shared-types build

# 5. Setup database
pnpm --filter @prime/api exec prisma generate
pnpm --filter @prime/api exec prisma migrate dev --name init
pnpm --filter @prime/api exec prisma db seed

# 6. Start development
pnpm dev
```

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Integration branch |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `release/*` | Release candidates |

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Build, CI, dependencies |
| `perf` | Performance improvement |

### Scopes

`auth`, `students`, `batches`, `attendance`, `tests`, `fees`, `materials`, `notifications`, `reports`, `api`, `web`, `mobile`, `prisma`, `docker`, `ci`

### Examples

```
feat(auth): implement JWT refresh token rotation
fix(tests): correct ranking calculation for tied scores
docs(api): add Swagger annotations to fee endpoints
chore(docker): upgrade PostgreSQL to 16.2
```

## Code Standards

### TypeScript
- **Strict mode** enabled across all packages
- No `any` types unless absolutely necessary (document why)
- All public APIs must have JSDoc comments
- Use barrel exports (`index.ts`) for every module

### NestJS (Backend)
- One module per feature domain
- DTOs for all request/response shapes with class-validator decorators
- Use Prisma transactions for multi-table mutations
- All new endpoints must have Swagger `@ApiOperation` annotations
- Apply `@Permissions()` decorator for RBAC-protected routes

### React (Frontend)
- Feature-based folder structure (`features/<name>/`)
- Use TanStack Query for all API calls
- Zustand for global state only (auth, theme)
- Component-level state for UI state

### Prisma (Database)
- All model fields use `@map("snake_case")` for DB columns
- Every table must have `tenant_id` for multi-tenancy
- Soft delete via `deletedAt` timestamp (never hard delete user data)
- Add indexes for any field used in `WHERE` clauses

## Pull Request Process

1. Create a feature branch from `develop`
2. Write code following the standards above
3. Add/update tests as needed
4. Ensure `pnpm lint` passes
5. Ensure `pnpm build` succeeds
6. Open PR against `develop` with a clear description
7. Request review from at least one maintainer
8. Squash and merge after approval

## Security

- **Never commit secrets**, API keys, or credentials
- Use `.env` files (gitignored) for local secrets
- Report security vulnerabilities privately to the maintainers
- Follow OWASP guidelines for authentication and data handling
- Encrypt PII fields (Aadhar, etc.) at rest

## Questions?

Open a GitHub Discussion or reach out to the project maintainers.
