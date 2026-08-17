// lib/env.ts
import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  EMAIL_FROM_ADDRESS: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  UPLOADTHING_TOKEN: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_URL: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default('/account'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default('/account'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL: z.string().default('/'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required'),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

const isServer = typeof window === 'undefined';

const clientEnvValues: Record<keyof ClientEnv, string | undefined> = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
};

function formatErrors(errors: Record<string, string[] | undefined>): string {
  return Object.entries(errors)
    .map(([name, errs]) => `  ❌ ${name}: ${errs?.join(', ')}`)
    .join('\n');
}

// 1. Validate Client Environment (Available everywhere)
const parsedClient = clientSchema.safeParse(clientEnvValues);

if (!parsedClient.success) {
  const errorMsg = `\n[ENV ERROR] Invalid Client Environment Variables:\n${formatErrors(
    parsedClient.error.flatten().fieldErrors
  )}\n`;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// 2. Validate Server Environment (Node.js runtime only)
let serverEnvData: ServerEnv = {} as ServerEnv;

if (isServer) {
  const parsedServer = serverSchema.safeParse(process.env);

  if (!parsedServer.success) {
    const errorMsg = `\n[ENV ERROR] Invalid Server Environment Variables:\n${formatErrors(
      parsedServer.error.flatten().fieldErrors
    )}\n`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  serverEnvData = parsedServer.data;
}

/**
 * Validated, strictly-typed environment configuration.
 * Prevents client-side exposure of server secrets through a runtime Proxy.
 */
export const env = new Proxy(
  {
    ...parsedClient.data,
    ...serverEnvData,
  } as ServerEnv & ClientEnv,
  {
    get(target, prop: string) {
      if (!isServer && !prop.startsWith('NEXT_PUBLIC_')) {
        throw new Error(
          `[SECURITY VIOLATION] Attempted to access server-only environment variable "${prop}" in a browser environment.`
        );
      }
      return target[prop as keyof (ServerEnv & ClientEnv)];
    },
  }
);