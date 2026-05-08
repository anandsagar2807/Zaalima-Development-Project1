// API Client Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  TIMEOUT: 30000,
  WITH_CREDENTIALS: true,
};

// App Configuration
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'GitGuard AI',
  ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development',
};
