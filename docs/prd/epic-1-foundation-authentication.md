# Epic 1: Foundation & Authentication

**Epic Goal:** Establish a deployable foundation with complete project infrastructure, CI/CD pipeline, Firebase configuration, role-based authentication system, and basic dashboard shells for both manager and barber roles, enabling users to log in and access role-appropriate interfaces.

## Story 1.1: Project Scaffolding & Infrastructure Setup

**As a** developer,
**I want** to set up the Next.js project with all required dependencies and folder structure,
**so that** the team has a consistent development environment and can begin building features.

**Acceptance Criteria:**

1. Next.js 14+ project initialized with App Router and TypeScript configuration
2. Project folder structure matches Technical Assumptions specification (app/, components/, lib/, hooks/, types/, etc.)
3. Tailwind CSS v3.4+ configured with dark theme defaults and custom color palette (#0a0a0a backgrounds, #f59e0b primary accent)
4. ShadCN UI components installed and configured with theme customization
5. Package.json includes all required dependencies (React 18.3+, Firebase 10.12+, Zustand 4.5+, React Query 5.40+, React Hook Form, Zod, date-fns, Sonner)
6. TypeScript strict mode enabled with noUncheckedIndexedAccess: true
7. ESLint and Prettier configured with Next.js + TypeScript strict rules
8. `.nvmrc` file specifies Node.js v20 LTS
9. Environment variable template (`.env.example`) created with Firebase config placeholders
10. README.md includes setup instructions for local development

## Story 1.2: Firebase Project Configuration

**As a** developer,
**I want** to configure Firebase services and create Firestore collections with security rules,
**so that** the application has a functional backend database with proper access control.

**Acceptance Criteria:**

1. Firebase project created (`salonflow-prod` or appropriate name)
2. Firestore database initialized with collections: `users`, `services`, `serviceLogs`
3. `firestore.rules` file created with initial security rules (authenticated users only, role-based access stubs)
4. `firestore.indexes.json` file created with required composite indexes (barberId+status+createdAt, status+createdAt, barberId+createdAt)
5. Firebase Authentication enabled with email/password provider
6. Firebase configuration added to `.env.local` (API keys, project ID, etc.)
7. `lib/firebase/config.ts` created with Firebase SDK initialization
8. Firebase Emulator Suite configured for local development (Firestore + Auth)
9. Seed script (`scripts/seed-dev.ts`) creates test data: 1 manager, 3 barbers, 5 services
10. Documentation in `/docs/firebase-setup.md` explains setup steps

## Story 1.3: CI/CD Pipeline Setup

**As a** development team,
**I want** automated testing and deployment pipelines,
**so that** code quality is maintained and deployments are reliable.

**Acceptance Criteria:**

1. GitHub Actions workflow file (`.github/workflows/ci-cd.yml`) created
2. **Test job** runs on all pushes/PRs: ESLint, Prettier check, TypeScript type-check, unit tests (Vitest), build
3. **E2E job** runs on main branch only: Start emulators, run Playwright tests
4. **Deploy job** runs on main branch only after tests pass: Deploy to Vercel, deploy Firestore rules
5. Vercel project connected to GitHub repository
6. Deployment configured for automatic deploys on main branch push
7. Preview deployments configured for all PRs
8. Husky pre-commit hook configured with lint-staged (runs ESLint + Prettier on staged files)
9. Status checks required for PR merges (tests must pass)
10. First successful deployment to Vercel completes with health check passing

## Story 1.4: State Management & Real-time Infrastructure

**As a** developer,
**I want** global state management and real-time data patterns established,
**so that** features can be built with consistent state handling and live data updates.

**Acceptance Criteria:**

1. Zustand store created for authentication (`stores/authStore.ts`) with user, role, login/logout actions
2. Zustand store created for UI state (`stores/uiStore.ts`) with modal, toast, loading state management
3. React Query configured with QueryClient in app layout (`app/layout.tsx`)
4. Custom hook pattern for Firestore onSnapshot created (`hooks/useRealtimeQuery.ts`) wrapping React Query
5. Example real-time hook implemented (`hooks/useServices.ts`) demonstrating onSnapshot + React Query pattern
6. Automatic cleanup of Firestore listeners on component unmount verified
7. React Query DevTools installed for development environment
8. Type definitions for Firestore documents created (`types/firestore.ts`: UserProfile, Service, ServiceLog interfaces)
9. Zod schemas created for runtime validation (`lib/validations/schemas.ts`)
10. Unit tests written for state management logic (stores and custom hooks)

## Story 1.5: Authentication Flow - Login Page

**As a** user,
**I want** to select my role (Manager or Barber) on a login page,
**so that** I can access the appropriate dashboard for my responsibilities.

**Acceptance Criteria:**

1. Login page created at `/login` route with responsive layout
2. Dark theme applied (#0a0a0a background) with centered content
3. Two large, touch-friendly buttons displayed: "Manager" and "Barber" (#f59e0b accent color on hover)
4. Manager button click immediately authenticates as the sole manager user and redirects to `/manager/dashboard`
5. Barber button click navigates to barber selection view (same page, different state)
6. Page includes SalonFlow branding/title and brief description
7. Buttons meet WCAG 2.1 Level AA contrast requirements (4.5:1 minimum)
8. Keyboard navigation works (Tab to focus, Enter to select)
9. Loading state displayed during authentication (spinner with optimistic navigation)
10. Error handling shows toast notification if authentication fails

## Story 1.6: Authentication Flow - Barber Selection

**As a** barber,
**I want** to select my profile from a list of barbers after clicking "Barber" on the login page,
**so that** I can log in as myself and access my personal dashboard.

**Acceptance Criteria:**

1. Barber selection grid displayed after "Barber" button click
2. Grid shows all users with `role: 'barber'` from Firestore `users` collection
3. Each barber displayed as a card with avatar (image or placeholder), username
4. Grid responsive: 4 columns on desktop (>1024px), 2 columns on tablet/mobile (<1024px)
5. Cards have hover state (elevation shadow increase) and press effect (scale 0.98)
6. Clicking a barber card authenticates as that barber and redirects to `/barber/dashboard`
7. Real-time updates: New barbers added by manager appear instantly in the grid
8. Empty state shown if no barbers exist: "No barbers found. Contact your manager."
9. Keyboard navigation: Tab through cards, Enter to select
10. ARIA labels applied: "Select barber: [username]"

## Story 1.7: Manager Dashboard Shell

**As a** manager,
**I want** to see a dashboard layout with navigation after logging in,
**so that** I can access different areas of the management system.

**Acceptance Criteria:**

1. Manager dashboard created at `/manager/dashboard` route (auth-protected)
2. Horizontal navigation bar at top with links: Dashboard, Barbers, Services, Reports
3. Navigation highlights current active page (#f59e0b underline or background)
4. Main content area displays placeholder KPI cards (3 cards: Total Revenue, Total Services, Active Barbers) with "Coming soon" or $0 values
5. "Pending Approvals" section with empty state: "No pending approvals"
6. "Log a Service" section visible but disabled with "Feature coming soon" message
7. Dark theme applied consistently (#0a0a0a background, #1a1a1a cards)
8. Mobile responsive: Navigation collapses to hamburger menu or bottom nav (<768px)
9. Logout button in navigation triggers logout and redirects to `/login`
10. Page accessible only to authenticated users with `role: 'manager'` (middleware redirect if unauthorized)

## Story 1.8: Barber Dashboard Shell

**As a** barber,
**I want** to see my personal dashboard after logging in,
**so that** I can access features relevant to my work.

**Acceptance Criteria:**

1. Barber dashboard created at `/barber/dashboard` route (auth-protected)
2. Header displays daily stats cards (2 KPI cards: Services Today, Revenue Today) with placeholder $0 values
3. "Log a Service" section visible with empty service grid and "Services coming soon" message
4. "My Logged Services" table section with empty state: "No services logged yet. Start by logging a service above."
5. No navigation menu (barbers only have one page)
6. Logout button in header triggers logout and redirects to `/login`
7. Dark theme applied (#0a0a0a background, #1a1a1a cards)
8. Mobile responsive: Cards stack vertically, table scrolls horizontally if needed
9. Page accessible only to authenticated users with `role: 'barber'` (middleware redirect if unauthorized)
10. Real-time connection established (onSnapshot listener ready for future data)

## Story 1.9: React Error Boundaries & Monitoring

**As a** development team,
**I want** error boundaries and monitoring configured,
**so that** production errors are caught, logged, and don't break the entire application.

**Acceptance Criteria:**

1. React error boundary component created (`components/ErrorBoundary.tsx`) with fallback UI
2. Error boundary wraps entire app in `app/layout.tsx`
3. Sentry SDK installed and configured for production environment
4. Sentry DSN added to environment variables (.env.production)
5. Source maps uploaded to Sentry during build process
6. Uncaught errors logged to Sentry with user context (user ID, role)
7. Firebase operation errors logged with operation type and error details
8. Error fallback UI shows user-friendly message with "Try again" button
9. Error boundary resets state when user clicks "Try again"
10. Dev environment shows detailed error stack, prod environment shows friendly message

## Story 1.10: Testing Infrastructure & First Tests

**As a** developer,
**I want** testing infrastructure configured with example tests,
**so that** the team can write tests consistently from the start.

**Acceptance Criteria:**

1. Vitest configured with React Testing Library for unit/component tests
2. Playwright configured for E2E tests with Firebase Emulator integration
3. Test directory structure created (`tests/unit/`, `tests/e2e/`)
4. Example unit test written for Zustand auth store (login, logout actions)
5. Example component test written for Login page buttons
6. Example E2E test written: "Manager can log in and reach dashboard"
7. Firebase Emulator Suite integration in E2E tests (tests run against local emulator)
8. Test coverage reporting configured (Vitest coverage with c8)
9. npm scripts added: `test`, `test:watch`, `test:e2e`, `test:coverage`
10. CI pipeline runs all tests successfully

---
