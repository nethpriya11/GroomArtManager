# Epic 2: Core Data Management (Services & Barbers)

**Epic Goal:** Deliver a complete salon configuration system enabling managers to create, read, update, and delete both services and barber profiles with full CRUD UI, real-time updates, form validation, and delete protections, allowing managers to fully set up their salon before operations begin.

## Story 2.1: Service CRUD - Create Service

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

## Story 2.2: Service CRUD - Display Service Catalog

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

## Story 2.3: Service CRUD - Edit Service

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

## Story 2.4: Service CRUD - Delete Service with Protection

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

## Story 2.5: Barber CRUD - Create Barber Profile

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

## Story 2.6: Barber CRUD - Display Barber Grid

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

## Story 2.7: Barber CRUD - Edit Barber Profile

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

## Story 2.8: Barber CRUD - Delete Barber Profile

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

## Story 2.9: Form Validation & Error Handling

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

## Story 2.10: Real-time Catalog Updates

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
