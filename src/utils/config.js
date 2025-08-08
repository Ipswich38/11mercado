export const constants = {
  APP_NAME: '11Mercado',
  THEME_STORAGE_KEY: '11mercado-theme',
  AUTH_STORAGE_KEY: '11mercado-auth',
  SESSION_STORAGE_KEY: '11mercado-session',
};

// Security configuration
export const security = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  MAX_API_REQUESTS: 100,
  PASSWORD_MIN_LENGTH: 8,
  SESSION_TOKEN_LENGTH: 32,
};

// API configuration with security settings
export const api = {
  GROQ_BASE_URL: 'https://api.groq.com/openai/v1/chat/completions',
  WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  REQUEST_TIMEOUT: 10000, // 10 seconds
  MAX_RETRIES: 3,
  ALLOWED_ORIGINS: [
    'https://api.groq.com',
    'https://api.openweathermap.org',
    'https://forms.gle'
  ]
};

// Content validation rules
export const validation = {
  MAX_MESSAGE_LENGTH: 2000,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 320,
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};
