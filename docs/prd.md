# SalonFlow Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- Streamline salon service logging and reduce manual paperwork for barbers and managers
- Implement transparent commission tracking and approval workflow for barber compensation
- Provide real-time financial visibility and performance metrics for business decision-making
- Enable efficient team management with centralized barber and service CRUD operations
- Deliver role-based access control ensuring appropriate permissions for managers and barbers
- Create an intuitive, modern interface that works seamlessly across devices

### Background Context

Traditional barbershop operations often rely on paper-based service logs, manual commission calculations, and disconnected systems for tracking performance. This creates inefficiencies, potential errors in commission payouts, and limited visibility into business metrics. Barbers lack transparency into their earnings status, while managers struggle to oversee operations and make data-driven decisions.

SalonFlow addresses these challenges by providing a centralized, real-time platform where barbers can log completed services for approval, managers can oversee all operations through a comprehensive dashboard, and both roles benefit from instant access to relevant data. The system eliminates paperwork, reduces disputes through transparent approval workflows, and empowers salon owners with actionable insights through performance leaderboards and financial reporting.

### Change Log

| Date       | Version | Description          | Author          |
| ---------- | ------- | -------------------- | --------------- |
| 2025-10-09 | v1.0    | Initial PRD creation | PM Agent (John) |

## Requirements

### Functional

**FR1:** The system shall provide role-based authentication allowing users to log in as either "Manager" or "Barber"

**FR2:** Barber users shall be able to select their profile from a list of all registered barbers, displaying username and avatar

**FR3:** Barbers shall be able to select and log one or multiple completed services in a single transaction

**FR4:** Service logs created by barbers shall default to "pending" status and require manager approval before affecting financial calculations

**FR5:** Barbers shall be able to delete their own service logs only while in "pending" status

**FR6:** Managers shall be able to view all pending service logs in a dedicated approval queue with barber name, service name, price, and timestamp

**FR7:** Managers shall be able to approve or reject pending service logs with a single action (approve/reject buttons)

**FR8:** Approved service logs shall immediately contribute to revenue calculations, commission payouts, and performance metrics

**FR9:** Rejected service logs shall be marked as "rejected" and retained for audit purposes, but excluded from financial calculations

**FR10:** Managers shall be able to log services on behalf of any barber, with status automatically set to "approved"

**FR11:** Managers shall have full CRUD operations for barber profiles including username, avatar, and commission rate

**FR12:** Each barber profile shall have a configurable commission rate (percentage) that determines their payout from services

**FR13:** Managers shall have full CRUD operations for service definitions including name, price, and duration

**FR14:** The system shall prevent deletion of services that have associated service logs

**FR15:** Barbers shall have read-only access to the service catalog

**FR16:** Barbers shall be able to view their personal service log history with service name, price, date, and approval status

**FR17:** Barber dashboards shall display real-time daily statistics: services logged today and revenue generated today

**FR18:** Manager dashboards shall display aggregate metrics: total revenue, total services logged, and active barber count

**FR19:** The system shall display a real-time performance leaderboard ranking barbers by total revenue generated

**FR20:** The system shall display a real-time performance leaderboard ranking services by total revenue generated

**FR21:** The Reports page shall display daily financial summary including: Total Revenue, Total Commissions Payout, and Net Profit

**FR22:** Net Profit shall be calculated as: Total Revenue minus Total Commissions Payout

**FR23:** The Reports page shall display a detailed financial ledger showing all approved transactions with: barber name, service name, price, commission rate, commission amount, and timestamp

**FR24:** The system shall support date range filtering for reports and financial ledgers

**FR25:** The system shall provide toast notifications confirming all user actions (log, approve, reject, create, update, delete)

**FR26:** The system shall validate all inputs: service names and usernames must be non-empty, prices must be positive numbers, durations must be positive integers

**FR27:** All data changes shall propagate in real-time to all connected clients without requiring page refresh

### Non-Functional

**NFR1:** The system shall be built using Next.js 14+ (App Router), TypeScript, and Tailwind CSS

**NFR2:** The UI shall utilize ShadCN component library for consistent design patterns and accessibility

**NFR3:** The system shall use Firebase/Firestore as the backend database with real-time synchronization via onSnapshot listeners

**NFR4:** Firestore security rules shall enforce role-based access control: managers can read/write all data, barbers can only write their own service logs

**NFR5:** The interface shall implement a modern dark theme as the primary visual style

**NFR6:** The application shall be responsive and functional across desktop and mobile devices (responsive breakpoints at 768px and 1024px)

**NFR7:** Real-time updates shall have a latency of less than 2 seconds from database write to UI update under normal network conditions

**NFR8:** The system shall provide immediate visual feedback for all user interactions including loading states, optimistic updates, and confirmation notifications

**NFR9:** The application shall follow WCAG 2.1 Level AA guidelines for accessibility including keyboard navigation, focus management, and ARIA labels

**NFR10:** Service log tables shall implement pagination or virtual scrolling when displaying more than 100 records

**NFR11:** The system shall gracefully handle offline scenarios by displaying appropriate error messages and preventing data loss through local state management

**NFR12:** All Firebase operations shall include error handling with user-friendly error messages displayed via toast notifications

## User Interface Design Goals

### Overall UX Vision

SalonFlow prioritizes **clarity, speed, and role-appropriate information density**. The interface embraces a **modern dark aesthetic** that conveys professionalism while reducing eye strain during extended use. Real-time feedback is paramount—every user action receives immediate visual confirmation through toast notifications and optimistic UI updates.

The UX philosophy centers on **minimal friction for frequent tasks**: barbers should be able to log multiple services in under 10 seconds, while managers should see critical information (pending approvals, daily revenue) at a glance without scrolling. The system employs **progressive disclosure**—showing only relevant information per role while keeping advanced features (reports, detailed ledgers) accessible but not intrusive.

**Design principles:**

- **Feedback first:** Every action gets immediate visual response (optimistic updates, loading states, toast confirmations)
- **Clarity over density:** White space and clear typography prevent information overload
- **Forgiving UX:** Undo for non-destructive actions, confirmation for destructive ones
- **Mobile-aware:** Touch targets ≥44px, thumb-zone optimization for primary actions on mobile

### Key Interaction Paradigms

**Multi-Selection with Visual Feedback:**

- Services displayed as grid of clickable cards
- Selected state indicated by primary color ring (2-3px border) and subtle background tint
- Selection count displayed in action button ("Log 3 Service(s)")
- Keyboard support: Tab to navigate, Space to toggle selection

**Single-Click Actions:**

- Non-destructive actions (approve, log) execute immediately with toast confirmation
- Destructive actions (delete barber, delete service) show confirmation dialog first
- Icon-only buttons (✓ approve, ✗ reject) include tooltip on hover and ARIA label
- Mobile: Tap targets minimum 44x44px for icon buttons

**Inline Editing:**

- CRUD operations use modal dialogs (ShadCN Dialog component) that overlay main interface
- Dialogs trap focus and return focus to trigger button on close
- Form validation errors appear inline below fields in red text
- Submit buttons disabled until form is valid

**Real-Time Tables:**

- Service logs, pending approvals, and leaderboards update via Firestore onSnapshot
- New rows animate in with subtle fade + slide from top
- Status changes (pending → approved) trigger row highlight flash (green pulse)
- Tables support sorting by clicking column headers (sort indicator icons)
- Pagination appears automatically when >100 rows (page size: 50)

**Loading & Empty States:**

- Initial page loads show skeleton screens matching final layout
- Empty states use illustration + helpful text (e.g., "No services yet. Click 'Log a Service' to get started")
- Real-time updates don't show loading indicators (optimistic UI)
- Failed operations show toast error + revert optimistic update

**Toast-Based Notifications:**

- All confirmations and errors appear as non-blocking toasts (ShadCN Toast/Sonner)
- Auto-dismiss after 4 seconds for success, 6 seconds for errors
- Toasts stack vertically in bottom-right (desktop) or top-center (mobile)
- Critical errors (auth failure, network down) persist until dismissed

**Search & Filtering:**

- Reports page includes search input filtering ledger by barber name or service name
- Date range picker with presets (Today, Last 7 Days, Last 30 Days, Custom Range)
- Leaderboards default to "All Time" with optional date range filter
- Filters debounced by 300ms to prevent excessive queries

