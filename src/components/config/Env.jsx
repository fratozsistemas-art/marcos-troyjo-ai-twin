/**
 * Environment Variables Validation
 * 
 * Validates required environment variables at app startup
 */

const REQUIRED_ENV_VARS = [
  'VITE_BASE44_APP_ID',
  'VITE_BASE44_PROJECT_URL',
];

export function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter(
    varName => !import.meta.env[varName]
  );
  
  if (missing.length > 0) {
    const errorMsg = `Missing required environment variables: ${missing.join(', ')}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}

export function getEnv(key, defaultValue = null) {
  return import.meta.env[key] ?? defaultValue;
}

export function isDevelopment() {
  return import.meta.env.DEV;
}

export function isProduction() {
  return import.meta.env.PROD;
}

export const config = {
  app: {
    id: getEnv('VITE_BASE44_APP_ID'),
    projectUrl: getEnv('VITE_BASE44_PROJECT_URL'),
  },
  storage: {
    baseUrl: getEnv('VITE_STORAGE_URL'),
  },
  stripe: {
    publishableKey: getEnv('VITE_STRIPE_PUBLISHABLE_KEY'),
  },
};