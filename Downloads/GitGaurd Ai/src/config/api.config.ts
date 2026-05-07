// API Client Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  TIMEOUT: 30000,
  WITH_CREDENTIALS: true,
};

// App Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'GitGuard AI',
  ENV: import.meta.env.VITE_APP_ENV || 'development',
};
