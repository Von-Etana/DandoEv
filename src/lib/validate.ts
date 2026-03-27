// ============================================================
// Input Validation — Zod Wrapper (Zod v4 compatible)
// ============================================================
import { z } from 'zod';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: { field: string; message: string }[];
}

/**
 * Validate a request body against a Zod schema.
 * Returns parsed data on success, or structured field-level errors on failure.
 */
export function validateRequest<T>(schema: z.ZodType<T>, body: unknown): ValidationResult<T> {
  const result = schema.safeParse(body);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Zod v4 uses result.error.issues for structured errors
  const errors = result.error.issues.map((issue: any) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

  return { success: false, errors };
}

/**
 * Sanitize a string by trimming whitespace and removing HTML tags.
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitize all string values in an object (shallow).
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    if (typeof sanitized[key] === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeString(sanitized[key] as string);
    }
  }
  return sanitized;
}
