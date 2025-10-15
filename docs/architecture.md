# SalonFlow Fullstack Architecture Document

## Introduction

This document outlines the complete fullstack architecture for SalonFlow, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

### Starter Template or Existing Project

**Decision:** N/A - Greenfield project

**Rationale:** SalonFlow is built from scratch using Next.js 14+ App Router with Firebase as the backend. No existing starter template will be used to ensure complete control over architecture decisions and avoid template-specific constraints. The PRD specifies exact technology choices (Next.js, Firebase, TypeScript, Tailwind, ShadCN UI) that align with modern best practices for real-time collaborative applications.

### Change Log

| Date       | Version | Description                   | Author              |
| ---------- | ------- | ----------------------------- | ------------------- |
| 2025-10-09 | v1.0    | Initial architecture document | Architect (Winston) |

## High Level Architecture

### Technical Summary

SalonFlow employs a **hybrid serverless architecture** combining Next.js 14 App Router for the frontend with Firebase/Firestore for backend data services. The application leverages Firebase's real-time database capabilities for live synchronization across multiple clients while using Next.js API routes for elevated server-side operations requiring Firebase Admin SDK. Authentication is handled via Firebase Auth with custom claims for role-based access control (manager vs barber). The entire stack deploys to Vercel's edge network for optimal performance and Firebase's infrastructure for database and authentication services, creating a scalable, cost-effective solution that aligns perfectly with the PRD's real-time collaboration requirements and commission tracking workflow.

### Platform and Infrastructure Choice

**Platform:** Vercel (Frontend) + Firebase/Google Cloud (Backend)

**Rationale:**

- **Vercel:** Optimized for Next.js with zero-config deployment, automatic preview deployments for PRs, edge network for fast global access, and simple environment variable management. The free tier supports MVP requirements.
- **Firebase/Firestore:** Native real-time database with onSnapshot listeners perfectly matches the PRD's real-time synchronization requirements (barbers see instant approval updates, managers see pending logs immediately). Firebase Auth simplifies role-based authentication with custom claims. Firestore's pricing model ($0 for 50K reads/day) aligns with MVP cost targets.
- **Alternative Considered:** AWS (Amplify + DynamoDB) - Rejected due to increased complexity for real-time features and steeper learning curve
- **Alternative Considered:** Supabase + Vercel - Rejected because Firebase has better real-time capabilities and established ecosystem for React applications

**Key Services:**

- **Frontend Hosting:** Vercel Edge Network
- **Database:** Firebase Firestore (NoSQL document database)
- **Authentication:** Firebase Authentication
- **File Storage:** Firebase Storage (for avatar images)
- **Monitoring:** Vercel Analytics, Sentry (error tracking), Firebase Performance Monitoring
- **CI/CD:** GitHub Actions + Vercel automated deployments

**Deployment Host and Regions:**

- **Vercel:** Global edge network (automatic CDN distribution)
- **Firebase:** us-central1 (primary region for Firestore, configurable based on salon location)

### Repository Structure

**Structure:** Monorepo (Single repository)

**Monorepo Tool:** Not required (simple Next.js project structure)

**Package Organization:** Single application structure with clear separation of concerns

**Rationale:**

- MVP scope doesn't justify multi-package monorepo complexity
- Next.js App Router provides sufficient code organization (app/, components/, lib/)
- All frontend and backend code (API routes) coexist naturally in Next.js structure
- Simplified deployment: Single build artifact to Vercel
- No cross-package dependency management overhead
- Future scalability: Can migrate to Nx/Turborepo if multi-app needs arise post-MVP

```
salonflow/
├── app/                    # Next.js App Router pages & API routes
├── components/            # React components (UI + features)
├── lib/                   # Core utilities (Firebase, validations)
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
├── stores/                # Zustand state stores
├── tests/                 # Test files
└── public/                # Static assets
```

### High Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        A1[Desktop Client]
        A2[Mobile/Tablet Client]
    end

    subgraph "Vercel Edge Network"
        B[Next.js 14 App Router]
        B1[Static Pages & SSG]
        B2[API Routes - Server-Side]
        B3[Middleware - Auth Guards]
    end

    subgraph "Firebase/Google Cloud"
        C[Firebase Authentication]
        C1[Custom Claims - Roles]
        D[Firestore Database]
        D1[users Collection]
        D2[services Collection]
        D3[serviceLogs Collection]
        E[Firebase Storage]
        E1[Avatar Images]
        F[Firebase Security Rules]
    end

    subgraph "Monitoring & Error Tracking"
        G[Vercel Analytics]
        H[Sentry Error Tracking]
        I[Firebase Performance]
    end

    A1 --> B
    A2 --> B
    B --> B1
    B --> B2
    B --> B3

    B3 --> C
    C --> C1

    B1 -- "Real-time onSnapshot" --> D
    B2 -- "Firebase Admin SDK" --> D

    D --> D1
    D --> D2
    D --> D3

    D <--> F

    B1 --> E
    B2 --> E

    B --> G
    B --> H
    D --> I

    style B fill:#f59e0b,stroke:#333,stroke-width:2px,color:#000
    style D fill:#FFA000,stroke:#333,stroke-width:2px
    style C fill:#FFA000,stroke:#333,stroke-width:2px
