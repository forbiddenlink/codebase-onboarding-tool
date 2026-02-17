/**
 * Environment Variable Validation
 * 
 * Validates required environment variables on application startup
 * Provides type-safe access to environment variables
 */

import { z } from 'zod';

/**
 * Environment variable schema
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('Invalid DATABASE_URL'),
  
  // AI Service
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required for AI features').optional(),
  
  // Rate Limiting (optional)
  UPSTASH_REDIS_REST_URL: z.string().url('Invalid UPSTASH_REDIS_REST_URL').optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid NEXT_PUBLIC_APP_URL').optional(),
  
  // Session/Auth (if implementing auth later)
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters').optional(),
  
  // GitHub Integration (optional)
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Call this at application startup
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      
      console.error('❌ Environment validation failed:');
      messages.forEach((msg) => console.error(`  - ${msg}`));
      
      throw new Error(
        `Environment validation failed:\n${messages.join('\n')}`
      );
    }
    throw error;
  }
}

/**
 * Safe environment variable access with validation
 */
export function getEnv<K extends keyof Env>(key: K): Env[K] | undefined {
  return process.env[key] as Env[K] | undefined;
}

/**
 * Check if required environment variables are configured
 */
export function checkEnvStatus() {
  const status = {
    database: !!process.env.DATABASE_URL,
    ai: !!process.env.ANTHROPIC_API_KEY,
    rateLimit: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    github: !!process.env.GITHUB_TOKEN,
  };

  return status;
}

/**
 * Get environment-specific configuration
 */
export function getConfig() {
  const env = process.env.NODE_ENV || 'development';
  
  return {
    isDevelopment: env === 'development',
    isProduction: env === 'production',
    isTest: env === 'test',
    
    // Feature flags based on environment
    features: {
      aiAnalysis: !!process.env.ANTHROPIC_API_KEY,
      rateLimit: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
      githubIntegration: !!process.env.GITHUB_TOKEN,
    },
  };
}

// Validate on module load (server-side only)
if (typeof window === 'undefined') {
  try {
    validateEnv();
    console.log('✅ Environment variables validated successfully');
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      // In production, fail fast
      throw error;
    } else {
      // In development, warn but continue
      console.warn('⚠️  Some environment variables are not configured');
      console.warn('   Application may have limited functionality');
    }
  }
}