### Core Screens and Views

**Authentication/Login (`/login`):**

- Role selection screen: Two large buttons ("Manager" / "Barber")
- Barber profile selection: Grid of cards with avatar + username (4 columns desktop, 2 mobile)
- Barber cards highlight on hover, press effect on click

**Barber Dashboard (`/barber/dashboard`):**

- **Header:** Daily stats (services today, revenue today) in KPI cards
- **"Log a Service" Section:** Grid of selectable service cards (name, price, duration)
- **"My Logged Services" Table:** Columns: Service, Price, Date, Status (sortable by date)
- **Mobile:** Single column layout, stats stacked, service grid 1 column

**Manager Dashboard (`/manager/dashboard`):**

- **KPI Row:** 3 cards (Total Revenue, Total Services, Active Barbers)
- **"Pending Approvals" Table:** Columns: Barber, Service, Price, Date, Actions (✓✗ icons)
- **"Log a Service" Section:** Dropdowns for barber selection + service selection
- **Mobile:** Stacked layout, KPIs in vertical stack, table horizontal scroll

**Manager - Barbers Page (`/manager/barbers`):**

- **Header:** "Barbers" title + "Add Barber" button (primary)
- **Barber Grid:** Cards with avatar, username, daily stats, dropdown menu (⋮)
- **Dropdown Menu:** Edit, Delete options (ShadCN DropdownMenu)
- **Dialogs:** Add/Edit barber forms (username, avatar URL, commission rate %)
- **Mobile:** 1-2 columns, touch-friendly dropdown menus

**Manager - Services Page (`/manager/services`):**

- **Header:** "Services" title + "Add Service" button (primary)
- **Service Grid:** Cards with name, price, duration, dropdown menu (⋮)
- **Dropdown Menu:** Edit, Delete options (Delete disabled if service has logs)
- **Dialogs:** Add/Edit service forms (name, price, duration)
- **Mobile:** 1 column, cards expand to full width

**Manager - Reports Page (`/manager/reports`):**

- **Date Filter:** Prominent date range picker at top
- **KPI Row:** Revenue, Commissions, Net Profit (filtered by date range)
- **Leaderboards Section:** Two tables side-by-side (Barbers | Services) - top 10 each
- **Financial Ledger:** Full-width table below leaderboards, searchable, paginated
- **Mobile:** All sections stacked vertically, tables horizontal scroll

**Navigation:**

- **Barber:** Single dashboard view (no nav needed)
- **Manager Desktop:** Horizontal nav bar with links (Dashboard, Barbers, Services, Reports)
- **Manager Mobile:** Bottom navigation bar (icons + labels) or hamburger menu

### Accessibility: WCAG 2.1 Level AA

**Keyboard Navigation:**

- All interactive elements reachable via Tab (logical tab order)
- Modal dialogs trap focus, Esc to close
- Dropdown menus navigable with arrow keys, Enter to select
- Service selection cards toggleable with Space bar

**Focus Management:**

- Visible focus indicators: 2px solid ring in primary color with 2px offset
- Focus moves logically through page (left-to-right, top-to-bottom)
- Opening dialog moves focus to first input; closing returns focus to trigger button
- Skip-to-content link for screen reader users

**Screen Reader Support:**

- ARIA labels for icon-only buttons ("Approve service", "Reject service", "Edit barber")
- ARIA live regions for real-time updates ("New service log added")
- Status badges use both color and text/icon (not color-only)
- Table headers properly associated with data cells

**Color & Contrast:**

- Body text: Minimum 4.5:1 contrast ratio
- Large text (18pt+): Minimum 3:1 contrast ratio
- Status indicators use icon + text, not color alone:
  - Pending: ⏱️ + "Pending" text
  - Approved: ✓ + "Approved" text
  - Rejected: ✗ + "Rejected" text
- Interactive elements: 3:1 contrast against background

**Touch Targets (Mobile):**

- Minimum 44x44px for all tappable elements
- Icon buttons padded to meet size requirement
- Adequate spacing between adjacent touch targets (8px minimum)

### Branding

**Modern Professional Barbershop Aesthetic:**

**Color Palette:**

- **Background Layers:**
  - Primary: `#0a0a0a` (deep black)
  - Card surface: `#1a1a1a` (elevated black)
  - Hover state: `#2a2a2a` (lighter elevation)
- **Primary Accent:** `#f59e0b` (amber/gold) for CTAs, selected states, focus rings
- **Status Colors:**
  - Success/Approved: `#10b981` (green)
  - Warning/Pending: `#f59e0b` (amber)
  - Error/Rejected: `#ef4444` (red)
  - Info: `#3b82f6` (blue)
- **Text:**
  - Primary: `#f9fafb` (near-white, high contrast)
  - Secondary: `#9ca3af` (gray, muted text)
  - Disabled: `#6b7280` (darker gray)

**Typography:**

- **Font Stack:** Inter, system-ui, -apple-system, sans-serif
- **Headings:** Bold (600-700 weight), larger tracking
- **Body:** Regular (400 weight), 16px base size (desktop), 14px (mobile)
- **Data/Numbers:** Tabular figures for alignment in tables

**Component Styling:**

- **Cards:** Border `1px solid #2a2a2a`, rounded corners (8px), subtle hover lift (2px translate)
- **Buttons:**
  - Primary: Amber background, dark text, bold
  - Secondary: Transparent background, amber border, amber text
  - Destructive: Red background, white text