```

### Architectural Patterns

- **Jamstack with Serverless Backend:** Static site generation where applicable (login page, layouts) with serverless API routes for elevated operations. _Rationale:_ Optimal performance through edge caching while maintaining flexibility for server-side logic requiring Firebase Admin SDK (e.g., user deletion, complex aggregations).

- **Component-Based UI (Atomic Design):** React components organized by complexity: atoms (buttons, inputs) → molecules (cards, form fields) → organisms (tables, forms) → templates (dashboard layouts) → pages. _Rationale:_ Promotes reusability, testability, and alignment with ShadCN UI component library structure.

- **Real-time Data Synchronization:** Firestore onSnapshot listeners wrapped in React Query for automatic subscription management and caching. _Rationale:_ Meets PRD requirement for <2s latency on updates; React Query provides cleanup and prevents listener leaks.

- **Optimistic UI Updates:** React Query mutations with optimistic updates and automatic rollback on failure. _Rationale:_ Creates instant user feedback (log service, approve log) while gracefully handling network failures per NFR8.

- **Repository Pattern (Data Access Layer):** Abstract Firestore operations behind service layer functions (e.g., `createServiceLog()`, `approveLog()`). _Rationale:_ Isolates Firebase SDK from components, enabling easier testing and potential future database migration.

- **Role-Based Access Control (RBAC):** Firebase custom claims (`role: 'manager' | 'barber'`) enforced at multiple layers: client-side route guards, Firestore security rules, API route middleware. _Rationale:_ Defense in depth security; client guards improve UX, server rules enforce security.

- **Command Query Responsibility Segregation (CQRS-lite):** Write operations via mutations, read operations via real-time queries. _Rationale:_ Separates concerns; writes can trigger side effects (recalculations) while reads remain purely reactive to Firestore state.

- **Error Boundary Pattern:** React Error Boundaries at app root and critical features to catch rendering errors. _Rationale:_ Prevents entire app crashes; logs errors to Sentry for monitoring per Story 1.9.

## Tech Stack

### Technology Stack Table

| Category             | Technology           | Version            | Purpose                                                      | Rationale                                                                                                                                           |
| -------------------- | -------------------- | ------------------ | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend Language    | TypeScript           | 5.4+               | Type-safe JavaScript development                             | Eliminates runtime type errors; strict mode enforces best practices; excellent IDE support for large codebase                                       |
| Frontend Framework   | Next.js              | 14.2+              | React meta-framework with App Router                         | App Router enables colocation of server/client code; built-in routing, SSG, API routes; optimal Vercel deployment; industry-standard for React apps |
| UI Component Library | ShadCN UI            | Latest             | Accessible, customizable components                          | Radix UI primitives ensure WCAG 2.1 AA compliance; full TypeScript support; copy-paste model avoids dependency bloat; dark theme support            |
| State Management     | Zustand              | 4.5+               | Global client state                                          | Minimal boilerplate vs Redux; excellent TypeScript support; 1KB bundle size; simple middleware for persistence                                      |
| Backend Language     | TypeScript           | 5.4+               | Type-safe server-side logic                                  | Shared types between frontend/backend; consistent codebase; Firebase SDK has excellent TS support                                                   |
| Backend Framework    | Next.js API Routes   | 14.2+              | Serverless backend endpoints                                 | Colocated with frontend; auto-deployed to Vercel serverless functions; Firebase Admin SDK integration                                               |
| API Style            | REST (Firestore SDK) | N/A                | Direct Firestore client access + API routes for elevated ops | Firestore SDK provides type-safe CRUD; API routes handle admin operations (delete with referential integrity checks)                                |
| Database             | Firestore            | Latest             | NoSQL real-time database                                     | Native real-time via onSnapshot; automatic scaling; simple data model (collections/documents); security rules for RBAC                              |
| Cache                | React Query          | 5.40+              | Server state caching and synchronization                     | Built-in caching, refetching, optimistic updates; manages Firestore listeners lifecycle; DevTools for debugging                                     |
| File Storage         | Firebase Storage     | Latest             | Avatar images                                                | Integrated with Firebase Auth; security rules for access control; CDN delivery; simple upload API                                                   |
| Authentication       | Firebase Auth        | 10.12+             | User authentication and custom claims                        | Email/password auth; custom claims for roles; token-based auth; integrates with Firestore security rules                                            |
| Frontend Testing     | Vitest               | 1.6+               | Unit and component tests                                     | Fast (Vite-powered); Jest-compatible API; native ESM support; excellent TypeScript support; React Testing Library integration                       |
| Backend Testing      | Vitest               | 1.6+               | API route unit tests                                         | Same testing framework for consistency; can test Next.js API routes in isolation                                                                    |
| E2E Testing          | Playwright           | 1.44+              | End-to-end browser tests                                     | Multi-browser support; Firebase Emulator integration; parallel test execution; reliable selectors                                                   |
| Build Tool           | Next.js Compiler     | 14.2+              | Rust-based compiler                                          | Built into Next.js; fast builds; automatic code splitting; optimized for production                                                                 |
| Bundler              | Turbopack            | 14.2+              | Next.js dev bundler                                          | Faster HMR than Webpack; built into Next.js 14; production uses Webpack (stable)                                                                    |
| IaC Tool             | Firebase CLI         | 13+                | Infrastructure deployment                                    | Deploys Firestore rules, indexes, functions; integrates with CI/CD                                                                                  |
| CI/CD                | GitHub Actions       | Latest             | Automated testing and deployment                             | Free for public repos; Vercel/Firebase integrations; runs tests, deploys on merge to main                                                           |
| Monitoring           | Vercel Analytics     | Latest             | Web Vitals and performance                                   | Built into Vercel; tracks Core Web Vitals (LCP, FID, CLS); no configuration needed                                                                  |
| Logging              | Sentry               | Latest (free tier) | Error tracking and logging                                   | Captures unhandled errors; source map support; user context; production error monitoring                                                            |
| CSS Framework        | Tailwind CSS         | 3.4+               | Utility-first styling                                        | Rapid UI development; dark mode support; tree-shaking removes unused styles; consistent design tokens                                               |

**Version Pinning Strategy:** All versions use `^` (caret) in package.json for automatic minor/patch updates. Major versions require manual review and staging deployment test.

## Data Models

### User Profile

**Purpose:** Represents authenticated users (managers and barbers) with role-based permissions and barber-specific commission configuration.

**Key Attributes:**

- `id`: string (Firebase Auth UID) - Unique identifier matching Firebase Auth user
- `username`: string - Display name for UI (e.g., "John Smith")
- `role`: 'manager' | 'barber' - Determines access level
- `avatarUrl`: string | null - Optional profile image URL
- `commissionRate`: number - Decimal (0.45 = 45%), barbers only
- `createdAt`: Firestore Timestamp - Account creation date

#### TypeScript Interface

```typescript
interface UserProfile {
  id: string // Firebase Auth UID
  username: string
  role: 'manager' | 'barber'
  avatarUrl: string | null
  commissionRate: number // 0.0 - 1.0 (e.g., 0.45 for 45%)
  createdAt: Firestore.Timestamp
}
```

#### Relationships

- UserProfile (1) → ServiceLog (many): `serviceLogs.barberId` references `users.id`

---

### Service

**Purpose:** Defines salon services (haircut, shave, etc.) with pricing and duration for service logging.

**Key Attributes:**

- `id`: string - Auto-generated Firestore document ID
- `name`: string - Service name (e.g., "Haircut", "Beard Trim")
- `price`: number - Service price in dollars (e.g., 25.00)
- `duration`: number - Service duration in minutes (e.g., 30)
- `createdAt`: Firestore Timestamp - Service creation date

#### TypeScript Interface

```typescript
interface Service {
  id: string
  name: string
  price: number // Dollars (e.g., 25.00)
  duration: number // Minutes
  createdAt: Firestore.Timestamp
}
```

#### Relationships

- Service (1) → ServiceLog (many): `serviceLogs.serviceId` references `services.id`

---

### ServiceLog

**Purpose:** Records completed services with approval status and commission calculations, forming the core transaction record for financial reporting.

**Key Attributes:**

- `id`: string - Auto-generated Firestore document ID
- `barberId`: string - References `users.id` (barber who performed service)
- `serviceId`: string - References `services.id` (service performed)
- `price`: number - **Snapshot** of service price at logging time (immutable)
- `commissionRate`: number - **Snapshot** of barber's commission rate at logging time (immutable)
- `commissionAmount`: number - Calculated: price × commissionRate, rounded to 2 decimals
- `status`: 'pending' | 'approved' | 'rejected' - Approval workflow state
- `createdAt`: Firestore Timestamp - When service was logged
- `approvedAt`: Firestore Timestamp | null - When approved (null if not approved)
- `rejectedAt`: Firestore Timestamp | null - When rejected (null if not rejected)

**Design Decision:** Price and commission rate are snapshotted to ensure historical accuracy. If a service price increases or a barber's commission rate changes, existing logs retain original values for payroll integrity.

#### TypeScript Interface

```typescript
interface ServiceLog {
  id: string
  barberId: string // FK to users.id
  serviceId: string // FK to services.id
  price: number // Snapshot from service at logging time
  commissionRate: number // Snapshot from barber profile at logging time
  commissionAmount: number // Calculated: price * commissionRate
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Firestore.Timestamp
  approvedAt: Firestore.Timestamp | null
  rejectedAt: Firestore.Timestamp | null
}
```

#### Relationships

- ServiceLog (many) → UserProfile (1): `barberId` references barber
- ServiceLog (many) → Service (1): `serviceId` references service

---

### Data Model Diagram

```mermaid
erDiagram
    UserProfile ||--o{ ServiceLog : "logs"
    Service ||--o{ ServiceLog : "defines"

    UserProfile {
        string id PK
        string username
        string role
        string avatarUrl
        number commissionRate
        timestamp createdAt
    }

    Service {
        string id PK
        string name
        number price
        number duration
        timestamp createdAt
    }

    ServiceLog {
        string id PK
        string barberId FK
        string serviceId FK
        number price
        number commissionRate
        number commissionAmount
        string status
        timestamp createdAt
        timestamp approvedAt
        timestamp rejectedAt
    }
```

## API Specification

**API Style:** Hybrid - Direct Firestore SDK (client-side) + REST API Routes (server-side elevated operations)

**Rationale:** Most operations (read services, log service, approve log) use Firestore SDK directly from the client with security rules enforcing access control. This leverages Firestore's real-time capabilities and reduces server costs. Server-side API routes handle operations requiring Firebase Admin SDK privileges (referential integrity checks, user management) or complex aggregations.

### Client-Side Firestore Operations

**Pattern:** React components use Firestore SDK via service layer functions that return onSnapshot listeners wrapped in React Query.

```typescript
// Example: Real-time service catalog
import { collection, onSnapshot } from 'firebase/firestore'
import { useQuery } from '@tanstack/react-query'

function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: () =>
      new Promise((resolve) => {
        const unsubscribe = onSnapshot(collection(db, 'services'), (snapshot) =>
          resolve(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        )
        return () => unsubscribe()
      }),
    staleTime: Infinity, // Real-time data never stale
  })
}
```

**Operations Handled Client-Side:**

- Read services, barbers, service logs (filtered by role)
- Create service log (barbers)
- Update service log status (managers approve/reject)
- Create/update/delete services (managers)
- Create/update barber profiles (managers)

**Security:** Firestore security rules enforce all access control (see Security Rules section).

### REST API Routes (Next.js API Routes)

#### DELETE /api/barbers/[id]

**Purpose:** Delete a barber with referential integrity check

**Method:** DELETE

**Authentication:** Requires Firebase Auth token with `role: 'manager'` custom claim

**Request:**

```typescript
// Path parameter
id: string // Barber user ID
```

**Response:**

```typescript
// Success (200)
{
  success: true,
  message: "Barber deleted successfully"
}

// Error (400) - Has service logs
{
  error: "Cannot delete barber with existing service logs",
  serviceLogCount: 42
}

// Error (401)
{
  error: "Unauthorized - Manager access required"
}
```

**Implementation Notes:**

- Uses Firebase Admin SDK to query `serviceLogs` for `barberId`
- If logs exist, returns 400 error
- If no logs, deletes user document from `users` collection and disables Firebase Auth account
- Managers cannot delete themselves (additional check)

---

#### POST /api/reports/aggregate

**Purpose:** Generate complex aggregation reports (optional optimization for large datasets)

**Method:** POST

**Authentication:** Requires Firebase Auth token with `role: 'manager'` custom claim

**Request:**

```typescript
{
  startDate: string // ISO 8601 date
  endDate: string
  aggregationType: 'daily' | 'weekly' | 'monthly'
}
```

**Response:**

```typescript
{
  totalRevenue: number
  totalCommissions: number
  netProfit: number
  topBarbers: Array<{
    barberId: string
    barberName: string
    revenue: number
    serviceCount: number
  }>
  topServices: Array<{
    serviceId: string
    serviceName: string
    revenue: number
    count: number
  }>
}
```

**Implementation Notes:**

- Aggregates `serviceLogs` where `status = 'approved'` within date range
- Server-side aggregation more efficient for large datasets (1000+ logs)
- Caches results for 5 minutes using Vercel Edge Config or in-memory cache
- Falls back to client-side calculation if cache miss

---

#### POST /api/admin/recalculate-commissions

**Purpose:** Batch recalculate commission amounts (maintenance operation, not exposed to UI initially)

**Method:** POST

**Authentication:** Requires Firebase Auth token with `role: 'manager'` custom claim

**Request:**

```typescript
{
  logIds: string[]; // Optional: specific logs to recalculate
  dryRun: boolean; // If true, returns changes without applying
}
```

**Response:**

```typescript
{
  updated: number // Count of logs updated
  changes: Array<{ logId: string; oldAmount: number; newAmount: number }>
}
```

**Implementation Notes:**

- Recalculates `commissionAmount` from stored `price` and `commissionRate`
- Used if formula changes or data integrity issues detected
- Dry run mode for verification before applying changes

## Components

### Authentication Service

**Responsibility:** Manages user authentication, session management, and role-based access control using Firebase Auth.

**Key Interfaces:**

- `signInAsManager()` - Authenticates sole manager account
- `signInAsBarber(barberId: string)` - Authenticates selected barber
- `signOut()` - Ends user session
- `getCurrentUser()` - Returns current authenticated user with role
- `setCustomClaim(uid: string, role: 'manager' | 'barber')` - Server-side only, sets role claim

**Dependencies:** Firebase Auth SDK, Zustand auth store

**Technology Stack:** Firebase Authentication, Next.js middleware for route protection

---

### Real-time Sync Engine

**Responsibility:** Manages Firestore onSnapshot listeners with automatic subscription lifecycle, caching, and error handling.

**Key Interfaces:**

- `useRealtimeQuery(queryKey, firestoreQuery)` - React hook wrapping onSnapshot in React Query
- `useServices()` - Real-time service catalog
- `useServiceLogs(filters)` - Real-time service logs with filters
- `useBarbers()` - Real-time barber list

**Dependencies:** Firestore SDK, React Query, custom hooks

**Technology Stack:** React Query v5.40+, Firestore onSnapshot

**Pattern Example:**

```typescript
export function useRealtimeQuery<T>(queryKey: QueryKey, firestoreQuery: Query) {
  return useQuery({
    queryKey,
    queryFn: () =>
      new Promise<T[]>((resolve, reject) => {
        const unsubscribe = onSnapshot(
          firestoreQuery,
          (snapshot) =>
            resolve(
              snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T)
            ),
          reject
        )
        return () => unsubscribe()
      }),
    staleTime: Infinity,
  })
}
```

---

### Service Management Service

**Responsibility:** CRUD operations for services (create, read, update, delete) with validation and referential integrity checks.

**Key Interfaces:**

- `createService(data: CreateServiceDto)` - Validates and creates service
- `updateService(id: string, data: UpdateServiceDto)` - Updates service
- `deleteService(id: string)` - Deletes service if no associated logs
- `getServiceById(id: string)` - Retrieves single service

**Dependencies:** Firestore SDK, Zod validation, React Query mutations

**Technology Stack:** Firestore, React Hook Form, Zod validation

---

### Barber Management Service

**Responsibility:** CRUD operations for barber profiles with commission rate management and user account creation.

**Key Interfaces:**

- `createBarber(data: CreateBarberDto)` - Creates user profile and Firebase Auth account
- `updateBarber(id: string, data: UpdateBarberDto)` - Updates barber profile
- `deleteBarber(id: string)` - Calls API route for server-side deletion
- `getBarberById(id: string)` - Retrieves single barber profile

**Dependencies:** Firestore SDK, Firebase Auth, API routes for deletion

**Technology Stack:** Firestore, Firebase Auth, Next.js API routes

---

### Service Logging Service

**Responsibility:** Handles service log creation by barbers and managers, calculates commissions, and manages log lifecycle.

**Key Interfaces:**

- `logServices(barberId: string, serviceIds: string[])` - Creates multiple logs (barber action)
- `logServiceForBarber(barberId: string, serviceId: string)` - Manager logs on behalf of barber (auto-approved)
- `deleteLog(logId: string)` - Barber deletes own pending log
- `calculateCommission(price: number, rate: number)` - Pure function: price × rate

**Dependencies:** Firestore SDK, Zustand auth store (current user), service/barber data fetchers

**Technology Stack:** Firestore, Zustand

**Commission Calculation:**

```typescript
export function calculateCommission(price: number, rate: number): number {
  return Math.round(price * rate * 100) / 100 // Round to 2 decimals
}
```

---

### Approval Workflow Service

**Responsibility:** Manages manager approval/rejection of pending service logs with real-time updates to barber dashboards.

**Key Interfaces:**

- `approveLog(logId: string)` - Sets status to 'approved', sets approvedAt timestamp
- `rejectLog(logId: string)` - Sets status to 'rejected', sets rejectedAt timestamp

**Dependencies:** Firestore SDK, React Query mutations with optimistic updates

**Technology Stack:** Firestore, React Query

**Optimistic Update Pattern:**

```typescript
const { mutate: approveLog } = useMutation({
  mutationFn: async (logId: string) => {
    await updateDoc(doc(db, 'serviceLogs', logId), {
      status: 'approved',
      approvedAt: serverTimestamp(),
    })
  },
  onMutate: async (logId) => {
    // Optimistically remove from pending queue
    await queryClient.cancelQueries({ queryKey: ['serviceLogs', 'pending'] })
    const previousLogs = queryClient.getQueryData(['serviceLogs', 'pending'])
    queryClient.setQueryData(['serviceLogs', 'pending'], (old: ServiceLog[]) =>
      old.filter((log) => log.id !== logId)
    )
    return { previousLogs }
  },
  onError: (err, logId, context) => {
    // Rollback on error
    queryClient.setQueryData(['serviceLogs', 'pending'], context.previousLogs)
  },
})
```

---

### Reporting & Analytics Service

**Responsibility:** Aggregates data for KPIs, leaderboards, and financial ledger with date range filtering and search.

**Key Interfaces:**

- `getManagerKPIs()` - Total revenue, total services, active barbers count
- `getBarberDailyStats(barberId: string)` - Today's services count and revenue
- `getTopBarbers(dateRange, limit: number)` - Leaderboard ranked by revenue
- `getTopServices(dateRange, limit: number)` - Leaderboard ranked by revenue
- `getFinancialLedger(dateRange, search: string, pagination)` - Paginated transaction list

**Dependencies:** Firestore SDK with aggregation queries, React Query for caching

**Technology Stack:** Firestore, React Query, date-fns for date manipulation

**Performance Optimization:** Caches aggregation results for 5 minutes; uses Firestore composite indexes for efficient filtering.

---

### Component Diagram

```mermaid
graph TB
    subgraph "Frontend - React Components"
        UI[UI Layer - ShadCN Components]
        Pages[Page Components]
        Features[Feature Components]
    end

    subgraph "Business Logic Layer"
        AuthSvc[Authentication Service]
        RealtimeSvc[Real-time Sync Engine]
        ServiceMgmt[Service Management]
        BarberMgmt[Barber Management]
        ServiceLog[Service Logging Service]
        ApprovalSvc[Approval Workflow]
        ReportSvc[Reporting & Analytics]
    end

    subgraph "State Management"
        Zustand[Zustand Stores]
        ReactQuery[React Query Cache]
    end

    subgraph "Backend"
        Firestore[Firestore Database]
        FirebaseAuth[Firebase Auth]
        APIRoutes[Next.js API Routes]
    end

    Pages --> Features
    Features --> UI

    Features --> AuthSvc
    Features --> RealtimeSvc
    Features --> ServiceMgmt
    Features --> BarberMgmt
    Features --> ServiceLog
    Features --> ApprovalSvc
    Features --> ReportSvc

    AuthSvc --> Zustand
    RealtimeSvc --> ReactQuery
    ServiceMgmt --> ReactQuery
    BarberMgmt --> ReactQuery
    ServiceLog --> ReactQuery
    ApprovalSvc --> ReactQuery
    ReportSvc --> ReactQuery

    AuthSvc --> FirebaseAuth
    RealtimeSvc --> Firestore
    ServiceMgmt --> Firestore
    BarberMgmt --> Firestore
    BarberMgmt --> APIRoutes
    ServiceLog --> Firestore
    ApprovalSvc --> Firestore
    ReportSvc --> Firestore

    APIRoutes --> Firestore
    APIRoutes --> FirebaseAuth

    style AuthSvc fill:#f59e0b,color:#000
    style RealtimeSvc fill:#f59e0b,color:#000
    style Firestore fill:#FFA000
