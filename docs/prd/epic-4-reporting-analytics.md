# Epic 4: Reporting & Analytics

**Epic Goal:** Deliver comprehensive business intelligence features including real-time dashboard KPIs (revenue, services, active barbers), performance leaderboards ranking barbers and services, detailed financial ledger with commission breakdowns, date range filtering, and search functionality, enabling data-driven decision-making for salon management.

## Story 4.1: Manager Dashboard Aggregate KPIs

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

## Story 4.2: Financial Reports Page - KPI Summary

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

## Story 4.3: Performance Leaderboard - Top Barbers

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

## Story 4.4: Performance Leaderboard - Top Services

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

## Story 4.5: Detailed Financial Ledger

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

## Story 4.6: Date Range Filtering

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

## Story 4.7: Ledger Search Functionality

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

## Story 4.8: Barber Daily Stats on Barber Cards

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

## Story 4.9: Sortable Tables

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

## Story 4.10: Performance Optimization for Large Datasets

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
