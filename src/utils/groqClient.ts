import Groq from 'groq-sdk';

// Check if API key is properly configured
const apiKey = import.meta.env.VITE_GROQ_API_KEY;
const isGroqConfigured = apiKey && apiKey !== 'your-groq-api-key-here';

let groq = null;

if (isGroqConfigured) {
  try {
    groq = new Groq({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Allow client-side usage
    });
  } catch (error) {
    console.warn('Groq client initialization failed:', error);
    groq = null;
  }
} else {
  console.warn('Groq API key not configured. AI features will be disabled.');
}

export default groq;
export { isGroqConfigured };