```

## External APIs

**No external third-party APIs required for MVP.**

All backend functionality is provided by Firebase services (Authentication, Firestore, Storage) which are first-party Google Cloud Platform services, not external integrations.

**Future Considerations (Post-MVP):**

- **Payment Processing:** Stripe API for automated commission payouts to barbers
- **SMS Notifications:** Twilio API for alerting barbers when logs are approved/rejected
- **Email:** SendGrid API for end-of-day commission reports
- **Analytics:** Google Analytics 4 for user behavior tracking

## Core Workflows

### Workflow 1: Barber Logs Services and Manager Approves

```mermaid
sequenceDiagram
    participant B as Barber Browser
    participant FE as Next.js Frontend
    participant FS as Firestore
    participant M as Manager Browser

    B->>FE: Login as Barber (select profile)
    FE->>FS: Authenticate via Firebase Auth
    FS-->>FE: Return user with role='barber'
    FE-->>B: Show Barber Dashboard

    B->>FE: Select multiple services (3 services)
    B->>FE: Click "Log 3 Service(s)"

    FE->>FE: Calculate commission for each service
    FE->>FS: Create 3 serviceLogs (status='pending')
    FE->>B: Optimistic UI update (show pending in table)
    FS-->>FE: Confirm writes
    FE-->>B: Toast: "3 service(s) logged successfully"

    Note over FS,M: Real-time update via onSnapshot
    FS->>M: Push new pending logs
    M->>M: Display in "Pending Approvals" table

    M->>FE: Click "Approve" (checkmark icon)
    FE->>FS: Update log: status='approved', approvedAt=now
    FE->>M: Optimistic UI (remove from pending queue)
    FS-->>FE: Confirm write
    FE-->>M: Toast: "Service log approved"

    Note over FS,B: Real-time update to barber
    FS->>B: Push status change to 'approved'
    B->>B: Update table (badge changes to "Approved")
    B->>B: Increment daily stats (revenue + 1 service)
