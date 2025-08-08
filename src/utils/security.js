// Security utilities for the 11Mercado platform

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets to prevent XSS
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 2000); // Limit length to prevent DoS
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 320; // RFC 5321 limit
};

// Validate access code format
export const validateAccessCode = (code) => {
  if (typeof code !== 'string') return false;
  
  // Only allow alphanumeric characters and specific length
  const codeRegex = /^[A-Z0-9]{8,15}$/;
  return codeRegex.test(code);
};

// Generate secure session token
export const generateSessionToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Validate session data
export const validateSession = (session) => {
  if (!session || typeof session !== 'object') return false;
  
  const requiredFields = ['userId', 'lastActivity', 'sessionToken'];
  return requiredFields.every(field => 
    session.hasOwnProperty(field) && session[field] !== null && session[field] !== undefined
  );
};

// Check if timestamp is valid and not too far in future/past
export const isValidTimestamp = (timestamp) => {
  if (typeof timestamp !== 'number') return false;
  
  const now = Date.now();
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const oneHourFromNow = now + (60 * 60 * 1000);
  
  return timestamp >= oneWeekAgo && timestamp <= oneHourFromNow;
};

// Rate limiting helper
export const createRateLimiter = (maxRequests, timeWindow) => {
  const requests = new Map();
  
  return (identifier) => {
    const now = Date.now();
    const windowStart = now - timeWindow;
    
    if (!requests.has(identifier)) {
      requests.set(identifier, []);
    }
    
    const userRequests = requests.get(identifier);
    
    // Remove old requests outside the time window
    while (userRequests.length > 0 && userRequests[0] < windowStart) {
      userRequests.shift();
    }
    
    // Check if user has exceeded rate limit
    if (userRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    userRequests.push(now);
    return true;
  };
};

// Content Security Policy headers for enhanced security
export const getSecurityHeaders = () => {
  return {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.groq.com https://api.openweathermap.org https://forms.gle;",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
};

// Validate URL to prevent open redirects
export const isValidUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow specific protocols
    const allowedProtocols = ['https:', 'http:'];
    if (!allowedProtocols.includes(parsedUrl.protocol)) return false;
    
    // Only allow specific domains for external links
    const allowedDomains = [
      'forms.gle',
      'api.groq.com',
      'api.openweathermap.org',
      'console.groq.com',
      'openweathermap.org'
    ];
    
    return allowedDomains.some(domain => parsedUrl.hostname.endsWith(domain));
  } catch {
    return false;
  }
};

// Secure local storage wrapper
export const secureStorage = {
  setItem: (key, value) => {
    try {
      const timestamp = Date.now();
      const data = JSON.stringify({ value, timestamp });
      localStorage.setItem(key, data);
    } catch (error) {
      console.error('Failed to save to secure storage:', error);
    }
  },
  
  getItem: (key, maxAge = 24 * 60 * 60 * 1000) => { // Default 24 hours
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      
      const { value, timestamp } = JSON.parse(stored);
      
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(key);
        return null;
      }
      
      return value;
    } catch (error) {
      console.error('Failed to read from secure storage:', error);
      localStorage.removeItem(key); // Remove corrupted data
      return null;
    }
  },
  
  removeItem: (key) => {
    localStorage.removeItem(key);
  }
};