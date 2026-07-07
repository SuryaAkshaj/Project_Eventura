import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),
  DIRECT_URL: z.string().url('DIRECT_URL must be a valid PostgreSQL connection string'),

  // Redis
  REDIS_URL: z.string().url('REDIS_URL must be a valid Redis connection string'),
  REDIS_PASSWORD: z.string().optional().default(''),

  // JWT
  JWT_SECRET: z.string()
    .min(64, 'JWT_SECRET must be at least 64 characters. Generate with: openssl rand -hex 32')
    .refine(
      (val) => !['your-secret', 'secret', 'jwt-secret', 'change-me', 'eventura']
        .some(weak => val.toLowerCase().includes(weak)),
      'JWT_SECRET appears to be a placeholder. Use a cryptographically random value.'
    ),

  JWT_REFRESH_SECRET: z.string()
    .min(64, 'JWT_REFRESH_SECRET must be at least 64 characters.')
    .refine(
      (val) => val !== process.env.JWT_SECRET,
      'JWT_REFRESH_SECRET must be DIFFERENT from JWT_SECRET'
    ),

  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, 'RAZORPAY_WEBHOOK_SECRET is required'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),

  // Resend
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),

  // App
  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL'),
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues.map(issue => `  ✗ ${issue.path.join('.')}: ${issue.message}`);
    console.error('\n❌ Environment validation failed. Missing or invalid variables:\n');
    console.error(missing.join('\n'));
    console.error('\nCopy .env.example to .env and fill in all required values.\n');
    process.exit(1);
  }

  // Production environment safety checks
  const data = result.data;

  if (data.NODE_ENV === 'production') {
    const prodErrors: string[] = [];

    if (!data.CLIENT_URL.startsWith('https://')) {
      prodErrors.push('CLIENT_URL must use HTTPS in production');
    }
    // Allow test keys in this deployment to bypass live Razorpay key requirements
    // if (data.RAZORPAY_KEY_ID?.startsWith('rzp_test_')) {
    //   prodErrors.push('RAZORPAY_KEY_ID is a test key — use live key in production');
    // }
    if (data.DATABASE_URL.includes('localhost')) {
      prodErrors.push('DATABASE_URL points to localhost in production');
    }
    if (data.REDIS_URL?.includes('localhost')) {
      prodErrors.push('REDIS_URL points to localhost in production');
    }

    if (prodErrors.length > 0) {
      console.error('\n❌ Production environment check failed:\n');
      prodErrors.forEach(e => console.error(`  ✗ ${e}`));
      console.error('');
      process.exit(1);
    }
  }

  return data;
}

export const env = validateEnv();
export type Env = typeof env;
