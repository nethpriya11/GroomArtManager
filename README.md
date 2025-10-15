# GroomArt - Salon Commission Tracking System

A modern salon management application for tracking barber commissions, service logs, and analytics.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Firebase (Auth, Firestore)
- **State Management**: Zustand, React Query
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **UI Components**: shadcn/ui

## Features

### Sprint 1-2: Core Features

- ✅ User authentication (Manager & Barber roles)
- ✅ Dashboard with navigation
- ✅ User management (view barbers, commission rates)
- ✅ Service management (CRUD operations)

### Sprint 3: Service Logging

- ✅ Barber service logging (log multiple services at once)
- ✅ Service log history with filtering
- ✅ Daily stats for barbers (today's revenue, commission, services)
- ✅ Manager approvals queue (approve/reject pending logs)

### Sprint 4: Reports & Analytics

- ✅ Dashboard KPIs (total revenue, pending approvals, active barbers)
- ✅ Financial summary charts
- ✅ Barber leaderboard (by revenue)
- ✅ Service leaderboard (most popular services)
- ✅ Detailed ledger with search and filtering

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- Firebase CLI (`npm install -g firebase-tools`)
- Java (for Firebase Emulators)

### Installation

1. Clone the repository

```bash
cd C:\Users\ranaw\Desktop\SalonGroomArt\GroomArt
```

2. Install dependencies

```bash
npm install
```

3. Environment variables are already configured in `.env.local`

### Running the Application

**IMPORTANT**: You must run these commands in order every time you start development:

#### 1. Start Firebase Emulators

```bash
firebase emulators:start
```

This will start:

- Auth Emulator on `http://localhost:9099`
- Firestore Emulator on `http://localhost:8081`
- Emulator UI on `http://localhost:4000`

#### 2. Seed Test Data

```bash
npm run seed:dev
```

This creates test users and services in the emulators.

**NOTE**: Emulator data is cleared when you restart it, so you MUST run this seed command after each emulator restart.

#### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Test Credentials

### Manager Account

- **Email**: manager@salonflow.com
- **Password**: manager123
- **Access**: Full access to all features, approvals, reports

### Barber Accounts

1. **Alex Johnson**
   - Email: barber1@salonflow.com
   - Password: barber123
   - Commission Rate: 40%

2. **Maria Garcia**
   - Email: barber2@salonflow.com
   - Password: barber123
   - Commission Rate: 45%

3. **James Smith**
   - Email: barber3@salonflow.com
   - Password: barber123
   - Commission Rate: 50%

### Test Services

- Haircut: $25 (30 min)
- Beard Trim: $15 (15 min)
- Shave: $20 (20 min)
- Hair Color: $60 (90 min)
- Kids Cut: $18 (20 min)

## Project Structure

```
GroomArt/
├── app/                          # Next.js App Router pages
│   ├── login/                    # Login page
│   ├── manager/                  # Manager dashboard & features
│   │   ├── dashboard/            # Manager home
│   │   ├── approvals/            # Pending service approvals
│   │   ├── reports/              # Analytics & reports
│   │   └── users/                # User management
│   └── barber/                   # Barber dashboard & features
│       └── dashboard/            # Barber home with logging
├── components/
│   ├── features/                 # Feature-specific components
│   │   ├── auth/                 # Authentication components
│   │   ├── dashboard/            # Dashboard widgets
│   │   ├── reports/              # Report components
│   │   ├── service-logs/         # Service logging
│   │   ├── services/             # Service management
│   │   └── users/                # User management
│   ├── layout/                   # Layout components (header, nav)
│   └── ui/                       # Reusable UI components (shadcn)
├── lib/
│   ├── firebase/                 # Firebase configuration
│   │   ├── config.ts             # Firebase initialization
│   │   └── repositories/         # Data access layer
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # Business logic services
│   ├── utils/                    # Utility functions
│   └── validations/              # Zod schemas
├── stores/                       # Zustand state stores
├── types/                        # TypeScript type definitions
└── scripts/
    └── seed-dev.ts               # Emulator seed script

```

## Key Files

### Firebase Configuration

- `lib/firebase/config.ts` - Firebase initialization with emulator connection
- `.env.local` - Environment variables (configured for emulators)
- `firebase.json` - Emulator configuration
- `.firebaserc` - Project ID configuration

### Authentication

- `lib/services/auth.ts` - Authentication service with login functions
- `app/login/page.tsx` - Login page with role selection
- `stores/authStore.ts` - Authentication state management

### Data Repositories

- `lib/firebase/repositories/user-repository.ts` - User CRUD operations
- `lib/firebase/repositories/service-repository.ts` - Service CRUD operations
- `lib/firebase/repositories/service-log-repository.ts` - Service log operations

### Custom Hooks

- `hooks/useRealtimeQuery.ts` - Real-time Firestore queries with React Query
- `hooks/useUsers.ts` - User data hooks
- `hooks/useServices.ts` - Service data hooks
- `hooks/useServiceLogs.ts` - Service log data hooks

## Development Notes

### Firebase Emulators

- **Emulator data is NOT persistent** - Data is cleared when emulators restart
- Always run `npm run seed:dev` after starting emulators
- Emulator UI is available at `http://localhost:4000` to view data

### Project ID

- The project uses `salonflow-prod` as the project ID
- This must match across:
  - `.firebaserc`
  - `.env.local` (NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  - `scripts/seed-dev.ts`

### Styling

- Dark theme with `#0a0a0a` background
- Orange accent color: `#f59e0b`
- All components use Tailwind CSS
- Requires `postcss.config.js` for Tailwind compilation

### State Management

- **Server State**: React Query (useRealtimeQuery hook for real-time updates)
- **Client State**: Zustand (auth store)
- **Forms**: React Hook Form with Zod validation

## Common Issues & Solutions

### Issue: "User not found" error when logging in

**Solution**: Run `npm run seed:dev` to seed the emulator with test data

### Issue: Styling not showing (plain text)

**Solution**: Ensure `postcss.config.js` exists and restart dev server

### Issue: "Invalid email or password" error

**Solution**:

1. Check that Firebase Emulators are running
2. Verify emulators are seeded with data (`npm run seed:dev`)
3. Ensure project IDs match across all config files

### Issue: Port conflicts (3000, 9099, 8081 already in use)

**Solution**:

```bash
# Find and kill processes
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

## Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed:dev` - Seed Firebase Emulators with test data
- `firebase emulators:start` - Start Firebase Emulators

## Architecture Decisions

### Why Firebase Emulators?

- Local development without affecting production data
- Fast iteration and testing
- No cost for development
- Same API as production Firebase

### Why React Query?

- Automatic caching and refetching
- Real-time updates via `useRealtimeQuery` hook
- Optimistic updates for better UX
- Built-in loading and error states

### Why Repository Pattern?

- Clean separation of concerns
- Easy to test and mock
- Centralized data access logic
- Easier to swap backends if needed

### Why Zustand for Auth?

- Simple and lightweight
- Persists auth state across page reloads
- Easy to integrate with Next.js
- TypeScript-friendly

## Deployment

**Note**: This app is currently configured for local development with Firebase Emulators.

For production deployment:

1. Create a Firebase project at https://console.firebase.google.com
2. Update `.env.local` with production Firebase credentials
3. Set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false`
4. Deploy Firestore security rules
5. Deploy to Vercel or another Next.js hosting platform

## License

Private project - All rights reserved

## Support

For issues or questions, contact the development team.