- **Tables:** Striped rows (alternating bg: #1a1a1a / #141414), header row with bottom border
- **Forms:** Dark input backgrounds (#1a1a1a), amber focus ring, error state red border

**Micro-Interactions:**

- Button hover: 50ms transition, slight scale (1.02)
- Card hover: 150ms transition, elevation shadow increase
- Loading spinners: Amber color, smooth rotation
- Toast slide-in: 200ms ease-out from right (desktop) or top (mobile)

**No explicit brand logo/assets provided** - Interface assumes clean, minimal aesthetic that can be customized with client branding later.

### Target Device and Platforms: Web Responsive (Desktop + Mobile)

**Primary Target:** Desktop/laptop usage for manager workflows (dashboard, reports, detailed management)
**Secondary Target:** Mobile/tablet for barber workflows (quick service logging) and manager on-the-go approvals

**Responsive Breakpoints:**

- **Mobile:** < 768px
  - Single column layouts
  - Stacked KPI cards
  - Bottom navigation or hamburger menu
  - Horizontal scroll for wide tables
  - Full-width dialogs
- **Tablet:** 768px - 1024px
  - 2-column grids for cards
  - Side-by-side layouts where space permits
  - Horizontal top navigation
- **Desktop:** > 1024px
  - Multi-column dashboards (3-4 columns)
  - Side-by-side leaderboards
  - Modal dialogs centered, max-width 600px
  - Horizontal top navigation with full labels

**Platform:** Web-only (no native mobile apps), accessible via modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)

**Future Consideration:** Progressive Web App (PWA) for offline service logging and home screen installation (post-MVP)

### Component Library Usage (ShadCN UI)

Explicit components to be used:

- **Button:** All CTAs and actions
- **Card:** Service cards, barber cards, KPI cards
- **Dialog:** Add/Edit forms for barbers and services
- **Table:** Service logs, pending approvals, leaderboards, financial ledger
- **Toast/Sonner:** All notifications and confirmations
- **DropdownMenu:** Edit/Delete actions on barber and service cards
- **Input:** Text inputs for forms and search
- **Select:** Barber/Service selection in manager log service
- **Badge:** Status indicators (pending, approved, rejected)

### Animation & Performance

- Page transitions: None (instant navigation, preserve scroll position)
- Loading states: Skeleton screens with pulse animation
- Real-time updates: 200ms fade-in for new rows
- Optimistic updates: Instant UI change, rollback on error with shake animation
- Target: 60fps for all animations, no jank on scroll

## Technical Assumptions

### Repository Structure: Monorepo

**Decision:** Single repository (monorepo) structure for the entire application

**Rationale:**

- Simple deployment model for MVP (single Next.js app)
- No need for cross-repo coordination
- Easier developer onboarding with unified codebase
- All code (frontend, backend API routes, Firebase config) lives together
- Simplified version control and CI/CD pipeline

**Structure:**

```
/
├── app/                    # Next.js App Router pages & API routes
│   ├── (auth)/            # Auth-gated routes
│   ├── api/               # Server-side API routes (Firebase Admin operations)
│   └── login/             # Public routes
├── components/            # React components
│   ├── ui/               # ShadCN components
│   └── features/         # Feature-specific components
├── lib/                   # Core utilities
│   ├── firebase/         # Firebase config, hooks, helpers
│   ├── validations/      # Zod schemas
│   └── utils/            # Helper functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── contexts/              # React Context providers
├── constants/             # App-wide constants
├── tests/                 # Test utilities and fixtures
├── public/                # Static assets
├── firestore.rules        # Firestore security rules
├── firestore.indexes.json # Required Firestore indexes
├── firebase.json          # Firebase configuration
└── package.json           # Dependencies
```

### Service Architecture

**Decision:** Hybrid Next.js + Firebase architecture with selective server-side operations

**Architecture Components:**

**Frontend Layer:**

- Next.js 14+ with App Router for all UI
- Client-side React components with real-time Firestore subscriptions
- Direct Firestore access for read operations (protected by security rules)
- Optimistic UI updates for instant feedback

**Backend Layer:**

- **Firebase/Firestore:** Primary database
  - Collections: `users`, `services`, `serviceLogs`
  - Real-time sync via `onSnapshot` listeners
  - Client-side writes protected by security rules
- **Next.js API Routes (App Router):** Server-side operations using Firebase Admin SDK
  - `/api/barbers/[id]` - DELETE: Server-side deletion with referential integrity checks
  - `/api/reports/generate` - GET: Complex aggregations for financial reports
  - `/api/admin/recalculate` - POST: Batch commission recalculations (if needed)
- **Firebase Authentication:** Role-based auth with custom claims
  - Custom claim: `role: 'manager' | 'barber'`
  - Set on user creation, validated on every request

**State Management Strategy:**

**Decision:** Zustand for global state + React Query for server state

- **Zustand stores:**
  - `useAuthStore` - User authentication, role, profile
  - `useUIStore` - Global UI state (modals, toasts, loading states)
- **React Query (TanStack Query):**
  - Manage Firestore real-time subscriptions as queries
  - Built-in caching, refetching, optimistic updates
  - Example: `useQuery(['serviceLogs', barberId], () => subscribeToLogs(barberId))`
- **Why not just Context?** React Query provides better dev experience for async data, caching, and real-time sync management

**Real-time Data Management:**

Pattern for onSnapshot listeners using React Query for automatic cleanup and subscription management. This prevents listener leaks and provides centralized state management.

**Why this architecture?**

- MVP scope doesn't justify microservices
- Real-time features are Firebase's core strength
- Server-side API routes handle operations requiring elevated permissions or complex logic
- Firebase handles scaling automatically

### Testing Requirements

**Decision:** Pragmatic testing pyramid focused on critical paths

**Test Distribution:**

**Unit Tests (40% effort)** - Vitest

- **Coverage Target:** 70%+ for business logic, 50%+ overall
- **What to test:**
  - Business logic: Commission calculations, date filters, validation functions
  - Custom hooks: `useAuth`, `useServiceLogs`, `useRealtimeSync`
  - Utilities: Formatters, parsers, validators
  - Zod schemas: Ensure validation logic is correct
- **Mocking:** Mock Firestore SDK, use `@firebase/rules-unit-testing` for security rules testing
- **Run frequency:** On every file save (watch mode), pre-commit hook

**Component Tests (30% effort)** - Testing Library + Vitest

- **What to test:**
  - Form submission flows (Add Barber, Add Service, Log Service)
  - Component integration with Zustand stores
  - Conditional rendering (pending approvals, empty states)
  - Accessibility: Keyboard navigation, ARIA attributes
- **Mocking:** Mock React Query hooks, Firestore responses
- **Run frequency:** Pre-commit, CI pipeline

**E2E Tests (30% effort)** - Playwright

- **Critical user journeys:**
  1. Barber login → Log multiple services → Verify pending in table
  2. Manager login → Approve service → Verify revenue updates + toast
  3. Manager → Create barber → Edit commission rate → Verify changes
  4. Manager → Reports → Filter by date range → Verify ledger updates
  5. Real-time sync: Open two browser windows, update in one, verify in other
- **Environment:** Firebase Emulator Suite (consistent test data)
- **Run frequency:** On main branch merge, pre-production deploy
- **Parallelization:** Run tests in parallel for speed

**Security Rules Testing** - Firebase Emulator + Jest

- Test all security rules scenarios:
  - Barbers cannot read other barbers' profiles
  - Barbers cannot approve their own logs
  - Managers can write to all collections
- Run in CI before deploying security rules

**Manual Testing Checklist:**

- Responsive design on real devices (iOS Safari, Android Chrome)
- Keyboard-only navigation through all flows
- Screen reader testing (VoiceOver, NVDA) on core flows
- Real-time sync behavior (multiple tabs/devices)
- Performance on slow 3G network (Chrome DevTools throttling)
- Dark mode rendering consistency

### Additional Technical Assumptions and Requests

**Development Environment:**

**Requirements:**

- **Node.js:** v20 LTS (specify exact version in `.nvmrc`)
- **Package Manager:** pnpm v8+ (faster, more efficient than npm)
- **Firebase CLI:** v13+ for emulator management
- **IDE:** VS Code with extensions:
  - ESLint, Prettier, Tailwind CSS IntelliSense
  - Firebase Explorer, Error Lens
  - TypeScript Error Translator

**Local Development Workflow:**

1. Clone repo → `pnpm install`
2. Start Firebase Emulators: `pnpm dev:emulators` (Firestore, Auth on localhost)
3. Seed test data: `pnpm seed:dev` (script to populate emulator with sample data)
4. Start Next.js: `pnpm dev` (configured to connect to emulators)
5. Run tests: `pnpm test:watch` (Vitest in watch mode)

**Code Quality & Standards:**

**Linting & Formatting:**

- **ESLint:** Next.js config + `@typescript-eslint/strict` rules
  - Enforce: No `any`, no unused vars, consistent imports
- **Prettier:** 2-space indent, single quotes, trailing commas, 100 char line length
- **Stylelint:** (Optional) For custom CSS if needed beyond Tailwind

**Type Safety:**

- **TypeScript:** `strict: true`, `noUncheckedIndexedAccess: true`
- **Firestore Types:** Generate types from Firestore schema
- **Zod for Runtime Validation:** Validate all user inputs and API responses

**Git Workflow:**

- **Branching:** `main` (production), `develop` (staging), feature branches
- **Commit Convention:** Conventional Commits (e.g., `feat:`, `fix:`)
- **Pre-commit Hooks:** Husky + lint-staged
  - Run ESLint + Prettier on staged files
  - Run affected unit tests
  - Block commit if errors

**Firebase Configuration:**

**Firestore Data Model & Indexes:**

**Collections:**

1. **users** - User profiles
   - Document ID: Firebase Auth UID
   - Fields: `username`, `role`, `avatarUrl`, `commissionRate`, `createdAt`

2. **services** - Service catalog
   - Document ID: Auto-generated
   - Fields: `name`, `price`, `duration`, `createdAt`

3. **serviceLogs** - Service completion records
   - Document ID: Auto-generated
   - Fields: `barberId`, `serviceId`, `price`, `commissionRate`, `commissionAmount`, `status`, `createdAt`, `approvedAt`, `rejectedAt`

**Required Composite Indexes:**

```json
{
  "indexes": [
    {
      "collectionGroup": "serviceLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "barberId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "serviceLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "serviceLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "barberId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**Security Rules Strategy:**

- **Principle:** Trust the server, verify the client
- **Critical Rules:**
  - Barbers can only create service logs for themselves
  - Barbers cannot set `status: 'approved'` (only 'pending')
  - Only managers can update service log status
  - Service prices/commission rates are immutable once logged
- **Testing:** Use `@firebase/rules-unit-testing` to validate all rules

**Firebase Project Structure:**

- **MVP:** Single Firebase project (`salonflow-prod`)
- **Post-MVP:** Three projects (dev, staging, prod)
- **Environment Variables:** Use `.env.local`, `.env.staging`, `.env.production`

**Deployment & Hosting:**

**Hosting Platform:** Vercel (recommended) or Firebase Hosting

**Why Vercel:**

- Optimized for Next.js (zero-config SSR, ISR, API routes)
- Automatic preview deployments for PRs
- Edge network for fast global access
- Simple environment variable management
- Free tier sufficient for MVP

**Deployment Strategy:**

- **Branches:**
  - `main` → Auto-deploy to production
  - `develop` → Auto-deploy to staging
  - Feature branches → PR preview deployments
- **Rollback:** Instant rollback to previous deployment
- **Database Migrations:** Manual Firestore schema changes

**CI/CD Pipeline:**

**GitHub Actions Workflow:**

1. **test** job: Lint → Type check → Unit tests → Component tests → Build
2. **e2e** job (main only): Firebase Emulators → Playwright E2E tests
3. **deploy** job (main only): Deploy to Vercel → Deploy Firestore rules → Smoke tests

**Third-Party Dependencies:**

**Core:** next v14.2+, react v18.3+, typescript v5.4+

**Styling & UI:** tailwindcss v3.4+, @radix-ui/\* (via ShadCN), lucide-react v0.400+

**Firebase:** firebase v10.12+, firebase-admin v12.1+

**State Management:** zustand v4.5+, @tanstack/react-query v5.40+

**Forms & Validation:** react-hook-form v7.51+, zod v3.23+

**Utilities:** date-fns v3.6+, sonner v1.4+, clsx v2.1+

**Testing:** vitest v1.6+, @testing-library/react v15+, playwright v1.44+

**Development:** eslint v8.57+, prettier v3.2+, husky v9+

**Dependency Management:**

- **Update Strategy:** Renovate Bot or Dependabot for automated PRs
- **Major Version Updates:** Manual review, test in staging first
- **Security Patches:** Auto-merge minor/patch security updates

**Performance Optimization:**

**Build Optimization:**

- **Bundle Size Target:** < 200KB initial JS bundle
- **Code Splitting:** Automatic via Next.js App Router
- **Dynamic Imports:** Lazy-load heavy components (charts, reports)
- **Tree Shaking:** Ensure Firestore imports are tree-shakeable
- **Image Optimization:** Next.js Image component for all images/avatars

**Runtime Performance:**

- **Real-time Listener Limits:** Max 10 concurrent onSnapshot per client
- **Pagination:** Firestore cursor-based pagination for tables >100 rows
- **Debouncing:** Search inputs debounced at 300ms
- **Memoization:** Use `React.memo`, `useMemo`, `useCallback` appropriately
- **Virtual Scrolling:** (Optional) For very large tables

**Monitoring:**

- **Next.js Analytics:** Vercel Analytics (Web Vitals, page views)
- **Firebase Performance Monitoring:** Real-world performance metrics
- **Error Tracking:** Sentry (free tier) for production error logging
  - Capture unhandled errors, Firebase failures, React error boundaries
  - Upload source maps for readable stack traces

**Security:**

**Authentication & Authorization:**

- **Firebase Auth:** Custom auth with role-based access
- **Custom Claims:** Set `role` claim on user creation
- **Client-side Guards:** Protect routes with middleware
- **Server-side Validation:** Verify claims in API routes

**Data Security:**

- **Firestore Security Rules:** Enforce all access control
- **Input Validation:** Zod schemas client-side, security rules server-side
- **XSS Prevention:** React escapes by default
- **CSRF Protection:** Next.js SameSite cookies

**Secrets Management:**

- **Environment Variables:** Store in Vercel dashboard, never commit
- **Firebase Config:** Public API keys safe (protected by rules)
- **Admin SDK:** Private key only in API routes

**HTTPS & Network Security:**

- **HTTPS Enforcement:** Automatic on Vercel/Firebase Hosting
- **Content Security Policy:** (Optional) Add CSP headers

**Error Handling:**

**React Error Boundaries:** Catch rendering errors, log to Sentry, show fallback UI

**Firebase Error Handling:** Wrap operations in try/catch, show user-friendly toast messages

**API Route Error Handling:** Return structured errors, log details to monitoring

**Scalability Considerations:**

**Current MVP Limits:**

- Single salon (no multi-tenancy)
- Firebase free tier: 50K reads/day, 20K writes/day
- Vercel free tier: 100GB bandwidth/month

**Post-MVP Scaling:**

- **Multi-tenancy:** Add `salonId` to documents
- **Firebase Pricing:** Move to Blaze plan when needed
- **Optimization:** Index optimization, aggregation tables
- **Caching:** Redis for frequently accessed data
- **Functions:** Background jobs via Firebase Functions

**Browser Support:**

**Supported Browsers:**

- Chrome/Edge v122+ (last 2 major versions)
- Firefox v123+ (last 2 major versions)
- Safari v17.3+ (last 2 major versions)
- Mobile Safari (iOS) v17.3+
- Chrome for Android v122+

**Not Supported:** Internet Explorer (EOL), Opera Mini

**Progressive Web App (PWA):**

**Decision:** Enable basic PWA features in MVP

**Implementation:**

- Add `next-pwa` plugin for service worker and manifest
- Cache static assets only (not Firestore data)
- Show offline message when network unavailable
- Enable "Add to Home Screen" on mobile

**PWA Features:**

- Manifest: App name, icons, theme color
- Service Worker: Cache app shell for faster loads
- Offline: Friendly offline message
- No offline-first data sync in MVP (defer to post-MVP)

**Data Migration & Schema Evolution:**

**Strategy:**

- Firestore is schemaless - documents can vary
- Add `schemaVersion` field if major changes needed
- Write migration scripts using Firebase Admin SDK
- Handle both old and new schema during transition
- Test migrations on staging first

**Backup Strategy:**

- Enable automatic Firestore backups (daily, 7-day retention)
- Manual exports before major changes
- Backups count toward storage quota

**Cost Management:**

**Firebase Pricing Awareness:**

- **Free Tier:** 50K reads/day, 20K writes/day, 1GB storage, 10GB bandwidth/month
- **Blaze Plan:** $0.06 per 100K reads, $0.18 per 100K writes, $0.18 per GB stored

**Cost Optimization:**

- Use `limit()` on queries
- Implement pagination
- Cache data with React Query
- Monitor usage in Firebase Console
- Set up billing alerts

**Expected MVP Cost:** $0-10/month (within free tier for 10-20 users)

**Documentation:**

**Required Documentation:**

- **README.md:** Setup instructions, prerequisites, development workflow
- **CONTRIBUTING.md:** Code style, PR process, commit conventions
- **/docs/architecture.md:** High-level architecture
- **/docs/firebase-setup.md:** Firebase setup, security rules, indexes
- **/docs/testing.md:** Testing guide, patterns
- **Inline Code Comments:** JSDoc for complex functions

## Epic List

**Epic 1: Foundation & Authentication**
Establish project infrastructure (Next.js App Router, Firebase, TypeScript, Tailwind, ShadCN), implement role-based authentication flow (manager/barber selection), create dashboard shells with navigation, set up CI/CD pipeline, and configure basic real-time infrastructure to provide a deployable foundation with working authentication.

**Epic 2: Core Data Management (Services & Barbers)**
Enable managers to create, read, update, and delete both services (name, price, duration) and barbers (username, avatar, commission rate) with full CRUD UI, display catalogs to appropriate roles with real-time updates, and implement form validation and delete protections, delivering a complete salon configuration system.

**Epic 3: Service Logging & Approval Workflow**
Build the end-to-end workflow where barbers log completed services (multi-select), service logs enter pending status, managers review and approve/reject via dashboard, commission calculations occur automatically, real-time updates propagate across clients, and both roles can track service history, delivering the core value proposition of transparent commission management.

**Epic 4: Reporting & Analytics**
Create comprehensive reporting features including dashboard KPIs (revenue, services, active barbers), performance leaderboards (barbers and services), detailed financial ledger with commission breakdowns, date range filtering, and search functionality, delivering actionable business insights for data-driven salon management.

## Epic 1: Foundation & Authentication

**Epic Goal:** Establish a deployable foundation with complete project infrastructure, CI/CD pipeline, Firebase configuration, role-based authentication system, and basic dashboard shells for both manager and barber roles, enabling users to log in and access role-appropriate interfaces.

### Story 1.1: Project Scaffolding & Infrastructure Setup

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

### Story 1.2: Firebase Project Configuration

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

### Story 1.3: CI/CD Pipeline Setup

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

### Story 1.4: State Management & Real-time Infrastructure

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

### Story 1.5: Authentication Flow - Login Page

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

### Story 1.6: Authentication Flow - Barber Selection

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

### Story 1.7: Manager Dashboard Shell

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

### Story 1.8: Barber Dashboard Shell

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

### Story 1.9: React Error Boundaries & Monitoring

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

### Story 1.10: Testing Infrastructure & First Tests

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

## Epic 2: Core Data Management (Services & Barbers)

**Epic Goal:** Deliver a complete salon configuration system enabling managers to create, read, update, and delete both services and barber profiles with full CRUD UI, real-time updates, form validation, and delete protections, allowing managers to fully set up their salon before operations begin.

### Story 2.1: Service CRUD - Create Service

**As a** manager,
**I want** to add a new service to the service catalog,
**so that** barbers can log completed services and clients can be charged appropriately.

**Acceptance Criteria:**

1. Manager Services page created at `/manager/services` with "Add Service" button (primary amber button, top-right)
2. Clicking "Add Service" opens a modal dialog (ShadCN Dialog component, max-width 600px, centered)
3. Dialog contains form with fields: Service Name (text input), Price (number input with $ prefix), Duration (number input with "minutes" suffix)
4. Form uses React Hook Form with Zod validation schema
5. Validation: Name required (non-empty), Price required (positive number), Duration required (positive integer)
6. Inline validation errors displayed below each field in red text
7. Submit button disabled until form is valid
8. On submit: Service created in Firestore `services` collection with fields: name, price, duration, createdAt (timestamp)
9. Toast notification shown: "Service '[name]' added successfully"
10. Dialog closes automatically, service appears in grid immediately (optimistic update or real-time)

### Story 2.2: Service CRUD - Display Service Catalog

**As a** manager or barber,
**I want** to see all available services in a grid layout,
**so that** I know what services the salon offers.

**Acceptance Criteria:**

1. Services page displays all services from Firestore `services` collection in real-time (onSnapshot)
2. Services shown as cards in a responsive grid: 3 columns (desktop >1024px), 2 columns (tablet 768-1024px), 1 column (mobile <768px)
3. Each card displays: Service name (heading), Price (formatted as $XX.XX), Duration (XX minutes)
4. Cards styled with dark theme (#1a1a1a background, #2a2a2a border, rounded corners)
5. Hover state: Card elevates slightly (2px translate, shadow increase)
6. Real-time updates: New services appear instantly, deleted services disappear instantly
7. Empty state shown if no services: "No services yet. Add a service to get started." (managers only)
8. Barbers see read-only service cards (no edit/delete options)
9. Skeleton loading state shown on initial page load
10. Services sortable by name (alphabetical) - default sort order

### Story 2.3: Service CRUD - Edit Service

**As a** manager,
**I want** to edit an existing service's details,
**so that** I can update pricing or duration as needed.

**Acceptance Criteria:**

1. Each service card on `/manager/services` has a dropdown menu (⋮ icon, top-right corner)
2. Dropdown contains "Edit" and "Delete" options (ShadCN DropdownMenu component)
3. Clicking "Edit" opens a modal dialog pre-filled with current service data
4. Dialog form identical to "Add Service" but title is "Edit Service" and button says "Save Changes"
5. Form fields pre-populated with existing values (name, price, duration)
6. Validation rules same as create: Name required, Price positive, Duration positive integer
7. On submit: Service document updated in Firestore with new values
8. Toast notification: "Service '[name]' updated successfully"
9. Dialog closes, updated service reflects changes immediately in grid (real-time or optimistic update)
10. Cancel button closes dialog without saving changes

### Story 2.4: Service CRUD - Delete Service with Protection

**As a** manager,
**I want** to delete a service from the catalog, but be prevented if service logs exist,
**so that** I don't accidentally break historical data integrity.

**Acceptance Criteria:**

1. Dropdown menu on each service card includes "Delete" option
2. Clicking "Delete" triggers referential integrity check: Query `serviceLogs` collection for documents with `serviceId` matching this service
3. **If service logs exist:** "Delete" option disabled in dropdown menu or grayed out, tooltip shown: "Cannot delete - service has associated logs"
4. **If no service logs exist:** Clicking "Delete" shows confirmation dialog: "Are you sure you want to delete '[service name]'? This action cannot be undone."
5. Confirmation dialog has "Cancel" (secondary) and "Delete" (destructive red) buttons
6. Clicking "Delete" in confirmation: Service document deleted from Firestore
7. Toast notification: "Service '[name]' deleted successfully"
8. Service disappears from grid immediately
9. Keyboard navigation: Esc closes confirmation dialog without deleting
10. Error handling: If delete fails, show toast error: "Failed to delete service. Please try again."

### Story 2.5: Barber CRUD - Create Barber Profile

**As a** manager,
**I want** to add a new barber to the team with their commission rate,
**so that** they can log in and log services with appropriate commission calculations.

**Acceptance Criteria:**

1. Manager Barbers page created at `/manager/barbers` with "Add Barber" button (primary amber button, top-right)
2. Clicking "Add Barber" opens modal dialog
3. Dialog form contains fields: Username (text input), Avatar URL (text input, optional), Commission Rate (number input with % suffix)
4. Form uses React Hook Form with Zod validation
5. Validation: Username required (non-empty), Avatar URL optional (valid URL if provided), Commission Rate required (0-100, positive number)
6. On submit: User document created in Firestore `users` collection with: username, avatarUrl (or null), commissionRate (stored as decimal, e.g., 45% → 0.45), role: 'barber', createdAt timestamp
7. Firebase Auth user created with email `[username]@salonflow.local` and temporary password "changeme123" (or similar)
8. Custom claim `role: 'barber'` set on Firebase Auth user
9. Toast notification: "Barber '[username]' added successfully"
10. Dialog closes, new barber appears in barber grid immediately

### Story 2.6: Barber CRUD - Display Barber Grid

**As a** manager,
**I want** to see all barbers in a grid with their basic info and daily stats,
**so that** I can manage my team effectively.

**Acceptance Criteria:**

1. `/manager/barbers` page displays all users with `role: 'barber'` from Firestore `users` collection
2. Barbers shown as cards in responsive grid: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
3. Each card displays: Avatar (image or placeholder initials), Username, Commission Rate (XX%), Daily stats (Services Today: 0, Revenue Today: $0.00)
4. Cards styled with dark theme (#1a1a1a background, hover state elevation)
5. Real-time updates: New barbers appear instantly
6. Daily stats calculated from `serviceLogs` where `barberId` matches and `createdAt` is today (local time)
7. Stats update in real-time as services are logged/approved
8. Empty state if no barbers: "No barbers yet. Add your first barber to get started."
9. Skeleton loading state on initial page load
10. Each card has dropdown menu (⋮) with "Edit" and "Delete" options

### Story 2.7: Barber CRUD - Edit Barber Profile

**As a** manager,
**I want** to edit a barber's details including their commission rate,
**so that** I can update information or adjust commission percentages.

**Acceptance Criteria:**

1. Clicking "Edit" in barber card dropdown opens modal dialog
2. Dialog form pre-filled with current barber data: username, avatarUrl, commissionRate
3. All fields editable except username (username field disabled/read-only to avoid complications)
4. Commission rate validation: 0-100, positive number
5. On submit: User document updated in Firestore with new values
6. If commission rate changed: Toast notification includes note "New rate applies to future services only"
7. Existing service logs retain their original commission rate (historical accuracy)
8. Dialog closes, barber card reflects changes immediately
9. Cancel button closes dialog without saving
10. Error handling: Failed update shows toast error

### Story 2.8: Barber CRUD - Delete Barber Profile

**As a** manager,
**I want** to remove a barber from the team,
**so that** former employees can no longer access the system.

**Acceptance Criteria:**

1. Clicking "Delete" in barber card dropdown shows confirmation dialog
2. Confirmation dialog: "Are you sure you want to delete '[username]'? They will no longer be able to log in. Their historical service logs will be retained."
3. Confirmation has "Cancel" and "Delete" (destructive) buttons
4. On confirm: Barber user document deleted from Firestore `users` collection
5. Firebase Auth user disabled (not deleted) to preserve authentication history
6. Custom claim removed or account disabled
7. Barber cannot log in after deletion (redirect to login with error message)
8. Historical service logs retained (barberId remains in serviceLogs for reporting)
9. Toast notification: "Barber '[username]' removed successfully"
10. Barber card disappears from grid immediately

### Story 2.9: Form Validation & Error Handling

**As a** manager,
**I want** clear feedback when I make input mistakes in forms,
**so that** I can correct errors before submitting.

**Acceptance Criteria:**

1. All forms (Add/Edit Service, Add/Edit Barber) use Zod schemas for validation
2. Validation errors displayed inline below each field in red text (#ef4444)
3. Error messages are specific: "Price must be a positive number", "Username is required", "Commission rate must be between 0 and 100"
4. Submit buttons disabled when form has validation errors
5. Fields with errors have red border (#ef4444)
6. Real-time validation: Errors appear as user types (debounced by 300ms)
7. Errors clear when field becomes valid
8. Focus automatically moves to first error field on attempted submit with errors
9. Firebase errors (network issues, permission denied) caught and displayed as toast notifications
10. All error messages meet accessibility standards (associated with fields via aria-describedby)

### Story 2.10: Real-time Catalog Updates

**As a** manager or barber,
**I want** service and barber lists to update in real-time without refreshing,
**so that** I always see current data when working collaboratively.

**Acceptance Criteria:**

1. Service catalog uses Firestore onSnapshot listener for real-time updates
2. Barber grid uses Firestore onSnapshot listener for real-time updates
3. New items added by any user appear instantly across all connected clients (within 2 seconds)
4. Updated items (edited services/barbers) reflect changes instantly
5. Deleted items disappear instantly
6. Multiple managers can work simultaneously without conflicts
7. Listeners automatically unsubscribe when user navigates away (cleanup in useEffect return)
8. Network errors (offline) show toast notification: "You're offline. Changes will sync when reconnected."
9. Animations for new items: 200ms fade-in + slide from top
10. No flickering or UI jank during real-time updates

---

## Epic 3: Service Logging & Approval Workflow

**Epic Goal:** Deliver the end-to-end service logging and approval workflow, enabling barbers to log completed services (multi-select) that enter pending status, managers to approve/reject logs via dashboard with commission calculations, and both roles to track service history with real-time updates, completing the core commission transparency value proposition.

### Story 3.1: Barber Service Logging - Multi-Select UI

**As a** barber,
**I want** to select multiple completed services from a grid,
**so that** I can log them all at once instead of one at a time.

**Acceptance Criteria:**

1. Barber dashboard "Log a Service" section displays all services from Firestore as selectable cards
2. Cards show: Service name, Price, Duration
3. Cards are clickable/tappable (entire card is touch target, minimum 44x44px)
4. Selected state indicated by: Primary color ring border (2-3px #f59e0b), subtle background tint
5. Multiple cards can be selected simultaneously
6. Keyboard support: Tab to navigate cards, Space bar to toggle selection
7. Selection count displayed in "Log Service" button: "Log Service" (if 0 selected) or "Log 3 Service(s)" (if 3 selected)
8. Button disabled if no services selected
9. Clicking a selected card deselects it (toggles selection state)
10. Selection persists until "Log Service(s)" clicked or page refreshed

### Story 3.2: Barber Service Logging - Create Service Logs

**As a** barber,
**I want** to log selected services with one click,
**so that** they are submitted for manager approval and I can track my work.

**Acceptance Criteria:**

1. Clicking "Log X Service(s)" button creates service log documents in Firestore `serviceLogs` collection
2. One document created per selected service with fields: barberId (current user ID), serviceId, price (snapshot from service), commissionRate (snapshot from barber profile), commissionAmount (calculated: price × commissionRate), status: 'pending', createdAt (timestamp), approvedAt: null, rejectedAt: null
3. Toast notification shown: "3 service(s) logged successfully. Pending manager approval."
4. Selected services automatically deselected after logging
5. Optimistic UI update: "My Logged Services" table immediately shows new rows with "Pending" status
6. If Firebase write fails: Optimistic update rolled back, error toast shown: "Failed to log services. Please try again."
7. Service name displayed in table (fetched via serviceId reference)
8. Real-time: If manager opens dashboard while barber is logging, new logs appear instantly in "Pending Approvals"
9. Barber can immediately log more services after successful submission
10. Button returns to "Log Service" label after submission

### Story 3.3: Barber Service Log History Table

**As a** barber,
**I want** to see all my logged services with their approval status,
**so that** I can track which services have been approved and what my earnings are.

**Acceptance Criteria:**

1. "My Logged Services" table on barber dashboard displays all service logs where `barberId` equals current user
2. Table columns: Service (name), Price ($XX.XX), Date (MM/DD/YYYY HH:MM), Status (badge with icon+text)
3. Status badges: Pending (⏱️ amber), Approved (✓ green), Rejected (✗ red)
4. Table sorted by createdAt descending (newest first)
5. Real-time updates: Status changes from pending → approved/rejected reflect instantly
6. Pagination appears if >100 rows (page size: 50)
7. Sortable columns: Click column header to sort by that column (date, price)
8. Empty state: "No services logged yet. Start by logging a service above."
9. Mobile responsive: Table scrolls horizontally, or columns stack vertically
10. Table uses ShadCN Table component with striped rows (#1a1a1a / #141414 alternating)

### Story 3.4: Barber Daily Stats Display

**As a** barber,
**I want** to see my daily service count and revenue at the top of my dashboard,
**so that** I can track my daily productivity and earnings.

**Acceptance Criteria:**

1. Two KPI cards displayed at top of barber dashboard: "Services Today" and "Revenue Today"
2. Services Today: Count of service logs where barberId = current user, status = 'approved', createdAt is today (local timezone)
3. Revenue Today: Sum of `commissionAmount` for approved service logs created today
4. Values formatted: Services as integer (e.g., "5"), Revenue as currency ($XXX.XX)
5. Real-time updates: When manager approves a service, stats update instantly
6. Stats reset at midnight local time
7. If no approved services today: Shows "0" and "$0.00" (not "No data" or empty)
8. Cards styled: Dark theme (#1a1a1a background), large numbers (24px+), descriptive labels
9. Skeleton loading state on initial page load
10. Query optimized: Use Firestore index (barberId + status + createdAt) to avoid full collection scan

### Story 3.5: Barber Delete Pending Logs

**As a** barber,
**I want** to delete my own service logs while they're still pending,
**so that** I can correct mistakes before manager review.

**Acceptance Criteria:**

1. Service logs with status 'pending' have a delete action in the barber's service log table (trash icon button in row)
2. Clicking delete shows confirmation dialog: "Delete this pending service log?"
3. Confirmation buttons: "Cancel" and "Delete" (destructive)
4. On confirm: Service log document deleted from Firestore
5. Row disappears from table immediately (optimistic update)
6. Toast notification: "Service log deleted"
7. Only pending logs can be deleted (approved/rejected logs do not show delete button)
8. Barbers can only delete their own logs (security rule enforced)
9. If delete fails: Optimistic update rolled back, error toast shown
10. Deleted logs do not count toward daily stats

### Story 3.6: Manager Pending Approvals Queue

**As a** manager,
**I want** to see all pending service logs in a dedicated table on my dashboard,
**so that** I can review and approve barber work efficiently.

**Acceptance Criteria:**

1. Manager dashboard includes "Pending Approvals" section with table
2. Table displays all service logs with `status: 'pending'` from Firestore
3. Columns: Barber (name), Service (name), Price ($XX.XX), Date (MM/DD/YYYY HH:MM), Actions (✓ ✗ icon buttons)
4. Real-time updates: New pending logs from barbers appear instantly in table
5. Table sorted by createdAt ascending (oldest first, FIFO queue)
6. Empty state: "No pending approvals. All caught up!"
7. Barber and Service names fetched via ID references (populated from `users` and `services` collections)
8. Actions column: Green checkmark button (approve), Red X button (reject)
9. Icon buttons have tooltips on hover: "Approve" and "Reject"
10. Touch targets meet mobile requirements (44x44px minimum)

### Story 3.7: Manager Approve Service Log

**As a** manager,
**I want** to approve a pending service log with one click,
**so that** it counts toward revenue and the barber's commission is confirmed.

**Acceptance Criteria:**

1. Clicking ✓ (approve) icon button immediately updates service log status to 'approved'
2. Service log document updated in Firestore: status: 'approved', approvedAt: timestamp
3. Optimistic UI update: Row disappears from "Pending Approvals" table instantly
4. Toast notification: "Service log approved"
5. Real-time: Barber's dashboard updates instantly (status badge changes to "Approved", daily stats increase)
6. Approved log contributes to: Total Revenue (manager KPIs), Barber's daily stats, Leaderboards
7. Commission amount already calculated and stored in service log (no recalculation needed)
8. If update fails: Optimistic update rolled back, error toast shown
9. Approved logs cannot be un-approved (status change is permanent)
10. Security rule enforced: Only users with role 'manager' can set status to 'approved'

### Story 3.8: Manager Reject Service Log

**As a** manager,
**I want** to reject a pending service log,
**so that** incorrect or disputed services don't count toward revenue.

**Acceptance Criteria:**

1. Clicking ✗ (reject) icon button updates service log status to 'rejected'
2. Service log document updated in Firestore: status: 'rejected', rejectedAt: timestamp
3. Optimistic UI update: Row disappears from "Pending Approvals" table
4. Toast notification: "Service log rejected"
5. Real-time: Barber's dashboard updates instantly (status badge changes to "Rejected")
6. Rejected log does NOT contribute to any financial calculations or stats
7. Rejected log retained in Firestore for audit trail
8. Barber can see rejected logs in their history table
9. Rejected logs cannot be re-approved (status change is permanent)
10. Security rule enforced: Only managers can set status to 'rejected'

### Story 3.9: Manager Log Service on Behalf of Barber

**As a** manager,
**I want** to log a service on behalf of any barber with auto-approval,
**so that** I can correct missed entries or manually add services.

**Acceptance Criteria:**

1. Manager dashboard includes "Log a Service" section with dropdowns: "Select Barber" and "Select Service"
2. Barber dropdown populated with all active barbers (from `users` collection, role: 'barber')
3. Service dropdown populated with all services (from `services` collection)
4. "Log Service" button enabled only when both barber and service selected
5. Clicking "Log Service" creates service log with: barberId (selected barber), serviceId (selected service), price (from service), commissionRate (from barber), commissionAmount (calculated), status: 'approved', createdAt: timestamp, approvedAt: timestamp
6. Status is 'approved' (bypasses pending queue since manager is trusted)
7. Toast notification: "Service logged for [barber name]"
8. Dropdowns reset to placeholder values after successful submission
9. Real-time: Barber's dashboard updates instantly (new approved log appears, daily stats increase)
10. Manager-logged services indistinguishable from manager-approved barber-logged services in reporting

### Story 3.10: Commission Calculation & Storage

**As a** system,
**I want** commission amounts calculated and stored when service logs are created,
**so that** commission rates are locked in at logging time and financial reports are accurate.

**Acceptance Criteria:**

1. When service log created: commissionRate and price snapshotted from current barber profile and service
2. commissionAmount calculated: price × commissionRate, rounded to 2 decimal places
3. Formula implemented as utility function: `calculateCommission(price: number, rate: number): number`
4. Unit tests verify calculation accuracy: $50 × 0.45 = $22.50, $100 × 0.50 = $50.00
5. Stored values immutable: If barber's commission rate or service price later changes, existing logs retain original values
6. This ensures historical accuracy for payroll and reporting
7. If commission rate = 0 (e.g., manager without commission): commissionAmount = 0
8. Negative prices rejected by validation (cannot create negative commission)
9. Commission amounts displayed in barber daily stats, financial ledger, and reports
10. TypeScript types enforce number types for price, rate, amount (no string math)

### Story 3.11: Real-time Sync Across All Clients

**As a** manager or barber,
**I want** all data changes to appear instantly across all open browser windows,
**so that** multiple users can work simultaneously without confusion.

**Acceptance Criteria:**

1. Manager dashboard "Pending Approvals" table uses onSnapshot listener (updates in real-time)
2. Barber dashboard "My Logged Services" table uses onSnapshot listener
3. Barber daily stats use onSnapshot listener on serviceLogs filtered by barberId
4. When barber logs a service: Manager dashboard shows new pending log within 2 seconds
5. When manager approves a service: Barber dashboard status changes to "Approved" within 2 seconds, daily stats increment
6. Multiple managers can approve different logs simultaneously without conflicts
7. Optimistic UI updates used for user actions (approve, reject, log) with rollback on error
8. Network latency simulated in E2E tests (throttle to 3G) to verify updates still propagate
9. Animations for real-time updates: New rows fade in (200ms), status changes pulse highlight (green for approve)
10. No polling or manual refresh required - all updates pushed via Firestore listeners

### Story 3.12: Optimistic UI Updates & Error Recovery

**As a** user,
**I want** instant feedback when I take actions, with graceful recovery if something fails,
**so that** the app feels fast and reliable even with network issues.

**Acceptance Criteria:**

1. React Query configured for optimistic updates on all mutations (log service, approve, reject)
2. When barber clicks "Log Service": Rows appear in table instantly (before Firestore confirms)
3. When manager clicks approve: Row disappears from pending queue instantly
4. If Firebase write fails: Optimistic update rolled back automatically
5. Error toast shown: "Action failed. Please try again."
6. Failed row animates "shake" effect (100ms) to indicate error
7. User can retry action immediately after failure
8. Network status monitored: If offline, show persistent toast: "You're offline. Changes will sync when reconnected."
9. When reconnected: Queued mutations automatically retry
10. E2E test verifies: Disconnect network mid-action, verify rollback and error message

---

## Epic 4: Reporting & Analytics

**Epic Goal:** Deliver comprehensive business intelligence features including real-time dashboard KPIs (revenue, services, active barbers), performance leaderboards ranking barbers and services, detailed financial ledger with commission breakdowns, date range filtering, and search functionality, enabling data-driven decision-making for salon management.

### Story 4.1: Manager Dashboard Aggregate KPIs

**As a** manager,
**I want** to see high-level business metrics on my dashboard,
**so that** I can quickly assess salon performance.

**Acceptance Criteria:**

1. Manager dashboard displays 3 KPI cards: Total Revenue, Total Services Logged, Active Barbers
2. **Total Revenue:** Sum of all service log prices where status = 'approved'
3. **Total Services Logged:** Count of all service logs where status = 'approved'
4. **Active Barbers:** Count of users where role = 'barber'
5. Values displayed in large, bold font (24px+) with descriptive labels
6. Cards styled with dark theme (#1a1a1a background, #f59e0b accents)
7. Real-time updates: Metrics increment immediately when services approved
8. Skeleton loading state shown on initial page load
9. If no data: Shows "0", "$0.00", "0" (not empty or error)
10. Query optimization: Use Firestore aggregation queries where supported, otherwise client-side calculation

### Story 4.2: Financial Reports Page - KPI Summary

**As a** manager,
**I want** a dedicated reports page with detailed financial summaries,
**so that** I can analyze profitability and commissions.

**Acceptance Criteria:**

1. Reports page created at `/manager/reports` route
2. Date range picker at top of page with presets: Today, Last 7 Days, Last 30 Days, Custom Range
3. Date picker uses a date range component (ShadCN DateRangePicker or similar)
4. Three KPI cards below date picker: Total Revenue, Total Commissions Payout, Net Profit
5. **Total Revenue:** Sum of service log prices (approved, within date range)
6. **Total Commissions Payout:** Sum of commissionAmount (approved, within date range)
7. **Net Profit:** Total Revenue - Total Commissions Payout
8. Date range filter applies to all sections on page (KPIs, leaderboards, ledger)
9. Default date range: Last 30 Days
10. Real-time updates: Metrics update when new services approved (if within selected date range)

### Story 4.3: Performance Leaderboard - Top Barbers

**As a** manager,
**I want** to see which barbers are generating the most revenue,
**so that** I can recognize top performers and identify training needs.

**Acceptance Criteria:**

1. Reports page includes "Top Barbers" leaderboard table below KPIs
2. Table columns: Rank (#1, #2, #3...), Barber (name), Services (count), Revenue ($XXX.XX)
3. Data aggregated from service logs: Group by barberId, sum prices, count logs (status = approved, within date range)
4. Sorted by revenue descending (highest earner at #1)
5. Top 10 barbers displayed by default
6. "View All" button expands to show all barbers
7. Real-time updates: Rankings shift when new services approved
8. Avatar displayed next to barber name (if available)
9. Clicking a barber row could drill down to their individual report (stretch goal - not required for MVP)
10. Empty state if no data: "No services logged in selected date range"

### Story 4.4: Performance Leaderboard - Top Services

**As a** manager,
**I want** to see which services are most popular and generate the most revenue,
**so that** I can optimize pricing and marketing.

**Acceptance Criteria:**

1. Reports page includes "Top Services" leaderboard table next to "Top Barbers"
2. Tables displayed side-by-side on desktop (>1024px), stacked on mobile (<1024px)
3. Columns: Rank, Service (name), Count (# of times logged), Revenue ($XXX.XX)
4. Data aggregated from service logs: Group by serviceId, sum prices, count logs (status = approved, within date range)
5. Sorted by revenue descending (highest revenue service at #1)
6. Top 10 services displayed by default
7. "View All" button expands table
8. Real-time updates: Rankings change as services logged
9. Service price displayed next to name (current price, not historical)
10. Responsive: Tables scroll horizontally on small screens if needed

### Story 4.5: Detailed Financial Ledger

**As a** manager,
**I want** a complete transaction-level report of all approved services,
**so that** I can audit commissions and verify payroll.

**Acceptance Criteria:**

1. Reports page includes "Financial Ledger" section below leaderboards
2. Full-width table with columns: Date, Barber, Service, Price, Commission Rate, Commission Amount, Net Profit (Price - Commission)
3. Displays all approved service logs within selected date range
4. Sorted by date descending (newest first)
5. Pagination: 50 rows per page (ShadCN Pagination component)
6. Real-time updates: New approved logs appear at top of table
7. Mobile responsive: Table scrolls horizontally or columns stack
8. Export button (stretch goal - not required for MVP)
9. Totals row at bottom of each page: Sum of Price, Commission Amount, Net Profit columns
10. Empty state: "No transactions in selected date range"

### Story 4.6: Date Range Filtering

**As a** manager,
**I want** to filter all reports by custom date ranges,
**so that** I can analyze specific time periods (weekly, monthly, quarterly).

**Acceptance Criteria:**

1. Date range picker prominently displayed at top of reports page
2. Clicking picker opens calendar overlay (ShadCN DateRangePicker)
3. User can select start and end dates visually
4. Preset buttons: "Today" (00:00-23:59 today), "Last 7 Days", "Last 30 Days", "This Month", "Last Month", "Custom"
5. Clicking preset instantly applies filter to all report sections
6. Custom range: User clicks two dates in calendar to set range
7. Selected range displayed in picker input: "MM/DD/YYYY - MM/DD/YYYY"
8. "Clear" button resets to default (Last 30 Days)
9. Date range persists in URL query params (?from=2025-10-01&to=2025-10-31) for shareable links
10. All queries (KPIs, leaderboards, ledger) filter by: `createdAt >= startDate AND createdAt <= endDate`

### Story 4.7: Ledger Search Functionality

**As a** manager,
**I want** to search the financial ledger by barber or service name,
**so that** I can quickly find specific transactions.

**Acceptance Criteria:**

1. Search input field above financial ledger table
2. Placeholder text: "Search by barber or service name..."
3. Search debounced by 300ms (waits for user to stop typing)
4. Case-insensitive substring matching: Matches barber username or service name
5. Table filters to show only matching rows
6. Search applies on top of date range filter (both filters combine)
7. If no matches: Shows "No results found for '[query]'"
8. Clear search button (X icon) in input field
9. Search value persists in URL query param (?q=haircut)
10. Real-time: New logs that match search appear instantly

### Story 4.8: Barber Daily Stats on Barber Cards

**As a** manager,
**I want** to see each barber's daily performance on their profile card,
**so that** I can quickly identify who's working and who's idle.

**Acceptance Criteria:**

1. Barber cards on `/manager/barbers` page display daily stats below barber name
2. Stats shown: "Services Today: X | Revenue Today: $XX.XX"
3. Stats calculated from service logs: barberId matches, status = approved, createdAt is today
4. Real-time updates: Stats increment when services approved
5. Stats reset at midnight local time
6. If no services today: Shows "Services Today: 0 | Revenue Today: $0.00"
7. Stats styled with smaller font (14px), muted color (#9ca3af)
8. Stats use same calculation logic as barber dashboard daily stats (consistency)
9. Query optimized: Uses Firestore index
10. Clicking a barber card could navigate to detailed barber report (stretch goal - not MVP)

### Story 4.9: Sortable Tables

**As a** manager,
**I want** to sort tables by clicking column headers,
**so that** I can analyze data from different perspectives.

**Acceptance Criteria:**

1. All tables on reports page have sortable columns (Leaderboards, Financial Ledger)
2. Clicking column header sorts by that column: First click ascending, second click descending, third click returns to default
3. Sort indicator icon displayed in header: ↑ (ascending) or ↓ (descending)
4. Currently sorted column highlighted with primary accent color (#f59e0b)
5. Financial Ledger sortable by: Date, Barber (alphabetical), Service (alphabetical), Price, Commission Amount
6. Leaderboards sortable by: Rank, Barber/Service, Services Count, Revenue
7. Default sort order preserved when changing date range (sort persists)
8. Sort state saved in URL query param (?sort=price&order=desc)
9. Keyboard accessible: Tab to header, Enter to toggle sort
10. Real-time: New rows inserted in correct sorted position

### Story 4.10: Performance Optimization for Large Datasets

**As a** system,
**I want** reports to load quickly even with thousands of service logs,
**so that** the manager dashboard remains responsive.

**Acceptance Criteria:**

1. Financial Ledger implements pagination: Only 50 rows fetched per page (Firestore limit + cursor-based pagination)
2. Leaderboards limited to top 10 by default (expandable to "View All")
3. Firestore queries use indexes: barberId+status+createdAt, serviceId+status+createdAt
4. Aggregations (sums, counts) calculated server-side if possible, otherwise cached client-side
5. Real-time listeners use query filters to minimize data transfer (only approved logs, date range)
6. React Query caching: Report data cached for 5 minutes, only refetches if stale
7. Loading states: Skeleton screens while data loading (no blank page flicker)
8. Debounced search: Doesn't re-query on every keystroke
9. Lighthouse performance audit: Page load < 3 seconds on 3G network
10. E2E test with 1000+ service logs verifies page loads and sorts correctly

## Next Steps

### UX Expert Prompt

Review the SalonFlow PRD (docs/prd.md) and create detailed UX/UI specifications including:

- High-fidelity wireframes or mockups for all screens (Login, Dashboards, Management pages, Reports)
- Component specifications leveraging ShadCN UI library
- Interaction flows and state transitions
- Responsive design breakpoints and mobile adaptations
- Accessibility implementation guidance (WCAG 2.1 Level AA)
- Design system documentation (colors, typography, spacing, component variants)

Focus on the dark theme aesthetic with #0a0a0a backgrounds and #f59e0b amber accents, ensuring all UI elements meet contrast requirements and provide excellent usability for both manager and barber roles.

### Architect Prompt

Review the SalonFlow PRD (docs/prd.md) and create comprehensive technical architecture documentation including:

- Detailed system architecture diagram (Next.js + Firebase hybrid architecture)
- Firestore data model with collections, fields, and relationships
- Complete Firestore security rules implementation
- API route specifications for server-side operations
- State management architecture (Zustand + React Query patterns)
- Real-time data synchronization patterns and best practices
- Component structure and file organization
- Authentication flow implementation details
- Performance optimization strategies
- Testing strategy and test file structure

Reference the Technical Assumptions section for all technology choices and ensure architecture aligns with the 4-epic implementation plan.