```

---

### Workflow 2: Manager Creates Barber Profile

```mermaid
sequenceDiagram
    participant M as Manager Browser
    participant FE as Next.js Frontend
    participant FS as Firestore
    participant FA as Firebase Auth
    participant L as Login Page (Other Browser)

    M->>FE: Navigate to /manager/barbers
    M->>FE: Click "Add Barber"
    FE->>M: Show modal dialog with form

    M->>FE: Enter: username, avatarUrl, commissionRate (45%)
    M->>FE: Click "Create Barber"

    FE->>FA: Create Firebase Auth user (email: username@salonflow.local)
    FA-->>FE: Return user UID

    FE->>FA: Set custom claim: role='barber'
    FA-->>FE: Confirm claim set

    FE->>FS: Create document in users collection
    Note right of FS: { id: UID, username, avatarUrl,<br/>role: 'barber', commissionRate: 0.45, createdAt }
    FS-->>FE: Confirm write

    FE->>M: Optimistic UI (add card to grid)
    FE-->>M: Toast: "Barber 'John' added successfully"

    Note over FS,L: Barber can now log in
    L->>FE: Click "Barber" on login page
    FE->>FS: Fetch all users where role='barber'
    FS-->>FE: Return barbers (including new barber)
    FE->>L: Display barber selection grid (John's card visible)
```

---

### Workflow 3: Real-time Synchronization Across Multiple Clients

```mermaid
sequenceDiagram
    participant B as Barber Browser
    participant M1 as Manager Browser 1
    participant M2 as Manager Browser 2
    participant FS as Firestore

    Note over B,M1,M2: All clients have active onSnapshot listeners

    B->>FS: Create serviceLog (status='pending')

    Note over FS: Firestore triggers onSnapshot callbacks

    par Real-time push to both managers
        FS->>M1: Push new pending log (onSnapshot)
        FS->>M2: Push new pending log (onSnapshot)
    end

    M1->>M1: Animate new row in "Pending Approvals"
    M2->>M2: Animate new row in "Pending Approvals"

    M1->>FS: Approve log (status='approved')

    par Real-time push to all
        FS->>M2: Push status change (approved)
        FS->>B: Push status change (approved)
    end

    M2->>M2: Remove from pending queue (already approved by M1)
    B->>B: Update badge to "Approved", increment daily stats

    Note over B,M1,M2: <2s latency from action to update
```

## Database Schema

### Firestore Collections and Document Structure

#### Collection: `users`

**Purpose:** Stores user profiles for both managers and barbers.

**Document ID:** Firebase Auth UID (string)

**Schema:**

```typescript
{
  id: string // Same as document ID (Firebase Auth UID)
  username: string // Display name (e.g., "John Smith")
  role: 'manager' | 'barber' // Access level
  avatarUrl: string | null // Optional profile image
  commissionRate: number // Decimal 0.0-1.0 (e.g., 0.45 for 45%), barbers only
  createdAt: Timestamp // Account creation timestamp
}
```

**Indexes:**

- Automatic index on `id` (document ID)
- Single-field index on `role` (for querying barbers)

**Security Rules:**

- Managers can read/write all user documents
- Barbers can read only their own document (read: `request.auth.uid == resource.id`)
- Barbers cannot write to users collection (profile updates require manager approval)

**Sample Document:**

```json
{
  "id": "abc123uid",
  "username": "John Barber",
  "role": "barber",
  "avatarUrl": "https://example.com/avatars/john.jpg",
  "commissionRate": 0.45,
  "createdAt": "2025-10-01T10:00:00Z"
}
```

---

#### Collection: `services`

**Purpose:** Defines available salon services with pricing and duration.

**Document ID:** Auto-generated Firestore ID (string)

**Schema:**

```typescript
{
  id: string // Same as document ID
  name: string // Service name (e.g., "Haircut")
  price: number // Price in dollars (e.g., 25.00)
  duration: number // Duration in minutes (e.g., 30)
  createdAt: Timestamp // Creation timestamp
}
```

**Indexes:**

- Automatic index on `id` (document ID)
- Single-field index on `name` (for sorting alphabetically)

**Security Rules:**

- Managers can read/write all service documents
- Barbers can read all service documents (read-only)
- Barbers cannot write to services collection

**Sample Document:**

```json
{
  "id": "service_xyz789",
  "name": "Haircut",
  "price": 25.0,
  "duration": 30,
  "createdAt": "2025-09-15T12:00:00Z"
}
```

---

#### Collection: `serviceLogs`

**Purpose:** Records completed services with approval status and commission calculations.

**Document ID:** Auto-generated Firestore ID (string)

**Schema:**

```typescript
{
  id: string // Same as document ID
  barberId: string // FK to users.id
  serviceId: string // FK to services.id
  price: number // Snapshot of service price at logging time
  commissionRate: number // Snapshot of barber's rate at logging time
  commissionAmount: number // Calculated: price * commissionRate
  status: 'pending' | 'approved' | 'rejected' // Approval state
  createdAt: Timestamp // When service was logged
  approvedAt: Timestamp | null // When approved (null if not approved)
  rejectedAt: Timestamp | null // When rejected (null if not rejected)
}
```

**Composite Indexes (Required):**

1. **Barber's service log history:**
   - Fields: `barberId` (ASC), `createdAt` (DESC)
   - Purpose: Fetch all logs for a barber sorted by date

2. **Manager's pending approvals queue:**
   - Fields: `status` (ASC), `createdAt` (ASC)
   - Purpose: Fetch all pending logs sorted oldest-first

3. **Barber's pending logs:**
   - Fields: `barberId` (ASC), `status` (ASC), `createdAt` (DESC)
   - Purpose: Fetch barber's own pending logs for deletion

4. **Date-filtered approved logs (for reporting):**
   - Fields: `status` (ASC), `createdAt` (DESC)
   - Purpose: Financial reports filtering by date range

**Index Configuration (firestore.indexes.json):**

```json
{
  "indexes": [
    {
      "collectionGroup": "serviceLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "barberId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "serviceLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "serviceLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "barberId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**Security Rules:**

- Barbers can create logs with `barberId == request.auth.uid` and `status == 'pending'` only
- Barbers can delete their own pending logs
- Barbers can read only their own logs
- Managers can read all logs, approve/reject logs (set status to 'approved' or 'rejected')
- Price and commission fields are immutable after creation

**Sample Document:**

```json
{
  "id": "log_def456",
  "barberId": "abc123uid",
  "serviceId": "service_xyz789",
  "price": 25.0,
  "commissionRate": 0.45,
  "commissionAmount": 11.25,
  "status": "approved",
  "createdAt": "2025-10-09T14:30:00Z",
  "approvedAt": "2025-10-09T15:00:00Z",
  "rejectedAt": null
}
```

---

### Firestore Security Rules (firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isManager() {
      return isAuthenticated() && request.auth.token.role == 'manager';
    }

    function isBarber() {
      return isAuthenticated() && request.auth.token.role == 'barber';
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isManager() || isOwner(userId);
      allow write: if isManager();
    }

    // Services collection
    match /services/{serviceId} {
      allow read: if isAuthenticated();
      allow write: if isManager();
    }

    // Service logs collection
    match /serviceLogs/{logId} {
      // Barbers can read only their own logs
      allow read: if isManager() || (isBarber() && resource.data.barberId == request.auth.uid);

      // Barbers can create logs for themselves with status='pending'
      allow create: if isBarber()
        && request.resource.data.barberId == request.auth.uid
        && request.resource.data.status == 'pending';

      // Barbers can delete their own pending logs
      allow delete: if isBarber()
        && resource.data.barberId == request.auth.uid
        && resource.data.status == 'pending';

      // Managers can create logs with any status (for logging on behalf of barbers)
      allow create: if isManager();

      // Managers can approve/reject logs (update status field only)
      allow update: if isManager()
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'approvedAt', 'rejectedAt']);
    }
  }
}
```

**Key Security Rules:**

1. **Role-based access:** Custom claims (`role: 'manager' | 'barber'`) enforce all permissions
2. **Barber restrictions:** Barbers can only create logs for themselves with `status='pending'`
3. **Immutable fields:** Once created, price and commission cannot be changed (not in allowed diff keys)
4. **Manager privileges:** Managers can create auto-approved logs (bypassing pending workflow)

## Frontend Architecture

### Component Architecture

#### Component Organization

```
components/
├── ui/                       # ShadCN UI primitives (auto-generated)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── table.tsx
│   ├── badge.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── select.tsx
│   └── toast.tsx
│
├── features/                 # Feature-specific components
│   ├── auth/
│   │   ├── LoginRoleSelection.tsx
│   │   ├── BarberProfileSelection.tsx
│   │   └── ProtectedRoute.tsx
│   ├── dashboard/
│   │   ├── ManagerDashboard.tsx
│   │   ├── BarberDashboard.tsx
│   │   ├── KPICard.tsx
│   │   └── DailyStats.tsx
│   ├── services/
│   │   ├── ServiceGrid.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── ServiceForm.tsx (Add/Edit)
│   │   └── ServiceManagementPage.tsx
│   ├── barbers/
│   │   ├── BarberGrid.tsx
│   │   ├── BarberCard.tsx
│   │   ├── BarberForm.tsx (Add/Edit)
│   │   └── BarberManagementPage.tsx
│   ├── service-logs/
│   │   ├── ServiceLogTable.tsx
│   │   ├── PendingApprovalsTable.tsx
│   │   ├── ServiceLogForm.tsx
│   │   └── ApprovalActions.tsx
│   ├── reports/
│   │   ├── ReportsPage.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── LeaderboardTable.tsx
│   │   ├── FinancialLedger.tsx
│   │   └── SearchFilter.tsx
│   └── common/
│       ├── Navigation.tsx
│       ├── ErrorBoundary.tsx
│       ├── LoadingSkeleton.tsx
│       └── EmptyState.tsx
```

**Organizational Principles:**

- **ui/**: Atomic design system components (auto-generated from ShadCN CLI)
- **features/**: Business logic components organized by domain (auth, dashboard, services, barbers, service-logs, reports)
- **common/**: Shared components used across multiple features

#### Component Template

```typescript
/**
 * ServiceCard Component
 *
 * Displays a service with name, price, duration in a card format.
 * Supports selection mode for barber service logging.
 *
 * @example
 * <ServiceCard
 *   service={service}
 *   isSelected={false}
 *   onSelect={(id) => handleSelect(id)}
 *   showActions={isManager}
 * />
 */

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import type { Service } from '@/types/firestore';

interface ServiceCardProps {
  service: Service;
  isSelected?: boolean;
  onSelect?: (serviceId: string) => void;
  showActions?: boolean;
  onEdit?: (service: Service) => void;
  onDelete?: (serviceId: string) => void;
}

export function ServiceCard({
  service,
  isSelected = false,
  onSelect,
  showActions = false,
  onEdit,
  onDelete
}: ServiceCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(service.id);
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary bg-primary/10' : ''
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === ' ' && handleClick()}
      aria-label={`${service.name} - $${service.price}`}
      aria-pressed={isSelected}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{service.name}</CardTitle>
            <CardDescription className="mt-2">
              <Badge variant="secondary" className="text-lg font-semibold">
                ${service.price.toFixed(2)}
              </Badge>
              <span className="ml-3 text-sm text-muted-foreground">
                {service.duration} min
              </span>
            </CardDescription>
          </div>

          {showActions && onEdit && onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                aria-label="Service actions"
              >
                <MoreVertical className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onEdit(service)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(service.id)}
                  className="text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
```

**Component Conventions:**

- **TypeScript:** All components use strict TypeScript with explicit prop interfaces
- **Composition:** Prefer composition over inheritance; use children prop for flexibility
- **Accessibility:** Include ARIA labels, keyboard navigation, semantic HTML
- **Performance:** Use `React.memo` for expensive list items, `useCallback` for event handlers passed to children

### State Management Architecture

#### State Structure

```typescript
// stores/authStore.ts - Authentication state
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile } from '@/types/firestore'

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setUser: (user: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({ user: state.user }), // Only persist user
    }
  )
)
```

```typescript
// stores/uiStore.ts - Global UI state
import { create } from 'zustand'

interface UIState {
  // Modal states
  isServiceDialogOpen: boolean
  isBarberDialogOpen: boolean
  editingService: Service | null
  editingBarber: UserProfile | null

  // Toast notifications (managed by Sonner, state for triggering)
  toastMessage: string | null

  // Actions
  openServiceDialog: (service?: Service) => void
  closeServiceDialog: () => void
  openBarberDialog: (barber?: UserProfile) => void
  closeBarberDialog: () => void
  showToast: (message: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  isServiceDialogOpen: false,
  isBarberDialogOpen: false,
  editingService: null,
  editingBarber: null,
  toastMessage: null,

  openServiceDialog: (service) =>
    set({ isServiceDialogOpen: true, editingService: service || null }),
  closeServiceDialog: () =>
    set({ isServiceDialogOpen: false, editingService: null }),
  openBarberDialog: (barber) =>
    set({ isBarberDialogOpen: true, editingBarber: barber || null }),
  closeBarberDialog: () =>
    set({ isBarberDialogOpen: false, editingBarber: null }),
  showToast: (message) => set({ toastMessage: message }),
}))
```

#### State Management Patterns

**1. Server State (Firestore data):** Managed by React Query

- Real-time queries use custom `useRealtimeQuery` hook wrapping onSnapshot
- Mutations use `useMutation` with optimistic updates
- Automatic caching, refetching, and background synchronization

**2. Global Client State:** Managed by Zustand

- Authentication state (user, role, session)
- UI state (modals, dialogs, global loading)
- Transient state that doesn't need server persistence

**3. Local Component State:** Managed by `useState` / `useReducer`

- Form inputs (managed by React Hook Form)
- UI animations, hover states
- Temporary selections (selected services before logging)

**When to use which:**

- **React Query:** Any data from Firestore (services, barbers, service logs, reports)
- **Zustand:** Authentication, global UI state, app-wide settings
- **useState:** Component-local UI state, controlled form inputs

### Routing Architecture

#### Route Organization

```
app/
├── layout.tsx                  # Root layout (React Query provider, error boundary)
├── page.tsx                    # Redirects to /login
├── globals.css                 # Tailwind global styles
│
├── login/
│   └── page.tsx                # Login page (role selection + barber selection)
│
├── (auth)/                     # Auth-gated route group
│   ├── layout.tsx              # Auth middleware (redirect if not authenticated)
│   │
│   ├── barber/
│   │   └── dashboard/
│   │       └── page.tsx        # Barber dashboard
│   │
│   └── manager/
│       ├── layout.tsx          # Manager-only middleware + navigation
│       ├── dashboard/
│       │   └── page.tsx        # Manager dashboard
│       ├── barbers/
│       │   └── page.tsx        # Barber management
│       ├── services/
│       │   └── page.tsx        # Service management
│       └── reports/
│           └── page.tsx        # Reports & analytics
│
└── api/                        # Server-side API routes
    ├── barbers/
    │   └── [id]/
    │       └── route.ts        # DELETE /api/barbers/:id
    ├── reports/
    │   └── aggregate/
    │       └── route.ts        # POST /api/reports/aggregate
    └── admin/
        └── recalculate-commissions/
            └── route.ts        # POST /api/admin/recalculate-commissions
