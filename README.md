# 🏛️ The Prime Classes — Enterprise Coaching ERP Platform

> **Production-grade Multi-Tenant ERP, Computer-Based Test (CBT) Examination Engine, Student Lifecycle Management, Parent Portal & Cross-Platform Mobile Suite** engineered specifically for Premier Military Entrance Coaching Institutes (**AISSEE**, **RMS**, **RIMC**, and **Defense Foundation**).

---

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444?logo=turborepo&logoColor=white)](https://turbo.build/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Native](https://img.shields.io/badge/React_Native-Expo-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Target Examinations](#-target-examinations)
- [System Architecture](#-system-architecture)
- [Key Features & Modules](#-key-features--modules)
- [Tech Stack](#-tech-stack)
- [Monorepo Structure](#-monorepo-structure)
- [User Roles & Permissions (RBAC)](#-user-roles--permissions-rbac)
- [Prerequisites](#-prerequisites)
- [Quick Start & Installation](#-quick-start--installation)
- [Environment Variables](#-environment-variables)
- [Running the Platform](#-running-the-application)
- [Default Login Credentials](#-default-login-credentials)
- [API Platform & Documentation](#-api-platform--documentation)
- [Observability, Reliability & Backups](#-observability-reliability--backups)
- [Contributing](#-contributing)
- [License](#-license)
- [Author & Acknowledgments](#-author)

---

## 🎯 Overview

**The Prime Classes ERP** is an end-to-end, enterprise-ready digital platform purpose-built for military school entrance preparation institutes. Combining academic governance, computer-based test (CBT) engines, intelligent predictive analytics, fee processing, multi-branch franchise rollups, and a unified mobile app, it digitizes every touchpoint across students, parents, faculty, counselors, accountants, branch managers, and institute administrators.

### Core Value Propositions
- 🎖️ **Defense Entrance Exam Specialization**: Custom test structures matching AISSEE, RMS, and RIMC syllabus patterns with negative marking, time-bound sectional constraints, and OMR/CBT capabilities.
- 🏢 **Multi-Branch & Franchise Scalability**: Multi-tenant architecture supporting independent branch operations, royalty billing, shared study repositories, and consolidated head-office executive dashboards.
- 🤖 **AI-Driven Academic Predictions**: Built-in probability scoring engine predicting student qualification chances across defense exams based on attendance and historical test trajectory.
- 📱 **Unified Cross-Platform Mobile Experience**: Comprehensive React Native & Expo app with dedicated sub-dashboards for Students, Parents, Faculty, and Branch Admins including offline support.
- 🛡️ **Enterprise Security & Observability**: Strict tenant data isolation guards, audit logs, automated PostgreSQL/MinIO disaster recovery drills, Prometheus metrics, and Grafana Tempo tracing.

---

## 🎖️ Target Examinations

The platform includes specialized curriculum configurations, test blueprints, and scoring templates tailored for:

| Exam | Full Name | Target Classes | Special Requirements |
|---|---|---|---|
| **AISSEE** | All India Sainik Schools Entrance Examination | Class 6 & Class 9 | Strict time constraints, OMR ranking, scholarship calculations |
| **RMS** | Rashtriya Military Schools Common Entrance Test (CET) | Class 6 & Class 9 | Negative marking schemes, interview qualification tracking |
| **RIMC** | Rashtriya Indian Military College Entrance Exam | Class 8 | Subjective evaluation, interview prep, state-quota ranking |
| **Military Scholarships** | State & Central Armed Forces Scholarships | All Classes | Eligibility filtering, fee waivers, merit scholarship ledgers |
| **Foundation Programs** | Pre-cadet early foundation courses | Classes 3–5 | Continuous micro-assessments, foundational mastery tracking |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                               CLIENT APPS                                   │
│  ┌───────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐  │
│  │    Web Portal (SPA)   │  │   Mobile App (Expo) │  │ External Partners │  │
│  │  React 18 + Vite + TS │  │  React Native + TS  │  │   & Public APIs   │  │
│  └───────────┬───────────┘  └──────────┬──────────┘  └─────────┬─────────┘  │
└──────────────┼─────────────────────────┼───────────────────────┼────────────┘
               │ HTTPS / WSS / JWT Auth  │                       │ API Key
               ▼                         ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NGINX REVERSE PROXY                                │
│          Rate Limiting • SSL Termination • Compression • Static Caching     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NESTJS BACKEND API                                │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Common: Tenant Guards • RBAC Guard • Metrics • Global Error Filters   │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │ 25+ Feature Modules:                                                  │  │
│  │  • Auth & Users        • Students & Parents   • Batches & Faculty     │  │
│  │  • Attendance Engine   • Offline & CBT Tests  • Question Bank Engine  │  │
│  │  • Fees & Razorpay     • CRM & Lead Funnel    • Announcements & SMS   │  │
│  │  • Digital Library     • Analytics & AI Pred  • Franchise & Rollup    │  │
│  │  • Developer API       • Disaster Recovery    • Telemetry & Metrics   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└──────────┬───────────────────┬───────────────────┬───────────────────┬──────┘
           │                   │                   │                   │
           ▼                   ▼                   ▼                   ▼
┌────────────────────┐ ┌───────────────┐ ┌───────────────────┐ ┌───────────────┐
│ PostgreSQL 16      │ │ Redis 7       │ │ MinIO S3 Storage  │ │ Observability │
│ Multi-Tenant DB    │ │ Cache, BullMQ │ │ Materials, Docs,  │ │ Prometheus,   │
│ Prisma ORM Schema  │ │ Rate Limiting │ │ Reports, Receipts │ │ Grafana, Tempo│
└────────────────────┘ └───────────────┘ └───────────────────┘ └───────────────┘
```

---

## 🚀 Key Features & Modules

### 1. 🎓 Student Lifecycle & Admissions Management
- **Centralized Profiles**: Complete student biographical data, target school aspiration, admission records, guardian maps, and enrollment records.
- **Batch Allocations**: Seamless assignment to specific exam batches (e.g. *Sainik Class 6 Super-30*, *RMS Target Batch*), with one-click inter-batch transfer tracking.
- **Document Locker**: Encrypted storage for birth certificates, domicile papers, caste certificates, previous marksheets, and medical fitness certificates via MinIO S3.

### 2. 📝 Online CBT & Offline Test Engine
- **Computer-Based Tests (CBT)**: Timed digital exam experience with real-time countdown, question palettes (answered, flagged, unattempted), auto-save question attempt states, and instant result computation.
- **Question Bank Engine**: Topic-wise categorization (Mathematics, General Intelligence, Language, General Science, Social Studies), difficulty weighting, and automated test paper generation from presets.
- **Bulk Import**: Rapid spreadsheet/CSV question paper ingestion.
- **OMR & Offline Marks Entry**: Batch marks capture for physical classroom mock tests.
- **Merit & Ranking Calculation**: Automatic percentile, section-wise rank, national standing, and comparative performance indicators.

### 3. ⏱️ Attendance & Campus Monitoring
- **Dual Attendance Modes**: Daily attendance and subject/lecture-wise attendance marking.
- **Batch Attendance**: Bulk check-in view for teachers with instant absent/late marking.
- **Parent Notifications**: Automatic SMS/push alert triggers sent to parents upon unexcused absence.
- **Attendance Percentage Tracking**: Configurable cutoff warnings ensuring minimum exam eligibility criteria.

### 4. 💳 Enterprise Fee Management & Online Collection
- **Flexible Fee Plans**: Course fees, hostel charges, uniform fees, study kit costs, and scholarship concessions.
- **Installment Automation**: Due-date schedule generator, automated overdue penalties, and fine waivers.
- **Payment Gateway**: Seamless **Razorpay** integration for debit/credit cards, UPI, net banking, and wallets.
- **Automated Invoicing & Receipts**: Instant GST-compliant PDF receipt generation with downloadable history and complete student ledgers.
- **Refund Workflows**: Formal refund request submission, multi-step approval, and audit logs.

### 5. 🤖 Predictive Analytics & Academic AI
- **Qualification Probability Predictor**: Statistical scoring algorithm evaluating student test consistency, difficulty-adjusted marks, and historical cutoffs to forecast AISSEE/RMS success probability.
- **Weak-Area Recommendations**: Automatic detection of sub-par topic performance with actionable remedial suggestions.
- **Executive PDF Report Cards**: Automated generation of student diagnostic progress reports for parent-teacher conferences.

### 6. 📱 Multi-Role Cross-Platform Mobile App (Expo)
- **Student App**: Daily class schedules, offline exam review, live CBT tests, assignment submissions, digital study materials, and gamified leaderboards.
- **Parent App**: Real-time child attendance alerts, fee invoice payments, test scores & rank progress, school circulars, and teacher communication tickets.
- **Faculty App**: Mobile attendance marker, test creation, student marks upload, and homework assignment distributor.
- **Admin App**: Daily campus revenue summaries, fee collection monitor, and attendance overview.
- **Offline Reliability**: Real-time network detection with offline sync alerts.

### 7. 📈 Admissions CRM, Campaigns & Branch Website Builder
- **Enquiry Pipeline**: Complete lead lifecycle from enquiry, tele-counseling, demo class attendance, to enrollment.
- **Counselor Performance**: Activity logs, scheduled follow-up reminders, and conversion metric dashboards.
- **Marketing Campaigns**: SMS & WhatsApp campaign orchestrator with audience segment filters.
- **Integrated Website Builder**: Lightweight CMS allowing coaching branches to publish localized admission landing pages, hero banners, and notices.

### 8. 🏢 Multi-Branch & Franchise Management
- **Head Office Dashboard**: Multi-center visibility aggregating student counts, faculty allocations, test averages, and collections across franchise branches.
- **Royalty & Franchise Billing**: Structured franchise invoicing, royalty percentage calculations, and payment tracking.
- **Org Hierarchy**: Tiered structure supporting Regional Hubs, Franchise Centers, and Owned Campuses.

### 9. 🔌 Developer Platform & Public APIs
- **API Key Management**: Secure scoped API keys with HMAC/AES secret ciphers for third-party LMS, biometric devices, or mobile partners.
- **Rate Limiting & Telemetry**: Redis-backed sliding-window rate limiters per tenant/key.
- **Webhooks**: Event-driven webhook delivery for payment events, admission completions, and test publications.

---

## 🛠️ Tech Stack

| Category | Technology | Description |
|---|---|---|
| **Backend Framework** | [NestJS 10.x](https://nestjs.com/) | Modular TypeScript server framework |
| **Language & Runtime** | [TypeScript 5.7](https://www.typescriptlang.org/) / [Node.js 20+](https://nodejs.org) | Strict type safety across the monorepo |
| **Monorepo Manager** | [Turborepo](https://turbo.build/) & [pnpm](https://pnpm.io/) | High-performance cached build system and package manager |
| **ORM** | [Prisma 6.x](https://www.prisma.io/) | Next-generation ORM with automated migrations and type generation |
| **Primary Database** | [PostgreSQL 16](https://www.postgresql.org/) | Enterprise relational database with multi-tenant row scoping |
| **Caching & Queues** | [Redis 7](https://redis.io/) & [Bull 4.x](https://github.com/OptimalBits/bull) | Background jobs, rate-limiting, and distributed cache |
| **File Storage** | [MinIO](https://min.io/) | High-performance S3-compatible object storage |
| **Web Frontend** | [React 18](https://react.dev/) + [Vite 6](https://vitejs.dev/) | High-speed single-page application framework |
| **Styling & UI** | [Tailwind CSS 3.4](https://tailwindcss.com/) | Utility-first responsive design with Lucide icons |
| **State & Data Fetching**| [TanStack Query 5](https://tanstack.com/query) & [Zustand 5](https://zustand-demo.pmnd.rs/) | Server cache orchestration and client state management |
| **Mobile App** | [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) | Cross-platform iOS and Android application |
| **Authentication** | [Passport](http://www.passportjs.org/) + [JWT](https://jwt.io/) | Stateless access tokens + rotating refresh tokens |
| **Payments** | [Razorpay](https://razorpay.com/) | Payment gateway for cards, UPI, net banking |
| **Notifications** | [Firebase Cloud Messaging](https://firebase.google.com/products/cloud-messaging) | Real-time push alerts to Android & iOS devices |
| **Observability** | [Prometheus](https://prometheus.io/) + [Grafana](https://grafana.com/) + [Tempo](https://grafana.com/oss/tempo/) | Metrics scraping, visual dashboarding, and distributed tracing |
| **Reverse Proxy** | [Nginx](https://nginx.org/) | Production reverse proxy, TLS termination, and compression |

---

## 📂 Monorepo Structure

```
the-prime-classes-erp/
├── apps/
│   ├── api/                          # NestJS Backend API Server
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Database schema (130+ KB, 30+ relational models)
│   │   │   ├── migrations/           # Database migration history
│   │   │   └── seed.ts               # Demo data seeding script
│   │   └── src/
│   │       ├── common/               # Guards, interceptors, filters, decorators, middleware
│   │       ├── database/             # Prisma service and connection handlers
│   │       ├── modules/              # 25+ Functional domain modules:
│   │       │   ├── achievements/     # Gamification badges & leaderboards
│   │       │   ├── admissions/       # Student enrollment and verification
│   │       │   ├── analytics/        # Predictions, recommendations, PDF reports
│   │       │   ├── api-platform/     # API keys, webhooks, developer platform
│   │       │   ├── assignments/      # Homework assignment & grading
│   │       │   ├── attendance/       # Session scheduling & bulk attendance
│   │       │   ├── audit/            # Data mutation audit trail
│   │       │   ├── auth/             # JWT auth, refresh tokens, password reset
│   │       │   ├── batches/          # Class batches & student allocation
│   │       │   ├── crm/ & sales/     # Lead capture, counselor tracker, pipelines
│   │       │   ├── enterprise/       # Multi-tenant rollups & organization hierarchy
│   │       │   ├── fees/             # Fee plans, installments, Razorpay payments, refunds
│   │       │   ├── franchise/        # Franchise centers & royalty billing
│   │       │   ├── materials/        # Study notes, question banks, digital library
│   │       │   ├── notifications/    # Firebase FCM push notification dispatcher
│   │       │   ├── observability/    # OpenTelemetry metrics collector
│   │       │   ├── online-tests/     # CBT exam engine, auto-save state, grading
│   │       │   ├── storage/          # MinIO S3 object storage service
│   │       │   ├── students/         # Student CRUD and lifecycle management
│   │       │   ├── super-admin/      # System administrator control plane
│   │       │   ├── support-desk/     # Helpdesk and communication tickets
│   │       │   └── website/          # Branch CMS & landing page generator
│   │       ├── main.ts               # Backend bootstrapping & Swagger config
│   │       └── telemetry.ts          # OpenTelemetry instrumentation
│   │
│   ├── web/                          # React 18 + Vite Web Application
│   │   └── src/
│   │       ├── components/           # Reusable UI library (Tables, Modals, Shell, Navigation)
│   │       ├── hooks/                # Custom React Query data hooks for all API resources
│   │       ├── lib/                  # Axios client, error loggers, formatters
│   │       ├── pages/                # 30+ Domain pages:
│   │       │   ├── analytics/        # Predictions & Faculty Insights dashboards
│   │       │   ├── attendance/       # Mark attendance & attendance reports
│   │       │   ├── crm/ & sales/     # Leads, campaigns, counseling, website builder
│   │       │   ├── fees/             # Payments, plans, ledger, refunds, receipts
│   │       │   ├── franchise/        # Head Office executive dashboard
│   │       │   ├── leaderboard/      # Student ranking & gamification screen
│   │       │   ├── parent-portal/    # Parent child tracking view
│   │       │   ├── public/           # Public landing page
│   │       │   ├── student-portal/   # Student self-service learning portal
│   │       │   ├── super-admin/      # Multi-tenant oversight dashboard
│   │       │   └── tests/            # Test listings, mark entry, CBT exam runner
│   │       └── store/                # Zustand client state stores (Auth, preferences)
│   │
│   └── mobile/                       # React Native / Expo Cross-Platform Mobile App
│       ├── App.tsx                   # App root with navigation container
│       ├── app.json                  # Expo application configuration
│       └── src/
│           ├── api/                  # Mobile API client with token interceptors
│           ├── apps/                 # Role-tailored application screen suites:
│           │   ├── admin/            # Admin attendance, fee monitoring, student manager
│           │   ├── auth/             # Login, profile, password reset screens
│           │   ├── faculty/          # Attendance capture, test builder, file uploader
│           │   ├── parent/           # Child progress, fees, attendance, results
│           │   └── student/          # Online CBT exam, materials, assignments, leaderboard
│           ├── components/           # Mobile design system components & offline banner
│           └── navigation/           # Role-based stack and bottom-tab navigators
│
├── packages/
│   └── shared-types/                 # Shared TypeScript Type Library
│       └── src/
│           ├── dto.ts                # Request & response interface definitions
│           ├── enums.ts              # System roles, test types, fee statuses
│           └── permissions.ts        # RBAC permissions matrix
│
├── infrastructure/                   # DevOps & Deployment Configurations
│   ├── docker/                       # Production multi-stage Dockerfiles
│   ├── nginx/                        # Nginx reverse proxy configurations
│   ├── observability/                # Prometheus, Grafana, and Tempo configs
│   └── scripts/                      # DB backup, MinIO backup, recovery & isolation audit scripts
│
├── docs/                             # Architecture & Compliance Reports
│   ├── production-readiness-report.md
│   ├── recovery-runbook.md
│   └── tenant-security-report.md
│
├── docker-compose.yml                # Local development stack (Postgres, Redis, MinIO)
├── docker-compose.production.yml     # Full production orchestration stack
├── pnpm-workspace.yaml               # Monorepo workspace configuration
└── turbo.json                        # Turborepo build pipeline caching rules
```

---

## 👥 User Roles & Permissions (RBAC)

The platform enforces a granular **Role-Based Access Control** matrix with 40+ permissions across 7 primary roles:

| Role | Scope | Key Capabilities |
|---|---|---|
| **Super Admin** | Platform-wide | Multi-tenant provisioning, cross-branch billing, system audit logs, global analytics |
| **Institute Admin** | Institute / Branch | Branch staff management, course fee plans, batch allocations, operational dashboards |
| **Faculty** | Assigned Batches | Class attendance capture, test creation, marks entry, study material upload |
| **Accountant** | Institute Finance | Offline fee collection, payment verification, discount adjustments, refund approvals |
| **Counselor** | Sales & Admissions | Inbound lead management, follow-up scheduling, student admissions, campaign outreach |
| **Student** | Self Profile | CBT exam taking, score review, digital note downloads, homework submissions |
| **Parent** | Linked Children | Attendance monitoring, online fee payment, report card review, support ticketing |

---

## 📋 Prerequisites

Before running the application, ensure your environment has:

| Requirement | Recommended Version | Verification Command |
|---|---|---|
| **Node.js** | `>= 20.0.0` (LTS) | `node -v` |
| **pnpm** | `>= 9.0.0` | `pnpm -v` |
| **Docker** | Latest Desktop or Engine | `docker -v` |
| **Docker Compose** | `>= 2.20` | `docker compose version` |
| **Git** | Latest | `git -v` |

---

## ⚙️ Quick Start & Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/Happybhai329/the-prime-classes-erp.git
cd the-prime-classes-erp
```

### Step 2: Install Monorepo Dependencies

```bash
pnpm install
```

### Step 3: Launch Local Infrastructure

Start PostgreSQL 16, Redis 7, and MinIO S3 object storage in background containers:

```bash
docker compose up -d
```

Verify that all three services are running:
```bash
docker compose ps
```

### Step 4: Configure Environment Files

Copy the sample environment variables for both backend and frontend:

```bash
# Backend configuration
cp apps/api/.env.example apps/api/.env

# Frontend configuration (defaults work out-of-the-box for local dev)
cp apps/web/.env.development apps/web/.env
```

### Step 5: Initialize Database & Seed Demo Data

Build shared types, generate the Prisma client, apply migrations, and insert initial seed data:

```bash
# 1. Build the shared TypeScript library
pnpm --filter @prime/shared-types build

# 2. Generate Prisma Client
pnpm --filter @prime/api exec prisma generate

# 3. Apply migrations to PostgreSQL
pnpm --filter @prime/api exec prisma migrate dev --name init

# 4. Populate development seed data (users, batches, exams, fees)
pnpm --filter @prime/api exec prisma db seed
```

---

## 🏃 Running the Application

### Start All Applications (Parallel Monorepo Mode)

```bash
pnpm dev
```

### Or Run Individual Apps Selectively

```bash
# Start Backend API only (http://localhost:3000)
pnpm --filter @prime/api dev

# Start React Web Portal only (http://localhost:5173)
pnpm --filter @prime/web dev

# Start Mobile App (Expo Metro bundler)
pnpm --filter @prime/mobile start
```

### Service Access URLs

| Service | Access URL | Default Port | Notes |
|---|---|---|---|
| **Web Portal** | [http://localhost:5173](http://localhost:5173) | `5173` | React 18 Admin, Student & Parent UI |
| **Backend REST API** | [http://localhost:3000](http://localhost:3000) | `3000` | NestJS REST API root |
| **Swagger API Docs** | [http://localhost:3000/docs](http://localhost:3000/docs) | `3000` | Interactive OpenAPI documentation |
| **MinIO Web Console** | [http://localhost:9001](http://localhost:9001) | `9001` | S3 bucket & object browser |
| **Prisma Studio** | `pnpm --filter @prime/api exec prisma studio` | `5555` | Visual database explorer |

---

## 🔑 Default Login Credentials

The development database seed initializes standard user accounts across all roles:

| Role | Email Address | Default Password |
|---|---|---|
| **Super Admin** | `superadmin@primeclasses.in` | `Prime@2025` |
| **Institute Admin** | `admin@primeclasses.in` | `Prime@2025` |
| **Faculty Member** | `faculty@primeclasses.in` | `Prime@2025` |
| **Accountant** | `accountant@primeclasses.in` | `Prime@2025` |
| **Student** | `arjun.sharma@student.primeclasses.in` | `Prime@2025` |
| **Parent** | `vikram.sharma@parent.primeclasses.in` | `Prime@2025` |

> [!WARNING]
> Always change default passwords, JWT secrets, and MinIO credentials prior to deploying to any production or staging environment.

---

## 🔧 Environment Variables

### Backend Configuration (`apps/api/.env`)

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Database (PostgreSQL 16)
DATABASE_URL="postgresql://prime_user:prime_secret_2025@localhost:5432/prime_classes_erp?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Secrets (Generate secure 64-char strings in production)
JWT_ACCESS_SECRET="super-secret-access-key-prime-erp-2025"
JWT_REFRESH_SECRET="super-secret-refresh-key-prime-erp-2025"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# MinIO (S3 Compatible Storage)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY="prime_minio"
MINIO_SECRET_KEY="prime_minio_2025"
MINIO_BUCKET_NAME="prime-erp-assets"

# Razorpay Payment Gateway (Optional for testing)
RAZORPAY_KEY_ID="rzp_test_placeholder"
RAZORPAY_KEY_SECRET="placeholder_secret"

# Firebase Cloud Messaging (Optional for push notifications)
FIREBASE_PROJECT_ID="prime-classes-erp"
FIREBASE_PRIVATE_KEY=""
FIREBASE_CLIENT_EMAIL=""

# SMTP Email Dispatcher (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="notifications@primeclasses.in"
SMTP_PASSWORD="app-specific-password"
SMTP_FROM_EMAIL="noreply@primeclasses.in"
```

### Frontend Configuration (`apps/web/.env`)

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 📚 API Platform & Documentation

When running locally in development mode, an interactive **Swagger / OpenAPI** specification is available at:

```
http://localhost:3000/docs
```

### API Conventions
- **Base Endpoint**: `/api/v1`
- **Authentication**: Bearer Token in `Authorization` header (`Bearer <access_token>`)
- **Pagination**: Standard query parameters: `?page=1&limit=20&sortBy=createdAt&sortOrder=desc`
- **Standard Success Response**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": { ... },
    "message": "Operation completed successfully"
  }
  ```
- **Standard Error Response**:
  ```json
  {
    "success": false,
    "statusCode": 400,
    "error": {
      "code": "VALIDATION_FAILED",
      "message": "Invalid input payload",
      "details": [ ... ]
    }
  }
  ```

---

## 🔍 Observability, Reliability & Backups

### Production Observability Stack
The repository includes production-ready configurations for telemetry:
- **Prometheus**: Scrapes `/api/v1/metrics` for endpoint latencies, request throughput, and database query durations (`infrastructure/observability/prometheus/prometheus.yml`).
- **Grafana**: Pre-provisioned dashboards for the ERP platform (`prime-erp-overview.json`).
- **Grafana Tempo**: Distributed request tracing (`tempo.yaml`).

### Disaster Recovery & Audit Automation
- **Automated PostgreSQL Backups**:
  ```bash
  # Linux / MacOS
  ./infrastructure/scripts/backup-postgres.sh
  # Windows PowerShell
  .\infrastructure\scripts\backup-postgres.ps1
  ```
- **Automated MinIO S3 Object Backups**:
  ```bash
  ./infrastructure/scripts/backup-minio.sh
  ```
- **Restore Drill Verifier**: Tests automated restoration integrity without impacting active production data:
  ```bash
  ./infrastructure/scripts/restore-drill.sh
  ```
- **Tenant Isolation Static Auditor**: Validates that all database queries and repository operations explicitly enforce tenant boundaries:
  ```bash
  pnpm --filter @prime/api exec ts-node ../../infrastructure/scripts/tenant-isolation-audit.ts
  ```

---

## 🐳 Production Deployment

### Building Production Docker Images

```bash
# 1. Build API Server container
docker build -f infrastructure/docker/Dockerfile.api -t prime-erp-api:latest .

# 2. Build Web Portal container
docker build -f infrastructure/docker/Dockerfile.web -t prime-erp-web:latest .
```

### Deploying with Production Compose

The repository includes a production orchestration file (`docker-compose.production.yml`) with Nginx reverse proxying, SSL configurations, automated log rotation, and Prometheus/Grafana monitors:

```bash
docker compose -f docker-compose.production.yml up -d
```

---

## 🧪 Testing

```bash
# Run unit tests across all workspaces
pnpm test

# Run API unit & service tests
pnpm --filter @prime/api test

# Run Web application unit & component tests
pnpm --filter @prime/web test
```

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!

1. Fork the Project repository
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure all tests pass and code adheres to monorepo ESLint and Prettier standards before opening a PR.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 👤 Author

**The Prime Classes Team**  
- GitHub: [@Happybhai329](https://github.com/Happybhai329)
- Repository: [Happybhai329/the-prime-classes-erp](https://github.com/Happybhai329/the-prime-classes-erp)

---

<div align="center">
  <sub>Built with ❤️ for <b>The Prime Classes</b> — Inspiring and mentoring future military leaders of India.</sub>
</div>
