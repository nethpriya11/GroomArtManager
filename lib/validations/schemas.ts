import { z } from 'zod'

/**
 * Zod validation schemas for Firestore documents and forms
 *
 * These schemas provide runtime validation for:
 * - Form inputs (React Hook Form integration)
 * - API responses
 * - Data transformations
 */

// ============================================================================
// User Profile Schemas
// ============================================================================

/**
 * Schema for full user profile (matches UserProfile interface)
 */
export const userProfileSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  username: z.string().min(1, 'Username is required'),
  role: z.enum(['manager', 'barber'], {
    message: 'Role must be manager or barber',
  }),
  createdAt: z.date(),
})

/**
 * Schema for updating user profile (partial updates)
 */
export const updateUserProfileSchema = userProfileSchema.partial().omit({
  id: true,
  createdAt: true,
})

// ============================================================================
// Service Schemas
// ============================================================================

/**
 * Schema for creating a new service (form validation)
 */
export const createServiceSchema = z.object({
  name: z
    .string()
    .min(1, 'Service name is required')
    .max(100, 'Service name is too long'),
  price: z
    .number()
    .min(0, 'Price must be positive')
    .max(100000, 'Price is too high'),
  duration: z
    .number()
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 minute')
    .max(480, 'Duration must be less than 8 hours'),
  commissionRate: z
    .number()
    .min(0, 'Commission rate must be at least 0%')
    .max(1, 'Commission rate must be at most 100%'),
})

/**
 * Schema for updating a service (partial updates)
 */
export const updateServiceSchema = createServiceSchema.partial()

/**
 * Schema for full service document (matches Service interface)
 */
export const serviceSchema = createServiceSchema.extend({
  id: z.string(),
  createdAt: z.date(),
})

// ============================================================================
// Service Log Schemas
// ============================================================================

/**
 * Schema for creating a service log (form validation)
 */
export const createServiceLogSchema = z.object({
  barberId: z.string().min(1, 'Barber is required'),
  serviceId: z.string().min(1, 'Service is required'),
  price: z.number().min(0, 'Price must be positive'),
  commissionRate: z
    .number()
    .min(0, 'Commission rate must be at least 0')
    .max(1, 'Commission rate must be at most 1'),
  commissionAmount: z.number().min(0, 'Commission amount must be positive'),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
})

/**
 * Schema for full service log document (matches ServiceLog interface)
 */
export const serviceLogSchema = createServiceLogSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  approvedAt: z.date().nullable(),
  rejectedAt: z.date().nullable(),
})

/**
 * Schema for updating service log status
 */
export const updateServiceLogStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
})

// ============================================================================
// Form-Specific Schemas
// ============================================================================

/**
 * Schema for base barber properties
 */
export const baseBarberSchema = z.object({
  username: z.string().min(1, 'Username is required'),
})

/**
 * Schema for creating a new barber (form validation)
 */
export const createBarberSchema = baseBarberSchema.extend({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  commissionRate: z
    .number()
    .min(0, 'Commission rate must be at least 0%')
    .max(1, 'Commission rate must be at most 100%'),
})

/**
 * Schema for updating barber (partial updates)
 */
export const updateBarberSchema = baseBarberSchema.partial().extend({
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .optional()
    .or(z.literal('')),
})

/**
 * Schema for login form
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

/**
 * Schema for date range filter
 */
export const dateRangeSchema = z
  .object({
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  })

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
export type CreateServiceLogInput = z.infer<typeof createServiceLogSchema>
export type UpdateServiceLogStatusInput = z.infer<
  typeof updateServiceLogStatusSchema
>
export type CreateBarberInput = z.infer<typeof createBarberSchema>
export type UpdateBarberInput = z.infer<typeof updateBarberSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type DateRangeInput = z.infer<typeof dateRangeSchema>