```

**Route Groups:**

- `(auth)/`: Protected routes requiring authentication (layout checks token)
- `manager/`: Nested protected routes requiring `role='manager'` (layout checks role)

#### Protected Route Pattern

```typescript
// app/(auth)/layout.tsx - Authentication guard
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/session';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return <>{children}</>;
}
```

```typescript
// app/(auth)/manager/layout.tsx - Manager role guard + navigation
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/session';
import Navigation from '@/components/features/common/Navigation';

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session || session.role !== 'manager') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
```

**Middleware Approach:**

- **Server-side:** Layout components check authentication/role on the server (prevents flash of protected content)
- **Client-side:** Zustand auth store + `useEffect` redirect as fallback for client navigation
- **API Routes:** Manual token verification in each API route handler

### Frontend Services Layer

#### API Client Setup

```typescript
// lib/firebase/config.ts - Firebase SDK initialization
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase (singleton pattern)
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
```

#### Service Example

```typescript
// lib/services/service-logs.ts - Service log operations
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { calculateCommission } from '@/lib/utils/calculations'
import type { Service, UserProfile, ServiceLog } from '@/types/firestore'

export interface CreateServiceLogDto {
  barberId: string
  serviceId: string
  price: number
  commissionRate: number
  status?: 'pending' | 'approved' // Default 'pending', managers can set 'approved'
}

/**
 * Create a service log (barber logs service or manager logs on behalf)
 */
export async function createServiceLog(
  data: CreateServiceLogDto
): Promise<string> {
  const commissionAmount = calculateCommission(data.price, data.commissionRate)

  const logData = {
    barberId: data.barberId,
    serviceId: data.serviceId,
    price: data.price,
    commissionRate: data.commissionRate,
    commissionAmount,
    status: data.status || 'pending',
    createdAt: serverTimestamp(),
    approvedAt: data.status === 'approved' ? serverTimestamp() : null,
    rejectedAt: null,
  }

  const docRef = await addDoc(collection(db, 'serviceLogs'), logData)
  return docRef.id
}

/**
 * Approve a service log (manager only)
 */
export async function approveServiceLog(logId: string): Promise<void> {
  const logRef = doc(db, 'serviceLogs', logId)
  await updateDoc(logRef, {
    status: 'approved',
    approvedAt: serverTimestamp(),
  })
}

/**
 * Reject a service log (manager only)
 */
export async function rejectServiceLog(logId: string): Promise<void> {
  const logRef = doc(db, 'serviceLogs', logId)
  await updateDoc(logRef, {
    status: 'rejected',
    rejectedAt: serverTimestamp(),
  })
}

/**
 * Delete a pending service log (barber can delete own logs)
 */
export async function deleteServiceLog(logId: string): Promise<void> {
  const logRef = doc(db, 'serviceLogs', logId)
  await deleteDoc(logRef)
}

/**
 * Get Firestore query for real-time service logs (used with useRealtimeQuery)
 */
export function getServiceLogsQuery(filters: {
  barberId?: string
  status?: string
}) {
  const constraints = []
  if (filters.barberId) {
    constraints.push(where('barberId', '==', filters.barberId))
  }
  if (filters.status) {
    constraints.push(where('status', '==', filters.status))
  }
  constraints.push(orderBy('createdAt', 'desc'))

  return query(collection(db, 'serviceLogs'), ...constraints)
}
```

**Service Layer Benefits:**

- **Abstraction:** Components don't import Firestore SDK directly
- **Reusability:** Service functions used across multiple components
- **Testability:** Easy to mock service layer in component tests
- **Type Safety:** Explicit DTOs ensure correct data shapes

## Backend Architecture

### Service Architecture

**Architecture Style:** Hybrid Serverless

**Primary Pattern:** Client-side Firestore SDK for real-time CRUD operations with Firestore Security Rules enforcing access control.

**Secondary Pattern:** Next.js API Routes (serverless functions) for elevated operations requiring Firebase Admin SDK.

#### Serverless Architecture

**Function Organization:**

```
app/api/
├── barbers/
│   └── [id]/
│       └── route.ts              # DELETE /api/barbers/:id - Server-side deletion with checks
├── reports/
│   └── aggregate/
│       └── route.ts              # POST /api/reports/aggregate - Complex aggregations
└── admin/
    └── recalculate-commissions/
        └── route.ts              # POST /api/admin/recalculate-commissions - Batch operations
