<div align="center">

# 🎖️ The Prime Classes — ERP Platform

### Military School Entrance Preparation Institute

**Production-grade ERP + Student Management + Parent Portal + Mobile Application**

[![Version](https://img.shields.io/badge/version-v0.1.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-red.svg)](https://nestjs.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org)

---

*Centralized platform managing students, parents, faculty, attendance, tests, rankings, fees, notifications, and reports for coaching institutes preparing students for Sainik School, RMS, RIMC, and Military School Scholarship exams.*

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [RBAC Permissions](#-rbac-permissions)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Modules

| Module | Status | Description |
|--------|--------|-------------|
| 🔐 Authentication | ✅ Done | JWT + Refresh Tokens, RBAC, 6 Roles |
| 👨‍🎓 Student Management | 🔲 Phase 2 | Registration, Profiles, Batch Allocation |
| 📚 Batch Management | 🔲 Phase 2 | Sainik/RMS/RIMC/Foundation Batches |
| 📋 Attendance | 🔲 Phase 3 | Daily + Subject-wise, Parent Alerts |
| 📝 Test & Ranking | 🔲 Phase 4 | Weekly/Monthly/Mock Tests, Merit Lists |
| 💰 Fee Management | 🔲 Phase 5 | Razorpay Integration, Receipts |
| 📖 Study Materials | 🔲 Phase 6 | Notes, Homework, Assignments |
| 🔔 Notifications | 🔲 Phase 3 | Firebase FCM Push Notifications |
| 📊 Reports | 🔲 Phase 6 | Attendance, Performance, Fee Reports |
| 👨‍👩‍👧 Parent Portal | 🔲 Phase 7 | Child Tracking, Fee Status |
| 📱 Mobile App | 🔲 Phase 7 | Flutter Android App |

### Target Exams
- **AISSEE** — Sainik School Entrance Exam
- **RMS** — Rashtriya Military School
- **RIMC** — Rashtriya Indian Military College
- **Scholarship** — Military School Scholarship Exams
- **Foundation** — Foundation Batches

### User Roles
| Role | Access Level |
|------|-------------|
| Super Admin | Full system access |
| Institute Admin | Institute-wide management |
| Faculty | Attendance, tests, materials |
| Student | Own records, materials |
| Parent | Child tracking, fees |
| Accountant | Fee management, reports |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  React Web   │  │ Flutter App  │  │  Admin Dashboard │  │
│  │ (Vite + TS)  │  │  (Android)   │  │  (React + TS)    │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────┼─────────────────┼────────────────────┼────────────┘
          └─────────────────▼────────────────────┘
                            │ HTTPS / JWT
                ┌───────────▼───────────┐
                │   Nginx Reverse Proxy  │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │   NestJS API Server    │
                │   (REST + WebSocket)   │
                └──┬──────────────┬─────┘
                   │              │
        ┌──────────▼──┐    ┌─────▼───────────┐
        │  PostgreSQL  │    │  Redis Cache    │
        │  (Prisma)    │    │  + Bull Queue   │
        └──────────────┘    └─────────────────┘
                   │
        ┌──────────▼──────────┐
        │  MinIO File Storage  │
        └─────────────────────┘
```

### Multi-Tenancy Strategy

| Phase | Strategy | Use Case |
|-------|----------|----------|
| Phase 1 (Current) | Shared DB, row-level `tenant_id` | Single institute |
| Phase 2 (SaaS) | Schema-per-tenant | Multiple institutes |
| Phase 3 (Enterprise) | Database-per-tenant | Large enterprises |

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| NestJS | 10.x | API framework |
| TypeScript | 5.7 | Type safety |
| Prisma | 6.x | ORM + migrations |
| PostgreSQL | 16 | Primary database |
| Redis | 7 | Cache + job queues |
| Bull | 4.x | Background jobs |
| Passport | 0.7 | JWT authentication |
| Swagger | 8.x | API documentation |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI framework |
| Vite | 6.x | Build tool |
| TypeScript | 5.7 | Type safety |
| Tailwind CSS | 3.4 | Styling |
| TanStack Query | 5.x | Data fetching |
| Zustand | 5.x | State management |
| React Router | 6.x | Routing |
| Recharts | 2.x | Charts & analytics |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| Docker Compose | Local development |
| Nginx | Reverse proxy + SSL |
| MinIO | S3-compatible file storage |
| Firebase FCM | Push notifications |
| Razorpay | Payment gateway |

---

## 📁 Project Structure

```
prime-erp/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema (18 models)
│   │   │   └── seed.ts         # Development seed data
│   │   └── src/
│   │       ├── common/         # Guards, filters, interceptors, decorators
│   │       ├── database/       # Prisma service
│   │       └── modules/        # Feature modules (16 modules)
│   │           ├── auth/       # ✅ JWT + RBAC
│   │           ├── students/   # Student CRUD
│   │           ├── batches/    # Batch management
│   │           ├── attendance/ # Attendance tracking
│   │           ├── tests/      # Test & ranking
│   │           ├── fees/       # Fee collection
│   │           └── ...
│   │
│   └── web/                    # React Frontend
│       └── src/
│           ├── features/       # Feature modules
│           ├── lib/            # API client, utilities
│           └── store/          # Zustand stores
│
├── packages/
│   └── shared-types/           # Shared TypeScript types
│       └── src/
│           ├── enums.ts        # All enumerations
│           ├── permissions.ts  # RBAC permission matrix
│           └── dto.ts          # API contract interfaces
│
├── infrastructure/
│   ├── docker/                 # Production Dockerfiles
│   └── nginx/                  # Nginx configuration
│
├── docker-compose.yml          # Local dev infrastructure
├── turbo.json                  # Turborepo pipeline
└── pnpm-workspace.yaml         # Monorepo workspaces
```

---

## 📦 Prerequisites

| Requirement | Version | Installation |
|------------|---------|-------------|
| **Node.js** | ≥ 20.0 | [nodejs.org](https://nodejs.org) |
| **pnpm** | ≥ 9.0 | `npm install -g pnpm` |
| **Docker** | Latest | [docker.com](https://docker.com) |
| **Git** | Latest | [git-scm.com](https://git-scm.com) |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-org/prime-erp.git
cd prime-erp
pnpm install
```

### 2. Start Infrastructure

```bash
# Starts PostgreSQL 16, Redis 7, MinIO
docker compose up -d
```

### 3. Setup Database

```bash
# Build shared types first
pnpm --filter @prime/shared-types build

# Generate Prisma client
pnpm --filter @prime/api exec prisma generate

# Run migrations
pnpm --filter @prime/api exec prisma migrate dev --name init

# Seed development data
pnpm --filter @prime/api exec prisma db seed
```

### 4. Start Development

```bash
# Start all apps in parallel
pnpm dev

# Or start individually:
pnpm --filter @prime/api dev     # API  → http://localhost:3000
pnpm --filter @prime/web dev     # Web  → http://localhost:5173
```

### 5. Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| API | http://localhost:3000 | — |
| Swagger Docs | http://localhost:3000/docs | — |
| Web App | http://localhost:5173 | — |
| MinIO Console | http://localhost:9001 | `prime_minio` / `prime_minio_2025` |
| Prisma Studio | `pnpm db:studio` | — |

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@primeclasses.in` | `Prime@2025` |
| Admin | `admin@primeclasses.in` | `Prime@2025` |
| Faculty | `faculty@primeclasses.in` | `Prime@2025` |
| Accountant | `accountant@primeclasses.in` | `Prime@2025` |
| Student | `arjun.sharma@student.primeclasses.in` | `Prime@2025` |
| Parent | `vikram.sharma@parent.primeclasses.in` | `Prime@2025` |

> ⚠️ **Change all default passwords before any production deployment.**

---

## 🔐 Environment Variables

Copy the example environment file and configure:

```bash
cp apps/api/.env.example apps/api/.env
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Environment mode |
| `PORT` | Yes | `3000` | API server port |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `REDIS_HOST` | Yes | `localhost` | Redis hostname |
| `JWT_ACCESS_SECRET` | Yes | — | JWT signing secret (change in prod!) |
| `JWT_REFRESH_SECRET` | Yes | — | Refresh token secret |
| `MINIO_ENDPOINT` | Yes | `localhost` | MinIO S3 endpoint |
| `MINIO_ACCESS_KEY` | Yes | — | MinIO access key |
| `MINIO_SECRET_KEY` | Yes | — | MinIO secret key |
| `RAZORPAY_KEY_ID` | No | — | Razorpay test/live key |
| `RAZORPAY_KEY_SECRET` | No | — | Razorpay secret |
| `SMTP_USER` | No | — | Gmail SMTP user |
| `SMTP_PASSWORD` | No | — | Gmail app password |
| `FIREBASE_PROJECT_ID` | No | — | FCM project ID |

---

## 📖 API Documentation

Interactive API documentation is available via Swagger UI when running in development mode:

**http://localhost:3000/docs**

### API Conventions

- **Base URL:** `/api/v1`
- **Auth:** Bearer JWT token in `Authorization` header
- **Pagination:** `?page=1&limit=20&sortBy=createdAt&sortOrder=desc`
- **Search:** `?search=<term>`
- **Response:** `{ success: true, data: {...}, message: "OK" }`
- **Error:** `{ success: false, error: { code, message, details } }`

---

## 🗄️ Database Schema

18 models across all business domains:

| Domain | Models | Key Relationships |
|--------|--------|-------------------|
| Core | Tenant, User | User → Tenant (M:1) |
| Students | Student, Parent, StudentParentMap | Student ↔ Parent (M:N) |
| Academic | Batch, Subject, BatchStudent, BatchSubject | Student ↔ Batch (M:N) |
| Attendance | AttendanceSession, AttendanceRecord | Session → Records (1:N) |
| Testing | Test, TestMarks, TestRanking | Test → Marks → Ranking |
| Finance | FeeStructure, FeeInvoice, FeePayment | Invoice → Payments (1:N) |
| Content | StudyMaterial | Linked to Batch + Subject |
| Communication | Notification, NotificationLog | Notification → Logs (1:N) |
| System | AuditLog | Tracks all data mutations |

Visual schema: `pnpm db:studio`

---

## 🛡️ RBAC Permissions

40+ granular permissions across 6 roles. See [permissions.ts](packages/shared-types/src/permissions.ts) for the complete matrix.

---

## 🐳 Deployment

### Docker Production Build

```bash
# Build API image
docker build -f infrastructure/docker/Dockerfile.api -t prime-erp-api .

# Build Web image
docker build -f infrastructure/docker/Dockerfile.web -t prime-erp-web .
```

### VPS Deployment (Planned)

```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## 🗺️ Roadmap

| Phase | Milestone | Status |
|-------|-----------|--------|
| 0 | Foundation (Monorepo, DB, Auth, RBAC) | ✅ Complete |
| 1 | Login UI + User Management | 🔲 Planned |
| 2 | Student + Batch + Faculty | 🔲 Planned |
| 3 | Attendance + Notifications | 🔲 Planned |
| 4 | Test & Ranking (Critical) | 🔲 Planned |
| 5 | Fee Management + Razorpay | 🔲 Planned |
| 6 | Study Materials + Reports | 🔲 Planned |
| 7 | Flutter Mobile App | 🔲 Planned |
| 8 | Production Hardening | 🔲 Planned |
| 9 | SaaS Multi-Tenancy | 🔲 Future |

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, branch strategy, commit conventions, and code standards.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ for The Prime Classes**

*Building Future Military Leaders*

</div>
