# User Interface Design Goals

## Overall UX Vision

SalonFlow prioritizes **clarity, speed, and role-appropriate information density**. The interface embraces a **modern dark aesthetic** that conveys professionalism while reducing eye strain during extended use. Real-time feedback is paramount—every user action receives immediate visual confirmation through toast notifications and optimistic UI updates.

The UX philosophy centers on **minimal friction for frequent tasks**: barbers should be able to log multiple services in under 10 seconds, while managers should see critical information (pending approvals, daily revenue) at a glance without scrolling. The system employs **progressive disclosure**—showing only relevant information per role while keeping advanced features (reports, detailed ledgers) accessible but not intrusive.

**Design principles:**

- **Feedback first:** Every action gets immediate visual response (optimistic updates, loading states, toast confirmations)
- **Clarity over density:** White space and clear typography prevent information overload
- **Forgiving UX:** Undo for non-destructive actions, confirmation for destructive ones
- **Mobile-aware:** Touch targets ≥44px, thumb-zone optimization for primary actions on mobile

## Key Interaction Paradigms

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

## Core Screens and Views

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

## Accessibility: WCAG 2.1 Level AA

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

## Branding

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

## Target Device and Platforms: Web Responsive (Desktop + Mobile)

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

## Component Library Usage (ShadCN UI)

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

## Animation & Performance

- Page transitions: None (instant navigation, preserve scroll position)
- Loading states: Skeleton screens with pulse animation
- Real-time updates: 200ms fade-in for new rows
- Optimistic updates: Instant UI change, rollback on error with shake animation
- Target: 60fps for all animations, no jank on scroll
