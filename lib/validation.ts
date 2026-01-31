import { z } from 'zod'

/**
 * Validation schemas using Zod for type-safe validation
 */
export const leadSubmissionSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  website: z
    .string()
    .url('Invalid website URL format')
    .optional()
    .or(z.literal('')),
})

export type LeadSubmissionInput = z.infer<typeof leadSubmissionSchema>

/**
 * Validates email format using regex
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
