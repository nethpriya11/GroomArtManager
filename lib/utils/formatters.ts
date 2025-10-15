/**
 * Formatting utilities for consistent display across the application
 */

/**
 * Format a number as Sri Lankan Rupees currency
 *
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "LKR 1,500.00")
 *
 * @example
 * ```ts
 * formatCurrency(1500) // "LKR 1,500.00"
 * formatCurrency(250.50) // "LKR 250.50"
 * formatCurrency(0) // "LKR 0.00"
 * ```
 */
export function formatCurrency(amount: number): string {
  return `LKR ${amount.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format a date to a readable string
 *
 * @param date - The date to format (Firestore Timestamp or Date)
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * formatDate(new Date()) // "Jan 15, 2024"
 * ```
 */
export function formatDate(date: Date | { toDate: () => Date }): string {
  const dateObj = date instanceof Date ? date : date.toDate()

  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a date to include time
 *
 * @param date - The date to format (Firestore Timestamp or Date)
 * @returns Formatted date and time string
 *
 * @example
 * ```ts
 * formatDateTime(new Date()) // "Jan 15, 2024 at 2:30 PM"
 * ```
 */
export function formatDateTime(date: Date | { toDate: () => Date }): string {
  const dateObj = date instanceof Date ? date : date.toDate()

  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format a percentage
 *
 * @param value - The decimal value (e.g., 0.4 for 40%)
 * @returns Formatted percentage string (e.g., "40%")
 *
 * @example
 * ```ts
 * formatPercentage(0.4) // "40%"
 * formatPercentage(0.45) // "45%"
 * ```
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(0)}%`
}
