#!/usr/bin/env ts-node

/**
 * Development seed script for Firebase Emulator
 *
 * Creates test data:
 * - 1 Manager user
 * - 3 Barber users with varying commission rates
 * - 5 Services
 *
 * Usage: npm run seed:dev
 * Note: Requires Firebase Emulator to be running
 */

import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK for emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081'
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'

const app = initializeApp({
  projectId: 'salonflow-prod',
})

const auth = getAuth(app)
const db = getFirestore(app)

interface UserData {
  email: string
  password: string
  username: string
  role: 'manager' | 'barber'
}

interface ServiceData {
  name: string
  price: number
  duration: number
  commissionRate: number
}

const users: UserData[] = [
  {
    email: 'manager@salonflow.com',
    password: 'manager123',
    username: 'Manager',
    role: 'manager',
  },
  {
    email: 'barber1@salonflow.com',
    password: 'barber123',
    username: 'Alex Johnson',
    role: 'barber',
  },
  {
    email: 'barber2@salonflow.com',
    password: 'barber123',
    username: 'Maria Garcia',
    role: 'barber',
  },
  {
    email: 'barber3@salonflow.com',
    password: 'barber123',
    username: 'James Smith',
    role: 'barber',
  },
]

const services: ServiceData[] = [
  {
    name: 'Haircut',
    price: 1500.0,
    duration: 30,
    commissionRate: 0.45, // 45%
  },
  {
    name: 'Beard Trim',
    price: 800.0,
    duration: 15,
    commissionRate: 0.4, // 40%
  },
  {
    name: 'Shave',
    price: 1000.0,
    duration: 20,
    commissionRate: 0.4, // 40%
  },
  {
    name: 'Hair Color',
    price: 5000.0,
    duration: 90,
    commissionRate: 0.5, // 50%
  },
  {
    name: 'Kids Cut',
    price: 1200.0,
    duration: 20,
    commissionRate: 0.4, // 40%
  },
]

async function seedUsers() {
  console.log('📝 Seeding users...')

  for (const userData of users) {
    try {
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.username,
      })

      // Set custom claims for role-based access control
      await auth.setCustomUserClaims(userRecord.uid, {
        role: userData.role,
      })

      // Create user profile in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        id: userRecord.uid,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        createdAt: Timestamp.now(),
      })

      console.log(
        `  ✓ Created ${userData.role}: ${userData.username} (${userData.email})`
      )
    } catch (error) {
      if ((error as any).code === 'auth/email-already-exists') {
        console.log(`  ⊘ User already exists: ${userData.email}`)
      } else {
        console.error(`  ✗ Error creating user ${userData.email}:`, error)
      }
    }
  }
}

async function seedServices() {
  console.log('\n💇 Seeding services...')

  for (const serviceData of services) {
    try {
      const serviceRef = await db.collection('services').add({
        name: serviceData.name,
        price: serviceData.price,
        duration: serviceData.duration,
        commissionRate: serviceData.commissionRate,
        createdAt: Timestamp.now(),
      })

      // Update document with its own ID
      await serviceRef.update({
        id: serviceRef.id,
      })

      console.log(
        `  ✓ Created service: ${serviceData.name} (LKR ${serviceData.price.toLocaleString()}, ${serviceData.duration}min, ${(serviceData.commissionRate * 100).toFixed(0)}% commission)`
      )
    } catch (error) {
      console.error(`  ✗ Error creating service ${serviceData.name}:`, error)
    }
  }
}

async function clearCollections() {
  console.log('🗑️  Clearing existing data...')

  const collections = ['users', 'services', 'serviceLogs']

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get()
    const batch = db.batch()

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()
    console.log(`  ✓ Cleared ${collectionName} collection`)
  }

  // Delete all Auth users
  try {
    const listUsersResult = await auth.listUsers()
    for (const userRecord of listUsersResult.users) {
      await auth.deleteUser(userRecord.uid)
    }
    console.log(`  ✓ Cleared all Auth users`)
  } catch (error) {
    console.error(`  ✗ Error clearing Auth users:`, error)
  }
}

async function main() {
  console.log('🌱 Starting seed script for Firebase Emulator...\n')

  try {
    // Clear existing data
    await clearCollections()

    // Seed new data
    await seedUsers()
    await seedServices()

    console.log('\n✅ Seed script completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`  - ${users.length} users created`)
    console.log(`  - ${services.length} services created`)
    console.log('\n💡 Login credentials:')
    console.log('  Manager: manager@salonflow.com / manager123')
    console.log('  Barber 1: barber1@salonflow.com / barber123')
    console.log('  Barber 2: barber2@salonflow.com / barber123')
    console.log('  Barber 3: barber3@salonflow.com / barber123')
  } catch (error) {
    console.error('\n❌ Seed script failed:', error)
    process.exit(1)
  }

  process.exit(0)
}

main()
