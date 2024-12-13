export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET,
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_EXPIRES_IN: 7
};

export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES: 5
};

export const EMAIL_CONFIG = {
  FROM: process.env.EMAIL_FROM,
  TEMPLATES: {
    WELCOME: 'welcome',
    PASSWORD_RESET: 'password-reset',
    ORDER_CONFIRMATION: 'order-confirmation'
  }
};

export const CORS_OPTIONS = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
};