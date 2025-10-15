# Firebase Setup Guide

This guide walks you through setting up Firebase for the GroomArt salon management system.

## Table of Contents

1. [Firebase Console Setup](#firebase-console-setup)
2. [Local Development with Emulator](#local-development-with-emulator)
3. [Environment Configuration](#environment-configuration)
4. [Seeding Test Data](#seeding-test-data)
5. [Deploying to Production](#deploying-to-production)
6. [Troubleshooting](#troubleshooting)

---

## Firebase Console Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Enter project name: `salonflow-prod` (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click **Create project**

### 2. Enable Firestore Database

1. In Firebase Console, navigate to **Build > Firestore Database**
2. Click **Create database**
3. Select **Start in production mode** (we'll use our custom rules)
4. Choose location: **us-central1** (or closest to your users)
5. Click **Enable**

### 3. Enable Firebase Authentication

1. Navigate to **Build > Authentication**
2. Click **Get started**
3. Select **Email/Password** provider
4. Enable **Email/Password**
5. Click **Save**

### 4. Get Firebase Configuration

1. Navigate to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click web app icon (`</>`)
4. Register app name: `GroomArt Web`
5. Copy the Firebase configuration object:

```javascript
const firebaseConfig = {
  apiKey: 'AIzaSy...',
  authDomain: 'salonflow-prod.firebaseapp.com',
  projectId: 'salonflow-prod',
  storageBucket: 'salonflow-prod.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abc123',
}
```

6. Add these values to your `.env.local` file (see [Environment Configuration](#environment-configuration))

---

## Local Development with Emulator

For local development, we use Firebase Emulator Suite to avoid charges and enable offline development.

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase (Already Done)

The project is already configured with `firebase.json` and `.firebaserc`. You can skip this step.

If you need to reconfigure:

```bash
firebase init emulators
```

Select:

- ✓ Firestore Emulator
- ✓ Authentication Emulator

### 4. Start Emulators

```bash
npm run emulators
```

This starts:

- **Firestore Emulator**: http://localhost:8080
- **Auth Emulator**: http://localhost:9099
- **Emulator UI**: http://localhost:4000

### 5. Configure App to Use Emulator

Update your `.env.local`:

```bash
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
```

The app will automatically detect and connect to emulators in development mode.

---

## Environment Configuration

### 1. Create .env.local

Copy the example file:

```bash
cp .env.example .env.local
```

### 2. Add Firebase Credentials

Edit `.env.local` with your Firebase configuration:

```bash
# Firebase Configuration (from Firebase Console > Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=salonflow-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=salonflow-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=salonflow-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abc123

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development - Firebase Emulator
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
```

### 3. For Production Deployment

When deploying to production (e.g., Vercel):

- Set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false`
- Add all Firebase environment variables to your hosting platform's environment settings

---

## Seeding Test Data

For local development with emulators, use the seed script to create test data.

### 1. Start Firebase Emulators

```bash
npm run emulators
```

### 2. Run Seed Script (in a new terminal)

```bash
npm run seed:dev
```

This creates:

- **1 Manager**: manager@salonflow.com / manager123
- **3 Barbers**: barber1/2/3@salonflow.com / barber123
- **5 Services**: Haircut, Beard Trim, Shave, Hair Color, Kids Cut

### 3. View Data in Emulator UI

Open http://localhost:4000 to see:

- **Firestore Data**: Users, Services, Service Logs
- **Auth Users**: All created users with custom claims

### 4. Login Credentials

```
Manager Account:
  Email: manager@salonflow.com
  Password: manager123

Barber Accounts:
  Email: barber1@salonflow.com
  Password: barber123

  Email: barber2@salonflow.com
  Password: barber123

  Email: barber3@salonflow.com
  Password: barber123
```

---

## Deploying to Production

### 1. Deploy Firestore Rules

```bash
npm run firebase:deploy:rules
```

Or manually:

```bash
firebase deploy --only firestore:rules
```

### 2. Deploy Firestore Indexes

```bash
npm run firebase:deploy:indexes
```

Or manually:

```bash
firebase deploy --only firestore:indexes
```

### 3. Create Production Users

Production users must be created through the application's registration flow or manually in Firebase Console:

1. Navigate to **Authentication > Users**
2. Click **Add user**
3. Enter email and password
4. After creation, set custom claims via Cloud Functions or Firebase Admin SDK:

```javascript
await admin.auth().setCustomUserClaims(uid, {
  role: 'manager', // or 'barber'
})
```

---

## Firestore Collections Structure

### users

```typescript
{
  id: string // Firebase Auth UID
  username: string // Display name
  role: 'manager' | 'barber'
  avatarUrl: string | null
  commissionRate: number // 0.0 - 1.0 (e.g., 0.45 for 45%)
  createdAt: Timestamp
}
```

### services

```typescript
{
  id: string
  name: string
  price: number // Dollars (e.g., 25.00)
  duration: number // Minutes
  createdAt: Timestamp
}
```

### serviceLogs

```typescript
{
  id: string
  barberId: string // FK to users.id
  serviceId: string // FK to services.id
  price: number // Snapshot from service
  commissionRate: number // Snapshot from barber profile
  commissionAmount: number // Calculated: price * commissionRate
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Timestamp
  approvedAt: Timestamp | null
  rejectedAt: Timestamp | null
}
```

---

## Security Rules Overview

The `firestore.rules` file implements:

- **Authentication Required**: All operations require authentication
- **Role-Based Access Control**: Uses Firebase custom claims
  - **Managers**: Can read/write all data
  - **Barbers**: Can only read their own profile and logs
- **Service Logs**:
  - Barbers can create logs for themselves (status must be 'pending')
  - Only managers can approve/reject logs
  - Barbers cannot modify logs after creation

---

## Troubleshooting

### Issue: Firebase config validation error

**Error**: "Missing required Firebase environment variables"

**Solution**: Ensure all `NEXT_PUBLIC_FIREBASE_*` variables are set in `.env.local`

### Issue: Emulator connection error

**Error**: "Failed to connect to emulator"

**Solution**:

1. Check emulators are running: `npm run emulators`
2. Verify `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` in `.env.local`
3. Check ports 8080 and 9099 are not in use

### Issue: Seed script fails

**Error**: "Connection refused to localhost:8080"

**Solution**:

1. Start emulators first: `npm run emulators`
2. Wait for emulators to fully start (check UI at http://localhost:4000)
3. Run seed script in a separate terminal: `npm run seed:dev`

### Issue: Security rules denying access

**Error**: "Missing or insufficient permissions"

**Solution**:

1. Ensure user has custom claims set: `role: 'manager'` or `role: 'barber'`
2. Check if rules are deployed: `npm run firebase:deploy:rules`
3. Review `firestore.rules` for the specific collection

### Issue: Index not found

**Error**: "The query requires an index"

**Solution**:

1. Deploy indexes: `npm run firebase:deploy:indexes`
2. Wait for index build to complete (can take several minutes)
3. Check index status in Firebase Console > Firestore > Indexes

---

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## Support

For issues related to Firebase setup, please refer to:

1. This documentation
2. Firebase Console for project-specific settings
3. Firebase Support for platform issues
4. Project README.md for general development setup
