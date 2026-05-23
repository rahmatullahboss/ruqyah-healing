import { z } from 'zod';

/**
 * Schema for required environment variables.
 * Validates at first access to give clear error messages.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters for security'),
  GOOGLE_CLIENT_ID: z.string().optional(),
});

let validated = false;

/**
 * Validate critical environment variables.
 * Call this early in request processing to fail fast with clear messages.
 * @param {Record<string, string>} env
 * @returns {{ valid: boolean, errors?: string[] }}
 */
export function validateEnv(env) {
  if (validated) return { valid: true };

  const result = envSchema.safeParse(env);

  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    );
    // Only log once to avoid spam during prerendering
    if (!validateEnv._logged) {
      console.error('[ENV] Missing or invalid environment variables:', errors);
      validateEnv._logged = true;
    }
    return { valid: false, errors };
  }

  validated = true;
  return { valid: true };
}
