# GroomArt - Quick Start Guide

## Starting the Application

Follow these 3 steps **IN ORDER** every time you want to run the app:

### Step 1: Start Firebase Emulators

```bash
firebase emulators:start
```

Wait until you see:

```
✔  All emulators ready! It is now safe to connect your app.
```

### Step 2: Seed Test Data

**Open a new terminal** and run:

```bash
npm run seed:dev
```

You should see:

```
✅ Seed script completed successfully!
```

### Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

---

## Login Credentials

### Manager

- Email: `manager@salonflow.com`
- Password: `manager123`

### Barbers

- `barber1@salonflow.com` / `barber123` (Alex Johnson - 40%)
- `barber2@salonflow.com` / `barber123` (Maria Garcia - 45%)
- `barber3@salonflow.com` / `barber123` (James Smith - 50%)

---

## Emulator URLs

- **App**: http://localhost:3000
- **Emulator UI**: http://localhost:4000
- **Auth Emulator**: http://localhost:9099
- **Firestore Emulator**: http://localhost:8081

---

## Important Notes

⚠️ **Emulator data is NOT saved between restarts!**

- Every time you restart the emulators, you MUST run `npm run seed:dev` again

⚠️ **Project ID must be `salonflow-prod`**

- Check `.firebaserc`, `.env.local`, and `scripts/seed-dev.ts`

---

## Troubleshooting

### "User not found" error?

Run: `npm run seed:dev`

### Styling not working?

Check that `postcss.config.js` exists, then restart: `npm run dev`

### Port already in use?

```bash
# Find process
netstat -ano | findstr :3000

# Kill it
taskkill /PID <pid> /F
```

---

## All Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linter
npm run seed:dev     # Seed emulator data

firebase emulators:start    # Start Firebase emulators
```
