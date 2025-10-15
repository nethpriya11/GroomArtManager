# Technical Assumptions

## Repository Structure: Monorepo

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

## Service Architecture

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

## Testing Requirements

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

## Additional Technical Assumptions and Requests

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
