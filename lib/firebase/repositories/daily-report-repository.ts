import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  doc,
  getDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type {
  DailyReport,
  BarberRevenueBreakdown,
  ServiceLog,
  UserProfile,
} from '@/types/firestore'

/**
 * Generate a daily report for a specific date
 * @param date - The date to generate the report for
 * @returns The generated daily report data (not yet saved)
 */
export async function generateDailyReport(
  date: Date
): Promise<Omit<DailyReport, 'id' | 'createdAt'>> {
  // Set date to start and end of day for querying
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  // Query all approved service logs for this day
  const serviceLogsQuery = query(
    collection(db, 'serviceLogs'),
    where('status', '==', 'approved'),
    where('approvedAt', '>=', Timestamp.fromDate(startOfDay)),
    where('approvedAt', '<=', Timestamp.fromDate(endOfDay))
  )

  const serviceLogsSnapshot = await getDocs(serviceLogsQuery)
  const serviceLogs = serviceLogsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ServiceLog[]

  // If no services for the day, return empty report
  if (serviceLogs.length === 0) {
    return {
      date: Timestamp.fromDate(startOfDay),
      totalRevenue: 0,
      totalBarberCommissions: 0,
      profit: 0,
      managerCommission: 0,
      ownerCut: 0,
      barberBreakdown: [],
      approvedServiceCount: 0,
    }
  }

  // Calculate total revenue and total barber commissions
  let totalRevenue = 0
  let totalBarberCommissions = 0

  // Group by barber for breakdown
  const barberMap = new Map<
    string,
    {
      barberId: string
      barberName: string
      revenue: number
      commission: number
      serviceCount: number
    }
  >()

  // Fetch barber names
  const barberIds = [...new Set(serviceLogs.map((log) => log.barberId))]
  const barberNames = new Map<string, string>()

  for (const barberId of barberIds) {
    const barberDoc = await getDoc(doc(db, 'users', barberId))
    if (barberDoc.exists()) {
      const barberData = barberDoc.data() as UserProfile
      barberNames.set(barberId, barberData.username)
    }
  }

  // Process each service log
  for (const log of serviceLogs) {
    totalRevenue += log.price
    totalBarberCommissions += log.commissionAmount

    // Update barber breakdown
    const existing = barberMap.get(log.barberId)
    if (existing) {
      existing.revenue += log.price
      existing.commission += log.commissionAmount
      existing.serviceCount += 1
    } else {
      barberMap.set(log.barberId, {
        barberId: log.barberId,
        barberName: barberNames.get(log.barberId) || 'Unknown',
        revenue: log.price,
        commission: log.commissionAmount,
        serviceCount: 1,
      })
    }
  }

  // Calculate profit, manager commission, and owner cut
  const profit = totalRevenue - totalBarberCommissions
  const managerCommission = profit * 0.5
  const ownerCut = profit * 0.5

  // Convert barber map to array
  const barberBreakdown = Array.from(barberMap.values())

  return {
    date: Timestamp.fromDate(startOfDay),
    totalRevenue,
    totalBarberCommissions,
    profit,
    managerCommission,
    ownerCut,
    barberBreakdown,
    approvedServiceCount: serviceLogs.length,
  }
}

/**
 * Save a daily report to Firestore
 * @param reportData - The report data to save
 * @returns The saved daily report with ID
 */
export async function saveDailyReport(
  reportData: Omit<DailyReport, 'id' | 'createdAt'>
): Promise<DailyReport> {
  const docRef = await addDoc(collection(db, 'dailyReports'), {
    ...reportData,
    createdAt: Timestamp.now(),
  })

  return {
    id: docRef.id,
    ...reportData,
    createdAt: Timestamp.now(),
  }
}

/**
 * Get all daily reports, ordered by date descending
 * @returns Array of daily reports
 */
export async function getDailyReports(): Promise<DailyReport[]> {
  const reportsQuery = query(
    collection(db, 'dailyReports'),
    orderBy('date', 'desc')
  )

  const snapshot = await getDocs(reportsQuery)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as DailyReport[]
}

/**
 * Get a daily report for a specific date
 * @param date - The date to get the report for
 * @returns The daily report for that date, or null if not found
 */
export async function getDailyReportByDate(
  date: Date
): Promise<DailyReport | null> {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const reportsQuery = query(
    collection(db, 'dailyReports'),
    where('date', '>=', Timestamp.fromDate(startOfDay)),
    where('date', '<=', Timestamp.fromDate(endOfDay))
  )

  const snapshot = await getDocs(reportsQuery)

  if (snapshot.empty) {
    return null
  }

  const doc = snapshot.docs[0]
  if (!doc) {
    return null
  }
  return {
    id: doc.id,
    ...doc.data(),
  } as DailyReport
}

/**
 * Generate and save a daily report for a specific date
 * @param date - The date to generate and save the report for
 * @returns The saved daily report
 */
export async function generateAndSaveDailyReport(
  date: Date
): Promise<DailyReport> {
  const reportData = await generateDailyReport(date)
  return await saveDailyReport(reportData)
}
