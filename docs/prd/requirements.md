# Requirements

## Functional

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

## Non-Functional

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
