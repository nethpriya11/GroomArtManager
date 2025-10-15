import { Timestamp } from 'firebase/firestore'

/**
 * User roles in the application
 */
export type UserRole = 'manager' | 'barber'

/**
 * Service log status
 */
export type ServiceLogStatus = 'pending' | 'approved' | 'rejected'

/**
 * User profile stored in Firestore users collection
 */
export interface UserProfile {
  id: string // Firebase Auth UID
  username: string // Display name
  email: string // User email address
  role: UserRole
  avatarUrl?: string | null // URL for the user's avatar image
  createdAt: Timestamp
}

/**
 * Service stored in Firestore services collection
 */
export interface Service {
  id: string
  name: string
  price: number // LKR (e.g., 1500.00)
  duration: number // Minutes
  commissionRate: number // 0.0 - 1.0 (e.g., 0.45 for 45%)
  createdAt: Timestamp
}

/**
 * Service log stored in Firestore serviceLogs collection
 */
export interface ServiceLog {
  id: string
  barberId: string // FK to users.id
  serviceId: string // FK to services.id
  price: number // Snapshot from service (can be edited)
  commissionRate: number // Snapshot from service
  commissionAmount: number // Calculated: price * commissionRate
  status: ServiceLogStatus
  createdAt: Timestamp
  approvedAt: Timestamp | null
  rejectedAt: Timestamp | null
}

/**
 * User profile creation data (without auto-generated fields)
 */
export type UserProfileCreate = Omit<UserProfile, 'id' | 'createdAt'>

/**
 * Service creation data (without auto-generated fields)
 */
export type ServiceCreate = Omit<Service, 'id' | 'createdAt'>

/**
 * Service log creation data (without auto-generated fields)
 */
export type ServiceLogCreate = Omit<
  ServiceLog,
  'id' | 'createdAt' | 'approvedAt' | 'rejectedAt'
>

/**
 * Populated service log with barber and service details
 */
export interface ServiceLogPopulated extends ServiceLog {
  barber: UserProfile
  service: Service
}

/**
 * Barber breakdown for daily report
 */
export interface BarberRevenueBreakdown {
  barberId: string
  barberName: string
  revenue: number // Total revenue from this barber's services
  commission: number // Total commission payout for this barber
  serviceCount: number // Number of services performed
}

/**
 * Daily report stored in Firestore dailyReports collection
 */
export interface DailyReport {
  id: string
  date: Timestamp // The date this report is for (start of day)
  totalRevenue: number // Sum of all service prices
  totalBarberCommissions: number // Sum of all barber commissions
  profit: number // totalRevenue - totalBarberCommissions
  managerCommission: number // 50% of profit
  ownerCut: number // 50% of profit
  barberBreakdown: BarberRevenueBreakdown[] // Revenue and commission per barber
  approvedServiceCount: number // Number of approved services for the day
  createdAt: Timestamp // When this report was generated
}