```

**Why Serverless:**

- **Cost-Effective:** Pay per execution, no idle server costs
- **Scalability:** Automatic scaling handled by Vercel
- **Simplicity:** No server management, focuses on business logic
- **Colocation:** API routes colocated with frontend in same repo

#### Function Template

```typescript
// app/api/barbers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth/verify-token'
import { adminDb } from '@/lib/firebase/admin'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication and role
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decodedToken = await verifyAuthToken(token)
    if (decodedToken.role !== 'manager') {
      return NextResponse.json(
        { error: 'Manager access required' },
        { status: 403 }
      )
    }

    const barberId = params.id

    // Check for existing service logs
    const logsSnapshot = await adminDb
      .collection('serviceLogs')
      .where('barberId', '==', barberId)
      .limit(1)
      .get()

    if (!logsSnapshot.empty) {
      return NextResponse.json(
        {
          error: 'Cannot delete barber with existing service logs',
          serviceLogCount: logsSnapshot.size,
        },
        { status: 400 }
      )
    }

    // Delete user document
    await adminDb.collection('users').doc(barberId).delete()

    // Disable Firebase Auth user (don't delete to preserve audit trail)
    await adminAuth.updateUser(barberId, { disabled: true })

    return NextResponse.json({
      success: true,
      message: 'Barber deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting barber:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
```

**Function Conventions:**

- **Authentication:** All API routes verify Firebase Auth token
- **Authorization:** Check custom claims for role-based access
- **Error Handling:** Try/catch with structured error responses
- **Logging:** Console.error for server-side errors (captured by Sentry)

### Database Architecture

#### Schema Design

See "Database Schema" section above for complete Firestore schema.

**Key Design Decisions:**

1. **Denormalization:** Service name/barber name not stored in serviceLogs (fetched via ID references) to avoid stale data
2. **Snapshotting:** Price and commission rate ARE snapshotted to preserve historical accuracy
3. **Status Field:** Single field for workflow state (pending/approved/rejected) rather than boolean flags
4. **Timestamps:** Three timestamps (createdAt, approvedAt, rejectedAt) provide full audit trail

#### Data Access Layer

```typescript
// lib/firebase/repositories/barber-repository.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { UserProfile } from '@/types/firestore'

export class BarberRepository {
  private collectionRef = collection(db, 'users')

  async getAll(): Promise<UserProfile[]> {
    const q = query(this.collectionRef, where('role', '==', 'barber'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as UserProfile
    )
  }

  async getById(id: string): Promise<UserProfile | null> {
    const docSnap = await getDoc(doc(this.collectionRef, id))
    return docSnap.exists()
      ? ({ id: docSnap.id, ...docSnap.data() } as UserProfile)
      : null
  }

  async create(data: Omit<UserProfile, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(this.collectionRef, {
      ...data,
      role: 'barber',
      createdAt: serverTimestamp(),
    })
    return docRef.id
  }

  async update(id: string, data: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(this.collectionRef, id), data)
  }

  async delete(id: string): Promise<void> {
    // Client-side delete not allowed for barbers (use API route)
    throw new Error('Use API route /api/barbers/:id for deletion')
  }

  getRealTimeQuery() {
    return query(this.collectionRef, where('role', '==', 'barber'))
  }
}

export const barberRepository = new BarberRepository()
```

**Repository Pattern Benefits:**

- **Encapsulation:** All Firestore operations for a collection in one place
- **Testability:** Easy to mock repository in tests
- **Consistency:** Ensures data shape consistency across app
- **Future-Proofing:** Can swap Firestore for another database with minimal changes

### Authentication and Authorization

#### Auth Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant FA as Firebase Auth
    participant FS as Firestore
    participant AC as Auth Context

    U->>FE: Click "Manager" or "Barber"

    alt Manager Login
        FE->>FA: signInWithEmailAndPassword(manager@...)
        FA-->>FE: Return ID token with custom claim {role: 'manager'}
        FE->>FS: Fetch user profile from users collection
        FS-->>FE: Return user data
        FE->>AC: Store user + role in Zustand
        AC-->>U: Redirect to /manager/dashboard
    else Barber Login
        U->>FE: Select barber from grid
        FE->>FA: signInWithEmailAndPassword(barber@...)
        FA-->>FE: Return ID token with custom claim {role: 'barber'}
        FE->>FS: Fetch user profile
        FS-->>FE: Return user data
        FE->>AC: Store user + role in Zustand
        AC-->>U: Redirect to /barber/dashboard
    end

    Note over U,AC: All subsequent requests include auth token

    U->>FE: Navigate to protected route
    FE->>AC: Check isAuthenticated + role

    alt Authorized
        AC-->>U: Render page
    else Unauthorized
        AC-->>U: Redirect to /login
    end
```

#### Middleware/Guards

```typescript
// lib/auth/verify-token.ts - Server-side token verification
import { auth as adminAuth } from '@/lib/firebase/admin'
import type { DecodedIdToken } from 'firebase-admin/auth'

export async function verifyAuthToken(token: string): Promise<DecodedIdToken> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    throw new Error('Invalid authentication token')
  }
}

export function requireManager(decodedToken: DecodedIdToken): void {
  if (decodedToken.role !== 'manager') {
    throw new Error('Manager access required')
  }
}

export function requireBarber(decodedToken: DecodedIdToken): void {
  if (decodedToken.role !== 'barber') {
    throw new Error('Barber access required')
  }
}
```

```typescript
// middleware.ts - Next.js middleware for route protection
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  // Public routes
  if (request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Manager-only routes
  if (request.nextUrl.pathname.startsWith('/manager')) {
    // Role check handled in layout server component (can't decode JWT in edge middleware)
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

**Multi-Layer Authorization:**

1. **Client-side Route Guards:** Middleware redirects to /login if no token
2. **Server-side Layout Guards:** Server components check role before rendering
3. **Firestore Security Rules:** Enforce access at database level
4. **API Route Authorization:** Verify token + role in each API handler

**Why Multiple Layers:**

- **Client guards:** Better UX (immediate redirect)
- **Server guards:** Prevent unauthorized server rendering
- **Firestore rules:** Security guarantee (client can't bypass)
- **API authorization:** Protect elevated operations

## Unified Project Structure

```plaintext
salonflow/
├── .github/                         # CI/CD workflows
│   └── workflows/
│       ├── ci.yml                   # Test + lint on PR
│       ├── deploy.yml               # Deploy to Vercel on main push
│       └── firebase-deploy.yml      # Deploy Firestore rules/indexes
│
├── app/                             # Next.js App Router
│   ├── layout.tsx                   # Root layout (providers, fonts)
│   ├── page.tsx                     # Root redirects to /login
│   ├── globals.css                  # Tailwind + global styles
│   │
│   ├── login/
│   │   └── page.tsx                 # Login page
│   │
│   ├── (auth)/                      # Auth-gated route group
│   │   ├── layout.tsx               # Auth middleware
│   │   ├── barber/
│   │   │   └── dashboard/
│   │   │       └── page.tsx         # Barber dashboard
│   │   └── manager/
│   │       ├── layout.tsx           # Manager middleware + nav
│   │       ├── dashboard/
│   │       │   └── page.tsx         # Manager dashboard
│   │       ├── barbers/
│   │       │   └── page.tsx         # Barber management
│   │       ├── services/
│   │       │   └── page.tsx         # Service management
│   │       └── reports/
│   │           └── page.tsx         # Reports & analytics
│   │
│   └── api/                         # Server-side API routes
│       ├── barbers/
│       │   └── [id]/
│       │       └── route.ts         # DELETE /api/barbers/:id
│       ├── reports/
│       │   └── aggregate/
│       │       └── route.ts         # POST /api/reports/aggregate
│       └── admin/
│           └── recalculate-commissions/
│               └── route.ts         # POST /api/admin/recalculate-commissions
│
├── components/                      # React components
│   ├── ui/                          # ShadCN UI components (auto-generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   └── features/                    # Feature-specific components
│       ├── auth/
│       ├── dashboard/
│       ├── services/
│       ├── barbers/
│       ├── service-logs/
│       ├── reports/
│       └── common/
│
├── lib/                             # Core utilities
│   ├── firebase/
│   │   ├── config.ts                # Firebase SDK initialization
│   │   ├── admin.ts                 # Firebase Admin SDK (server-side)
│   │   └── repositories/            # Data access layer
│   │       ├── barber-repository.ts
│   │       ├── service-repository.ts
│   │       └── service-log-repository.ts
│   ├── validations/
│   │   └── schemas.ts               # Zod validation schemas
│   ├── utils/
│   │   ├── calculations.ts          # Commission calculations
│   │   ├── date-helpers.ts          # Date formatting/filtering
│   │   └── cn.ts                    # Class name utility (ShadCN)
│   ├── auth/
│   │   ├── session.ts               # Server-side session helpers
│   │   └── verify-token.ts          # Token verification
│   └── services/
│       ├── auth-service.ts
│       ├── service-management.ts
│       ├── barber-management.ts
│       ├── service-logging.ts
│       └── reporting.ts
│
├── hooks/                           # Custom React hooks
│   ├── useRealtimeQuery.ts          # Real-time Firestore wrapper
│   ├── useServices.ts               # Real-time services
│   ├── useBarbers.ts                # Real-time barbers
│   ├── useServiceLogs.ts            # Real-time service logs
│   └── useAuth.ts                   # Auth hook (wraps Zustand)
│
├── stores/                          # Zustand state stores
│   ├── authStore.ts                 # Authentication state
│   └── uiStore.ts                   # UI state (modals, toasts)
│
├── types/                           # TypeScript type definitions
│   ├── firestore.ts                 # Firestore document types
│   ├── api.ts                       # API request/response types
│   └── global.d.ts                  # Global type declarations
│
├── tests/                           # Test files
│   ├── unit/                        # Unit tests (Vitest)
│   │   ├── utils/
│   │   ├── hooks/
│   │   └── services/
│   ├── component/                   # Component tests (Testing Library)
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── services/
│   ├── e2e/                         # End-to-end tests (Playwright)
│   │   ├── auth.spec.ts
│   │   ├── service-management.spec.ts
│   │   ├── service-logging.spec.ts
│   │   └── reports.spec.ts
│   └── fixtures/                    # Test data fixtures
│       ├── users.json
│       ├── services.json
│       └── service-logs.json
│
├── public/                          # Static assets
│   ├── images/
│   ├── icons/
│   └── manifest.json                # PWA manifest
│
├── scripts/                         # Utility scripts
│   ├── seed-dev.ts                  # Seed Firebase Emulator with test data
│   └── generate-types.ts            # Generate types from Firestore
│
├── docs/                            # Documentation
│   ├── prd.md                       # Product Requirements Document
│   ├── architecture.md              # This file
│   └── firebase-setup.md            # Firebase setup guide
│
├── firestore.rules                  # Firestore security rules
├── firestore.indexes.json           # Firestore composite indexes
├── firebase.json                    # Firebase project configuration
├── .env.example                     # Environment variable template
├── .env.local                       # Local environment variables (gitignored)
├── .eslintrc.json                   # ESLint configuration
├── .prettierrc                      # Prettier configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── next.config.js                   # Next.js configuration
├── vitest.config.ts                 # Vitest test configuration
├── playwright.config.ts             # Playwright E2E configuration
├── package.json                     # Dependencies and scripts
└── README.md                        # Setup and development instructions
```

**Key Organizational Principles:**

- **Colocation:** Feature components and related logic grouped by domain
- **Clear Separation:** app/ (routing), components/ (UI), lib/ (business logic), hooks/ (custom hooks)
- **Testability:** tests/ mirrors app structure for easy test location
- **Configuration:** All config files at root for tool discoverability

## Development Workflow

### Local Development Setup

#### Prerequisites

```bash
# Install Node.js v20 LTS (use nvm for version management)
nvm install 20
nvm use 20

# Install pnpm (faster package manager)
npm install -g pnpm

# Install Firebase CLI (for emulators)
npm install -g firebase-tools

# Verify installations
node --version  # v20.x.x
pnpm --version  # v8.x.x
firebase --version  # v13.x.x
```

#### Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd salonflow

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with Firebase config values
# (Get from Firebase Console > Project Settings)

# Initialize Firebase emulators (if first time)
firebase init emulators
# Select: Firestore, Authentication
# Accept default ports

# Seed emulator with test data
pnpm seed:dev

# Start Firebase Emulators in background
pnpm dev:emulators &

# Start Next.js development server
pnpm dev

# Open browser to http://localhost:3000
```

#### Development Commands

```bash
# Start all services (concurrently)
pnpm dev:all
# Runs: Firebase Emulators + Next.js dev server

# Start frontend only (assumes emulators running)
pnpm dev

# Start backend only (emulators)
pnpm dev:emulators

# Run tests
pnpm test              # Unit tests (watch mode)
pnpm test:ci           # Unit tests (run once)
pnpm test:e2e          # E2E tests (requires emulators + dev server running)
pnpm test:coverage     # Generate coverage report

# Linting and formatting
pnpm lint              # Run ESLint
pnpm lint:fix          # Fix ESLint errors
pnpm format            # Run Prettier
pnpm type-check        # TypeScript type checking

# Database operations
pnpm seed:dev          # Seed emulator with test data
pnpm db:reset          # Reset emulator data and reseed
pnpm db:export         # Export emulator data
pnpm db:import         # Import emulator data

# Build for production
pnpm build             # Next.js production build
pnpm start             # Start production server locally
```

### Environment Configuration

#### Required Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=salonflow-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=salonflow-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=salonflow-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Backend (Server-side only, do NOT prefix with NEXT_PUBLIC_)
FIREBASE_ADMIN_PROJECT_ID=salonflow-prod
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@salonflow-prod.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXXXXXXXXXX\n-----END PRIVATE KEY-----\n"

# Sentry (Error tracking)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@o123456.ingest.sentry.io/123456
SENTRY_AUTH_TOKEN=sntrys_XXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Development: Use Firebase Emulator
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true  # Set to false in production
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

**Environment Files:**

- `.env.local` - Local development (gitignored)
- `.env.production` - Production (stored in Vercel dashboard)
- `.env.example` - Template with placeholder values (committed to git)

**Security Notes:**

- `NEXT_PUBLIC_*` vars are exposed to client (safe for Firebase client config)
- Non-prefixed vars only accessible in API routes/server components
- Never commit `.env.local` or private keys to git
- Firebase Admin private key stored in Vercel environment variables

## Deployment Architecture

### Deployment Strategy

**Frontend Deployment:**

- **Platform:** Vercel
- **Build Command:** `pnpm build` (Next.js production build)
- **Output Directory:** `.next/` (automatic, handled by Vercel)
- **CDN/Edge:** Vercel Edge Network (automatic global CDN)

**Backend Deployment:**

- **Platform:** Firebase (Firestore, Auth, Storage) + Vercel (API Routes as serverless functions)
- **Build Command:** N/A (Firestore rules deployed separately)
- **Deployment Method:**
  - Firestore rules: `firebase deploy --only firestore:rules,firestore:indexes`
  - API routes: Deployed with Next.js to Vercel (automatic)

**Deployment Triggers:**

- **Production:** Automatic deploy on push to `main` branch
- **Staging:** Automatic deploy on push to `develop` branch (if configured)
- **Preview:** Automatic deploy on all pull requests (preview URL)

### CI/CD Pipeline

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  # Job 1: Lint, type-check, unit tests, build
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm lint

      - name: Run TypeScript type check
        run: pnpm type-check

      - name: Run unit tests
        run: pnpm test:ci

      - name: Build application
        run: pnpm build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
          NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next/

  # Job 2: E2E tests (only on main branch)
  e2e:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Start Firebase Emulators
        run: pnpm dev:emulators &

      - name: Wait for emulators
        run: sleep 10

      - name: Seed test data
        run: pnpm seed:dev

      - name: Start Next.js dev server
        run: pnpm dev &

      - name: Wait for dev server
        run: npx wait-on http://localhost:3000

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  # Job 3: Deploy to Vercel (only on main branch, after tests pass)
  deploy-vercel:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: [test, e2e]
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  # Job 4: Deploy Firestore rules (only on main branch, after tests pass)
  deploy-firebase:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: [test, e2e]
    steps:
      - uses: actions/checkout@v4

      - name: Deploy Firestore rules and indexes
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only firestore:rules,firestore:indexes
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
          PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
```

### Environments

| Environment | Frontend URL                                    | Backend URL                                                         | Purpose                                    |
| ----------- | ----------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------ |
| Development | http://localhost:3000                           | http://localhost:3000/api (local emulators)                         | Local development with Firebase Emulators  |
| Staging     | https://salonflow-staging.vercel.app            | https://salonflow-staging.vercel.app/api (Firebase staging project) | Pre-production testing (optional, not MVP) |
| Production  | https://salonflow.vercel.app (or custom domain) | https://salonflow.vercel.app/api (Firebase prod project)            | Live production environment                |

**Environment Configuration:**

- Development uses Firebase Emulators (no real data, safe testing)
- Production uses Firebase production project
- Staging optional post-MVP (separate Firebase project recommended)

## Security and Performance

### Security Requirements

**Frontend Security:**

- **CSP Headers:**

  ```
  Content-Security-Policy:
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https://firebasestorage.googleapis.com;
    connect-src 'self' https://*.firebaseio.com https://*.googleapis.com;
  ```

  Configured in `next.config.js` headers

- **XSS Prevention:** React escapes all strings by default; avoid `dangerouslySetInnerHTML`; sanitize any user-generated HTML (not applicable in MVP)

- **Secure Storage:**
  - Auth tokens stored in httpOnly cookies (not localStorage)
  - Sensitive data never cached in browser storage
  - Zustand persist only stores non-sensitive user profile data

**Backend Security:**

- **Input Validation:**
  - All user inputs validated with Zod schemas on client-side
  - Firestore security rules re-validate on server-side
  - API routes validate request bodies with Zod before processing

- **Rate Limiting:**
  - Vercel Edge Functions have built-in rate limiting (100 req/10s per IP by default)
  - Custom rate limiting for sensitive operations (future): Use Vercel Edge Config or Redis

- **CORS Policy:**
  - API routes only accept requests from same origin (Next.js handles CORS automatically)
  - Firebase CORS configured to allow requests from Vercel deployment URLs only

**Authentication Security:**

- **Token Storage:** Firebase Auth tokens stored in httpOnly cookies (via Next.js middleware)
- **Session Management:** Firebase handles token refresh automatically; tokens expire after 1 hour
- **Password Policy:** Firebase Auth default policy (min 6 characters); custom policy post-MVP (min 8, uppercase, number, special char)

### Performance Optimization

**Frontend Performance:**

- **Bundle Size Target:** < 200KB initial JS bundle (gzipped)
  - Achieved via: Code splitting (App Router automatic), tree-shaking, dynamic imports for heavy components (reports page charts)

- **Loading Strategy:**
  - Critical CSS inlined by Tailwind
  - Fonts preloaded (`next/font` with `display: swap`)
  - Images lazy-loaded via Next.js `<Image>` component with placeholder blur
  - Non-critical JS lazy-loaded (React.lazy for report charts)

- **Caching Strategy:**
  - React Query caches Firestore data (staleTime: Infinity for real-time queries, 5 minutes for aggregations)
  - Static assets cached by Vercel CDN (1 year cache headers)
  - API routes cache aggregations for 5 minutes using Vercel Edge Config

**Backend Performance:**

- **Response Time Target:** < 500ms for p95 API route responses
  - Achieved via: Firestore indexes, pagination (50 rows/page), server-side aggregations cached

- **Database Optimization:**
  - Composite indexes for all complex queries (see firestore.indexes.json)
  - Pagination with cursor-based queries (`startAfter` in Firestore)
  - Limit queries to essential fields only (no `select *` equivalent)

- **Caching Strategy:**
  - Aggregation queries (total revenue, top barbers) cached for 5 minutes
  - Real-time data (service logs, pending approvals) not cached (onSnapshot provides instant updates)

## Testing Strategy

### Testing Pyramid

```
        E2E Tests (10%)
       /               \
    Integration Tests (20%)
   /                       \
Frontend Unit (35%)    Backend Unit (35%)
```

**Distribution:**

- **Frontend Unit Tests:** 35% effort - Hooks, utilities, calculations, Zustand stores
- **Backend Unit Tests:** 35% effort - API routes, service functions, repositories
- **Integration Tests:** 20% effort - Component tests with mocked Firestore/React Query
- **E2E Tests:** 10% effort - Critical user journeys with Playwright + Firebase Emulator

### Test Organization

#### Frontend Tests

```
tests/
├── unit/
│   ├── hooks/
│   │   ├── useRealtimeQuery.test.ts
│   │   ├── useServices.test.ts
│   │   └── useAuth.test.ts
│   ├── utils/
│   │   ├── calculations.test.ts          # calculateCommission()
│   │   ├── date-helpers.test.ts
│   │   └── cn.test.ts
│   ├── stores/
│   │   ├── authStore.test.ts
│   │   └── uiStore.test.ts
│   └── validations/
│       └── schemas.test.ts                # Zod schema tests
│
├── component/
│   ├── auth/
│   │   ├── LoginRoleSelection.test.tsx
│   │   └── BarberProfileSelection.test.tsx
│   ├── dashboard/
│   │   ├── ManagerDashboard.test.tsx
│   │   ├── BarberDashboard.test.tsx
│   │   └── KPICard.test.tsx
│   ├── services/
│   │   ├── ServiceGrid.test.tsx
│   │   ├── ServiceCard.test.tsx
│   │   └── ServiceForm.test.tsx
│   └── service-logs/
│       ├── ServiceLogTable.test.tsx
│       └── PendingApprovalsTable.test.tsx
```

#### Backend Tests

```
tests/
├── unit/
│   ├── api/
│   │   ├── barbers/
│   │   │   └── delete-barber.test.ts     # API route unit test
│   │   └── reports/
│   │       └── aggregate.test.ts
│   ├── services/
│   │   ├── auth-service.test.ts
│   │   ├── service-management.test.ts
│   │   ├── barber-management.test.ts
│   │   └── service-logging.test.ts
│   └── repositories/
│       ├── barber-repository.test.ts
│       ├── service-repository.test.ts
│       └── service-log-repository.test.ts
│
└── security/
    └── firestore-rules.test.ts            # Firebase Rules Unit Testing
```

#### E2E Tests

```
tests/
├── e2e/
│   ├── auth.spec.ts                       # Login flows (manager + barber)
│   ├── service-management.spec.ts         # CRUD services
│   ├── barber-management.spec.ts          # CRUD barbers
│   ├── service-logging.spec.ts            # Log services, approve, reject
│   ├── reports.spec.ts                    # Reports page, filtering, search
│   └── real-time-sync.spec.ts             # Multi-browser real-time updates
│
└── fixtures/
    ├── users.json                          # Test user data
    ├── services.json                       # Test service data
    └── service-logs.json                   # Test service log data
```

### Test Examples

#### Frontend Component Test

```typescript
// tests/component/services/ServiceCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ServiceCard } from '@/components/features/services/ServiceCard';
import type { Service } from '@/types/firestore';

const mockService: Service = {
  id: 'service_123',
  name: 'Haircut',
  price: 25.00,
  duration: 30,
  createdAt: new Date('2025-10-01'),
};

describe('ServiceCard', () => {
  it('renders service information correctly', () => {
    render(<ServiceCard service={mockService} />);

    expect(screen.getByText('Haircut')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<ServiceCard service={mockService} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onSelect).toHaveBeenCalledWith('service_123');
  });

  it('shows selected state when isSelected is true', () => {
    render(<ServiceCard service={mockService} isSelected={true} />);

    const card = screen.getByRole('button');
    expect(card).toHaveClass('ring-2 ring-primary');
    expect(card).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows actions dropdown when showActions is true', () => {
    render(<ServiceCard service={mockService} showActions={true} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByLabelText('Service actions')).toBeInTheDocument();
  });

  it('supports keyboard navigation (Space to select)', () => {
    const onSelect = vi.fn();
    render(<ServiceCard service={mockService} onSelect={onSelect} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ' });

    expect(onSelect).toHaveBeenCalledWith('service_123');
  });
});
```

#### Backend API Test

```typescript
// tests/unit/api/barbers/delete-barber.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DELETE } from '@/app/api/barbers/[id]/route'
import { NextRequest } from 'next/server'
import * as verifyToken from '@/lib/auth/verify-token'
import { adminDb } from '@/lib/firebase/admin'

vi.mock('@/lib/auth/verify-token')
vi.mock('@/lib/firebase/admin')

describe('DELETE /api/barbers/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 if no auth token provided', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/barbers/barber_123'
    )

    const response = await DELETE(request, { params: { id: 'barber_123' } })
    const json = await response.json()

    expect(response.status).toBe(401)
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 403 if user is not a manager', async () => {
    vi.mocked(verifyToken.verifyAuthToken).mockResolvedValue({
      role: 'barber',
      uid: 'user_123',
    } as any)

    const request = new NextRequest(
      'http://localhost:3000/api/barbers/barber_123',
      {
        headers: { authorization: 'Bearer fake-token' },
      }
    )

    const response = await DELETE(request, { params: { id: 'barber_123' } })
    const json = await response.json()

    expect(response.status).toBe(403)
    expect(json.error).toBe('Manager access required')
  })

  it('returns 400 if barber has existing service logs', async () => {
    vi.mocked(verifyToken.verifyAuthToken).mockResolvedValue({
      role: 'manager',
      uid: 'manager_123',
    } as any)
    vi.mocked(adminDb.collection).mockReturnValue({
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      get: vi.fn().mockResolvedValue({ empty: false, size: 5 }),
    } as any)

    const request = new NextRequest(
      'http://localhost:3000/api/barbers/barber_123',
      {
        headers: { authorization: 'Bearer fake-token' },
      }
    )

    const response = await DELETE(request, { params: { id: 'barber_123' } })
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toContain('Cannot delete barber')
    expect(json.serviceLogCount).toBe(5)
  })

  it('successfully deletes barber if no service logs exist', async () => {
    vi.mocked(verifyToken.verifyAuthToken).mockResolvedValue({
      role: 'manager',
      uid: 'manager_123',
    } as any)
    vi.mocked(adminDb.collection).mockReturnValue({
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      get: vi.fn().mockResolvedValue({ empty: true }),
      doc: vi
        .fn()
        .mockReturnValue({ delete: vi.fn().mockResolvedValue(undefined) }),
    } as any)

    const request = new NextRequest(
      'http://localhost:3000/api/barbers/barber_123',
      {
        headers: { authorization: 'Bearer fake-token' },
      }
    )

    const response = await DELETE(request, { params: { id: 'barber_123' } })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.message).toBe('Barber deleted successfully')
  })
})
```

#### E2E Test

```typescript
// tests/e2e/service-logging.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Service Logging & Approval Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Reset Firebase Emulator data
    await page.request.delete(
      'http://localhost:8080/emulator/v1/projects/salonflow-test/databases/(default)/documents'
    )
    // Seed test data
    await page.request.post('http://localhost:3000/api/test/seed')
  })

  test('Barber can log multiple services and manager can approve', async ({
    browser,
  }) => {
    // Create two browser contexts (simulate two users)
    const barberContext = await browser.newContext()
    const managerContext = await browser.newContext()

    const barberPage = await barberContext.newPage()
    const managerPage = await managerContext.newPage()

    // Barber logs in
    await barberPage.goto('http://localhost:3000/login')
    await barberPage.click('text=Barber')
    await barberPage.click('text=John Barber')
    await expect(barberPage).toHaveURL('/barber/dashboard')

    // Barber selects 2 services
    await barberPage.click('text=Haircut')
    await barberPage.click('text=Beard Trim')
    await expect(
      barberPage.locator('button', { hasText: 'Log 2 Service(s)' })
    ).toBeVisible()

    // Barber logs services
    await barberPage.click('button', { hasText: 'Log 2 Service(s)' })
    await expect(
      barberPage.locator('text=2 service(s) logged successfully')
    ).toBeVisible()

    // Verify pending status in barber's table
    await expect(
      barberPage.locator('table tbody tr', { hasText: 'Pending' })
    ).toHaveCount(2)

    // Manager logs in
    await managerPage.goto('http://localhost:3000/login')
    await managerPage.click('text=Manager')
    await expect(managerPage).toHaveURL('/manager/dashboard')

    // Manager sees pending approvals (real-time update)
    await expect(managerPage.locator('text=Pending Approvals')).toBeVisible()
    await expect(managerPage.locator('table tbody tr')).toHaveCount(2)

    // Manager approves first service
    await managerPage
      .locator('table tbody tr')
      .first()
      .locator('[aria-label="Approve"]')
      .click()
    await expect(managerPage.locator('text=Service log approved')).toBeVisible()

    // Verify pending queue updated (1 remaining)
    await expect(managerPage.locator('table tbody tr')).toHaveCount(1)

    // Barber's dashboard updates in real-time
    await expect(
      barberPage.locator('table tbody tr', { hasText: 'Approved' })
    ).toHaveCount(1)
    await expect(
      barberPage.locator('table tbody tr', { hasText: 'Pending' })
    ).toHaveCount(1)

    // Verify daily stats updated
    await expect(
      barberPage.locator('text=Services Today').locator('..').locator('text=1')
    ).toBeVisible()

    await barberContext.close()
    await managerContext.close()
  })

  test('Barber can delete own pending logs', async ({ page }) => {
    // Login as barber
    await page.goto('http://localhost:3000/login')
    await page.click('text=Barber')
    await page.click('text=John Barber')

    // Log a service
    await page.click('text=Haircut')
    await page.click('button', { hasText: 'Log 1 Service' })
    await expect(
      page.locator('table tbody tr', { hasText: 'Pending' })
    ).toHaveCount(1)

    // Delete pending log
    await page
      .locator('table tbody tr')
      .first()
      .locator('[aria-label="Delete"]')
      .click()
    await page.click('text=Delete') // Confirm dialog
    await expect(page.locator('text=Service log deleted')).toBeVisible()

    // Verify log removed from table
    await expect(page.locator('table tbody tr')).toHaveCount(0)
    await expect(page.locator('text=No services logged yet')).toBeVisible()
  })
})
```

## Coding Standards

### Critical Fullstack Rules

- **Type Sharing:** Always define shared types in `types/firestore.ts` and import from there. Never duplicate type definitions between components and services.

- **API Calls:** Never make direct Firestore SDK calls from components. Use repository pattern or service layer functions (`lib/services/*.ts`).

- **Environment Variables:** Access only through config objects (`lib/firebase/config.ts`), never `process.env` directly in components. Use `NEXT_PUBLIC_*` prefix for client-accessible vars.

- **Error Handling:** All Firestore operations must use try/catch. Display user-friendly errors via toast notifications (Sonner). Log errors to Sentry in production.

- **State Updates:** Never mutate Zustand state directly. Use provided actions. For React Query, use `useMutation` with proper optimistic updates and rollback.

- **Real-time Listeners:** Always wrap Firestore `onSnapshot` in React Query `useQuery` with cleanup. Never create listeners in component body without cleanup.

- **Security Rules First:** Design Firestore queries assuming security rules will block unauthorized access. Never rely solely on client-side auth checks.

- **Commission Calculations:** Always use `calculateCommission()` utility function. Never inline calculation logic to ensure consistency.

- **Date Handling:** Use `date-fns` for all date operations. Store dates as Firestore Timestamps in database, convert to JS Date for display.

- **Form Validation:** All forms use React Hook Form + Zod schemas. Never use uncontrolled inputs or manual validation.

### Naming Conventions

| Element              | Frontend                      | Backend    | Example                                           |
| -------------------- | ----------------------------- | ---------- | ------------------------------------------------- |
| Components           | PascalCase                    | -          | `UserProfile.tsx`, `ServiceCard.tsx`              |
| Hooks                | camelCase with 'use' prefix   | -          | `useAuth.ts`, `useServices.ts`                    |
| Utilities            | camelCase                     | camelCase  | `calculateCommission`, `formatCurrency`           |
| API Routes           | -                             | kebab-case | `/api/barbers/[id]/route.ts` → `/api/barbers/123` |
| Database Collections | -                             | camelCase  | `users`, `services`, `serviceLogs`                |
| Firestore Fields     | -                             | camelCase  | `barberId`, `commissionRate`, `createdAt`         |
| Type Interfaces      | PascalCase                    | PascalCase | `UserProfile`, `ServiceLog`, `CreateServiceDto`   |
| Zustand Stores       | camelCase with 'Store' suffix | -          | `authStore`, `uiStore`                            |

**Additional Conventions:**

- Constants: UPPER_SNAKE_CASE (e.g., `MAX_SERVICES_PER_LOG`, `DEFAULT_COMMISSION_RATE`)
- Files: kebab-case (e.g., `service-log-table.tsx`, `barber-repository.ts`)
- CSS classes (Tailwind): Use `cn()` utility for conditional classes

## Error Handling Strategy

### Error Flow

```mermaid
sequenceDiagram
    participant C as Component
    participant S as Service Layer
    participant FS as Firestore
    participant RQ as React Query
    participant UI as Toast/UI

    C->>S: Call service function (e.g., createService)
    S->>FS: Firestore operation

    alt Success
        FS-->>S: Operation successful
        S-->>RQ: Return data
        RQ->>C: Update cache, trigger re-render
        C->>UI: Show success toast
    else Firebase Error
        FS-->>S: Throw FirebaseError
        S->>S: Log error (console.error)
        S->>S: Transform to user-friendly message
        S-->>RQ: Throw error
        RQ->>RQ: Rollback optimistic update
        RQ->>C: Error state
        C->>UI: Show error toast
        C->>UI: Log to Sentry (production)
    else Network Error
        FS-->>S: Network timeout
        S->>S: Detect offline state
        S-->>C: Return offline error
        C->>UI: Show persistent "You're offline" toast
    end
```

### Error Response Format

```typescript
interface ApiError {
  error: {
    code: string // Machine-readable error code (e.g., "PERMISSION_DENIED")
    message: string // User-friendly error message
    details?: Record<string, any> // Additional context (e.g., { serviceLogCount: 5 })
    timestamp: string // ISO 8601 timestamp
    requestId: string // Unique request ID for debugging
  }
}
```

**Example API Error Response:**

```json
{
  "error": {
    "code": "BARBER_HAS_LOGS",
    "message": "Cannot delete barber with existing service logs",
    "details": {
      "barberId": "barber_123",
      "serviceLogCount": 42
    },
    "timestamp": "2025-10-09T14:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### Frontend Error Handling

```typescript
// lib/utils/error-handler.ts
import { toast } from 'sonner'
import * as Sentry from '@sentry/nextjs'
import { FirebaseError } from 'firebase/app'

export function handleError(error: unknown, context?: string): void {
  console.error(`Error in ${context}:`, error)

  // Log to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, { tags: { context } })
  }

  // Display user-friendly message
  const message = getUserFriendlyMessage(error)
  toast.error(message, {
    duration: 6000,
    action: {
      label: 'Retry',
      onClick: () => window.location.reload(),
    },
  })
}

function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'permission-denied':
        return "You don't have permission to perform this action."
      case 'not-found':
        return 'The requested resource was not found.'
      case 'already-exists':
        return 'This item already exists.'
      case 'unauthenticated':
        return 'Please log in to continue.'
      default:
        return 'An error occurred. Please try again.'
    }
  }

  if (error instanceof Error) {
    // API errors with specific messages
    if (error.message.includes('offline')) {
      return "You're offline. Changes will sync when reconnected."
    }
    return error.message
  }

  return 'An unexpected error occurred. Please try again.'
}

export function isOfflineError(error: unknown): boolean {
  return error instanceof Error && error.message.includes('offline')
}
```

**Usage in Components:**

```typescript
// components/features/services/ServiceForm.tsx
import { handleError } from '@/lib/utils/error-handler'

const { mutate: createService } = useMutation({
  mutationFn: createServiceLog,
  onError: (error) => handleError(error, 'ServiceForm.createService'),
  onSuccess: () => toast.success('Service created successfully'),
})
```

### Backend Error Handling

```typescript
// app/api/barbers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = uuidv4()

  try {
    // Business logic here

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[${requestId}] Error deleting barber:`, error)

    // Log to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        tags: { endpoint: '/api/barbers/:id', method: 'DELETE' },
        extra: { barberId: params.id, requestId },
      })
    }

    // Return structured error
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message:
            'An error occurred while deleting the barber. Please try again.',
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      { status: 500 }
    )
  }
}
```

**Error Response Standards:**

- 400 Bad Request: Invalid input, validation errors
- 401 Unauthorized: Missing or invalid auth token
- 403 Forbidden: Valid token but insufficient permissions
- 404 Not Found: Resource doesn't exist
- 409 Conflict: Operation conflicts with current state (e.g., deleting barber with logs)
- 500 Internal Server Error: Unexpected errors

## Monitoring and Observability

### Monitoring Stack

- **Frontend Monitoring:** Vercel Analytics (Web Vitals, page views, geographic distribution)
- **Backend Monitoring:** Vercel Serverless Function logs (invocation count, duration, errors)
- **Error Tracking:** Sentry (unhandled exceptions, React error boundaries, API route errors)
- **Performance Monitoring:** Firebase Performance Monitoring (network request latency, Firestore operation timing)

**Integration Setup:**

```typescript
// app/layout.tsx - Sentry initialization
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
  });
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set user context for Sentry
    const user = useAuthStore.getState().user;
    if (user) {
      Sentry.setUser({ id: user.id, username: user.username, role: user.role });
    }
  }, []);

  return <>{children}</>;
}
```

### Key Metrics

**Frontend Metrics:**

- **Core Web Vitals:**
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1
- **JavaScript Errors:** Track unhandled errors, React component errors
- **API Response Times:** Track Firestore query latency, API route response time
- **User Interactions:** Track button clicks, form submissions (via Vercel Analytics)

**Backend Metrics:**

- **Request Rate:** Requests per second to API routes
- **Error Rate:** Percentage of requests resulting in 4xx/5xx errors (target: < 1%)
- **Response Time:** p50, p95, p99 latency for API routes (target p95: < 500ms)
- **Database Query Performance:**
  - Firestore read/write latency (tracked by Firebase Performance Monitoring)
  - Query result size (should stay under 50 docs per query via pagination)

**Business Metrics (Custom):**

- Service logs created per day
- Approval workflow latency (time from log creation to approval)
- Active users (managers + barbers logged in per day)

**Alerting (Post-MVP):**

- Sentry alert: > 10 errors/minute
- Vercel alert: API route p95 latency > 1s
- Firebase alert: Firestore quota exceeded (approaching daily read/write limits)

---

## Checklist Results Report

_This section will be populated after running the architect-checklist to validate completeness of the architecture document._

**Note to user:** The architecture document has been fully drafted. Before marking this complete, I recommend running the `architect-checklist` to validate all architectural concerns are addressed. Would you like me to proceed with that validation step, or would you prefer to review the document first?

---

**Architecture Document Status:** ✅ Complete (pending checklist validation)

**Next Steps:**

1. Run `*execute-checklist architect-checklist` to validate completeness
2. Address any gaps identified by checklist
3. Transition to UX Expert agent for detailed UI specifications
4. Begin development with Story 1.1 (Project Scaffolding & Infrastructure Setup)
