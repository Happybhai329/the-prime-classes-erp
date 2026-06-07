# Changelog

All notable changes to The Prime Classes ERP will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-06-07

### 🎉 Phase 0: Foundation Complete

First release establishing the complete monorepo architecture, database schema, authentication system, and development infrastructure.

### Added

#### Monorepo & Tooling
- Turborepo monorepo with pnpm workspaces
- Three apps: `@prime/api` (NestJS), `@prime/web` (React + Vite), `@prime/shared-types`
- Docker Compose for local development (PostgreSQL 16, Redis 7, MinIO)
- Production Dockerfiles with multi-stage builds for API and Web
- Nginx reverse proxy configuration with rate limiting and security headers
- Environment configuration templates

#### Database (Prisma)
- **18 database models** covering all business domains:
  - `Tenant` — Multi-tenant foundation
  - `User` — Authentication with 6 roles
  - `Student`, `Parent`, `Faculty` — Core entities
  - `Batch`, `Subject`, `BatchStudent`, `BatchSubject` — Academic structure
  - `AttendanceSession`, `AttendanceRecord` — Attendance tracking
  - `Test`, `TestMarks`, `TestRanking` — Test & ranking system
  - `FeeStructure`, `FeeInvoice`, `FeePayment` — Fee management
  - `StudyMaterial` — Content management
  - `Notification`, `NotificationLog` — Push notification tracking
  - `AuditLog` — System audit trail
- **13 enumerations** for type-safe domain modeling
- Proper snake_case DB column mapping via `@map()`
- Composite unique constraints for multi-tenancy
- Optimized indexes on all query-heavy columns
- Soft delete support via `deletedAt` timestamps
- Development seed script with realistic test data

#### Authentication & Authorization
- JWT-based authentication (access + refresh tokens)
- Passport strategies for access and refresh token validation
- Bcrypt password hashing (12 salt rounds)
- Refresh token rotation with hash storage
- Login, logout, token refresh, password change endpoints
- Profile retrieval endpoint
- **40+ granular permissions** across 6 user roles
- RBAC permissions guard with decorator-based route protection
- `@Public()`, `@Permissions()`, `@CurrentUser()` custom decorators

#### NestJS API Core
- Global exception filter with standardized error envelope
- Response transform interceptor (`{ success, data, message }`)
- HTTP logging interceptor with slow-request warnings
- Global validation pipe (whitelist, transform, forbid non-whitelisted)
- Helmet security headers
- CORS configuration (configurable origins)
- Compression middleware
- ThrottlerGuard with multi-tier rate limiting
- Health check endpoint (`/api/v1/health`)
- Swagger/OpenAPI documentation (dev mode)
- 16 feature module skeletons (compilable stubs)

#### React Frontend Core
- Vite 6 build with React 18 and TypeScript 5.7
- Tailwind CSS design system with custom brand colors
- Inter + Outfit Google Fonts
- Custom CSS component classes (cards, buttons, inputs, badges, tables)
- Glassmorphism card styles
- Micro-animations (fade-in, slide-up, slide-in)
- Axios API client with JWT interceptor and automatic token refresh
- Failed-request queue during token refresh
- Zustand auth store with localStorage persistence
- React Router with placeholder login and dashboard pages
- TanStack Query client configured

#### Shared Types Package
- 16 TypeScript enumerations matching Prisma schema
- 40+ Permission enum constants
- Role-to-permission mapping matrix (6 roles × 40 permissions)
- 30+ DTO interfaces for all API contracts
- Dashboard summary types for Admin, Student, and Parent views

#### Documentation
- Professional README with architecture diagrams
- Contributing guide with branch strategy and code standards
- MIT License
- API environment variable documentation

### Security
- Passwords hashed with bcrypt (12 rounds)
- JWT secrets loaded from environment variables
- Refresh tokens stored as bcrypt hashes (not plaintext)
- Sensitive fields excluded from API responses
- Helmet security headers enabled
- CORS restricted to configured origins
- Rate limiting with multi-tier throttler
- `.gitignore` excludes all `.env` files (except `.env.example`)

---

## [Unreleased]

### Planned — Phase 1
- Login page UI with form validation
- Dashboard layout with sidebar navigation
- Protected route wrapper
- User CRUD API (Admin only)
- Password reset via email (Nodemailer + Gmail)
