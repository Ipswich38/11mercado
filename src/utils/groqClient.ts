import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || 'your-groq-api-key-here',
  dangerouslyAllowBrowser: true // Allow client-side usage
});

export default groq;