# CI/CD Setup Guide

This guide walks you through setting up the complete CI/CD pipeline for GroomArt, including GitHub Actions, Vercel deployment, and branch protection.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initialize Git Repository](#initialize-git-repository)
3. [Vercel Setup](#vercel-setup)
4. [GitHub Secrets Configuration](#github-secrets-configuration)
5. [Branch Protection Rules](#branch-protection-rules)
6. [Testing the Pipeline](#testing-the-pipeline)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- [ ] GitHub account with a repository for this project
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] Firebase project configured (from Story 1.2)
- [ ] Firebase CLI installed globally: `npm install -g firebase-tools`
- [ ] Git installed on your machine

---

## Initialize Git Repository

If you haven't already, initialize git and push to GitHub:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Project scaffolding and CI/CD setup"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Vercel Setup

### 1. Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository:**
   - Select your GitHub repository
   - Click **"Import"**

### 2. Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:

- **Framework Preset:** Next.js
- **Root Directory:** `./` (leave as default)
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install`
- **Development Command:** `npm run dev`

### 3. Configure Environment Variables

Add all Firebase environment variables from your `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
```

**Important:** Set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false` for production!

### 4. Get Vercel Credentials

You'll need these for GitHub Secrets:

**Get Vercel Token:**

1. Go to [Vercel Account Settings → Tokens](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Name it: `GitHub Actions CI/CD`
4. Scope: `Full Account`
5. Copy the token (you won't see it again!)

**Get Vercel Project ID and Org ID:**

1. Go to your project **Settings → General**
2. Scroll to **"Project ID"** - copy it
3. Look for **"Organization ID"** in the project settings - copy it

Or use Vercel CLI:

```bash
# Link your project
vercel link

# This creates .vercel/project.json with:
# - projectId
# - orgId
```

### 5. Configure Deployment Settings

In your Vercel project settings:

**General → Git:**

- ✅ **Production Branch:** `main`
- ✅ **Automatic Deployments:** Enabled

**Git → Branches:**

- ✅ **Preview Deployments:** All branches
- ✅ **Automatic Preview Deployments:** Enabled

---

## GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

### Navigate to Secrets

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

### Required Secrets

#### 1. VERCEL_TOKEN

- **Value:** Token from Vercel Account Settings
- Used to authenticate Vercel CLI in GitHub Actions

#### 2. VERCEL_ORG_ID

- **Value:** Organization ID from Vercel project settings or `.vercel/project.json`
- Example: `team_abc123xyz` or `user_abc123xyz`

#### 3. VERCEL_PROJECT_ID

- **Value:** Project ID from Vercel project settings or `.vercel/project.json`
- Example: `prj_abc123xyz`

#### 4. FIREBASE_SERVICE_ACCOUNT

- **Value:** Firebase Admin SDK service account JSON (entire file content)
- **How to get it:**
  1. Go to [Firebase Console](https://console.firebase.google.com/)
  2. Select your project
  3. **Project Settings** → **Service accounts**
  4. Click **"Generate new private key"**
  5. Save the downloaded JSON file
  6. Copy the **entire JSON content** as the secret value

Example JSON structure (don't use this literally):

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xyz@your-project.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://..."
}
```

---

## Branch Protection Rules

Protect your `main` branch to enforce code quality:

### 1. Navigate to Branch Protection

1. Go to your GitHub repository
2. **Settings** → **Branches**
3. Click **"Add branch protection rule"**

### 2. Configure Protection Rules

**Branch name pattern:** `main`

**Protect matching branches:**

✅ **Require a pull request before merging**

- Require approvals: `1` (recommended)
- Dismiss stale pull request approvals when new commits are pushed
- Require review from Code Owners (optional)

✅ **Require status checks to pass before merging**

- Require branches to be up to date before merging
- **Status checks that are required:**
  - `Test & Build` (from GitHub Actions)
  - `E2E Tests` (from GitHub Actions)

✅ **Require conversation resolution before merging**

✅ **Do not allow bypassing the above settings**

**Optional but recommended:**

- ✅ Require deployments to succeed before merging
- ✅ Require signed commits

### 3. Save Changes

Click **"Create"** or **"Save changes"**

---

## Testing the Pipeline

### 1. Test Husky Pre-commit Hook

```bash
# Make a small change
echo "// Test comment" >> app/page.tsx

# Stage and commit (Husky will run lint-staged)
git add app/page.tsx
git commit -m "Test: Husky pre-commit hook"

# If there are lint/format issues, they'll be auto-fixed or will block the commit
```

### 2. Test Pull Request Workflow

```bash
# Create a new branch
git checkout -b test-ci-pipeline

# Make a change
echo "// CI test" >> app/layout.tsx

# Commit and push
git add app/layout.tsx
git commit -m "Test: CI pipeline"
git push origin test-ci-pipeline

# Create PR on GitHub and verify:
# - Test job runs and passes
# - Vercel creates a preview deployment
# - PR cannot be merged if tests fail
```

### 3. Test Production Deployment

```bash
# Merge PR to main (via GitHub UI after approval)

# On main branch, verify:
# - Test job runs and passes
# - E2E job runs and passes
# - Deploy job runs and deploys to Vercel
# - Firestore rules are deployed
# - Firestore indexes are deployed
```

### 4. Verify Deployment

1. **Check GitHub Actions:**
   - Go to **Actions** tab in your repository
   - Verify all jobs (test, e2e, deploy) passed

2. **Check Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Verify deployment succeeded
   - Click on deployment URL to test the app

3. **Check Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - **Firestore → Rules** - Verify rules are updated
   - **Firestore → Indexes** - Verify indexes are created

---

## Troubleshooting

### Issue: GitHub Actions failing on "Install dependencies"

**Error:** `npm ci` fails with package-lock.json mismatch

**Solution:**

```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Regenerate
npm install

# Commit the updated package-lock.json
git add package-lock.json
git commit -m "Fix: Update package-lock.json"
git push
```

### Issue: Vercel deployment fails with environment variable errors

**Error:** "Missing required Firebase environment variables"

**Solution:**

1. Check all `NEXT_PUBLIC_FIREBASE_*` variables are set in Vercel
2. Ensure values match your `.env.local` (without the emulator flag)
3. Redeploy from Vercel dashboard

### Issue: Firebase deployment fails with authentication error

**Error:** "Could not authenticate with Firebase"

**Solution:**

1. Verify `FIREBASE_SERVICE_ACCOUNT` secret in GitHub contains valid JSON
2. Check the service account has necessary permissions:
   - **Cloud Datastore User** (for Firestore rules)
   - **Firebase Rules System** (for deploying rules)
3. Regenerate service account key if needed

### Issue: E2E tests fail in CI

**Error:** Playwright tests timeout or fail

**Solution:**

1. Check emulators started successfully (look for sleep timeout)
2. Increase sleep time in workflow if needed: `sleep 15`
3. Verify seed script runs without errors
4. Check Playwright configuration ports match emulator ports

### Issue: Husky pre-commit hook doesn't run

**Error:** Commits go through without linting

**Solution:**

```bash
# Ensure Husky is initialized
npm run prepare

# Make hook executable (Linux/Mac)
chmod +x .husky/pre-commit

# Verify hook exists
ls -la .husky/

# Test manually
npm exec lint-staged
```

### Issue: Branch protection not enforcing checks

**Error:** PRs can be merged even when checks fail

**Solution:**

1. Verify required status check names match exactly:
   - GitHub Actions job names: `Test & Build`, `E2E Tests`
2. Ensure "Require status checks to pass" is enabled
3. Check that status checks have run at least once (they won't appear in the list until they do)

---

## CI/CD Pipeline Overview

### Pipeline Flow

```mermaid
graph LR
    A[Push/PR] --> B[Test Job]
    B --> C{Main Branch?}
    C -->|Yes| D[E2E Job]
    C -->|No| E[Preview Deploy]
    D --> F[Deploy Job]
    F --> G[Vercel Deploy]
    F --> H[Firebase Deploy]
    G --> I[Production Live]
    H --> I
```

### Job Descriptions

**Test Job** (runs on all branches):

- ESLint code quality check
- Prettier formatting check
- TypeScript type checking
- Vitest unit tests
- Next.js production build

**E2E Job** (runs only on main):

- Start Firebase Emulators
- Seed test data
- Run Playwright E2E tests across 3 browsers

**Deploy Job** (runs only on main after tests pass):

- Deploy to Vercel production
- Deploy Firestore rules
- Deploy Firestore indexes

### Expected Times

- **Test Job:** ~2-3 minutes
- **E2E Job:** ~5-7 minutes (includes browser installation)
- **Deploy Job:** ~2-3 minutes

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments/overview)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)

---

## Support

For issues related to CI/CD setup, please refer to:

1. This documentation
2. GitHub Actions logs in the Actions tab
3. Vercel deployment logs in the Vercel dashboard
4. Firebase deployment logs in the Firebase Console
