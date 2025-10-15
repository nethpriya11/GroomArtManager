# Epic 3: Service Logging & Approval Workflow

**Epic Goal:** Deliver the end-to-end service logging and approval workflow, enabling barbers to log completed services (multi-select) that enter pending status, managers to approve/reject logs via dashboard with commission calculations, and both roles to track service history with real-time updates, completing the core commission transparency value proposition.

## Story 3.1: Barber Service Logging - Multi-Select UI

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

## Story 3.2: Barber Service Logging - Create Service Logs

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

## Story 3.3: Barber Service Log History Table

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

## Story 3.4: Barber Daily Stats Display

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

## Story 3.5: Barber Delete Pending Logs

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

## Story 3.6: Manager Pending Approvals Queue

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

## Story 3.7: Manager Approve Service Log

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

## Story 3.8: Manager Reject Service Log

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

## Story 3.9: Manager Log Service on Behalf of Barber

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

## Story 3.10: Commission Calculation & Storage

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

## Story 3.11: Real-time Sync Across All Clients

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

## Story 3.12: Optimistic UI Updates & Error Recovery

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
