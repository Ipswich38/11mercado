// Groq API service for AI features
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY =
  process.env.REACT_APP_GROQ_API_KEY || 'your-groq-api-key-here';

// Rate limiting
const API_RATE_LIMIT = 5000; // 5 seconds between requests
let lastRequestTime = 0;
const requestQueue = [];

const rateLimitedFetch = async (url, options) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < API_RATE_LIMIT) {
    await new Promise(resolve => setTimeout(resolve, API_RATE_LIMIT - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  return fetch(url, options);
};

// STEM-only system prompt for the AI assistant
const STEM_SYSTEM_PROMPT = `You are a specialized AI tutor for Grade 11 Filipino students, focused exclusively on STEM subjects. You MUST follow these strict guidelines:

SCOPE - Only respond to questions about:
- Physics (mechanics, waves, electricity, magnetism, thermodynamics)
- Chemistry (atomic structure, chemical bonding, reactions, organic chemistry) 
- Biology (cell biology, genetics, evolution, ecology, human anatomy)
- Mathematics (algebra, geometry, trigonometry, statistics, calculus)
- Earth Science (geology, meteorology, astronomy)
- General Science research methods and laboratory techniques

RESTRICTIONS - If asked about anything outside STEM:
- Politely decline: "I'm specifically designed to help with STEM subjects only. I can assist you with Physics, Chemistry, Biology, Mathematics, and Earth Science questions."
- Redirect to STEM topics: "Instead, would you like help with any science or math concepts?"

TEACHING STYLE:
- Use simple, clear explanations appropriate for Grade 11 level
- Provide step-by-step solutions for math problems
- Include real-world examples relevant to Filipino students
- Use metric units (SI system)
- Reference Philippine curriculum when applicable
- Encourage scientific thinking and curiosity

LANGUAGE:
- Primarily use English
- Include Filipino terms when helpful for understanding
- Use examples familiar to Filipino students (local animals, geography, etc.)

Remember: You are an educational tool to help students LEARN, not to give direct answers for assignments. Guide them to understand concepts.`;

// UPCAT-style quiz system prompt
const UPCAT_QUIZ_PROMPT = `You are a quiz generator for Filipino students preparing for college entrance examinations. Generate practice questions in the style of Philippine college entrance exams, particularly UPCAT format.

SUBJECTS to cover:
- Mathematics (Algebra, Geometry, Trigonometry, Statistics)
- Science (Physics, Chemistry, Biology, Earth Science)
- English (Reading Comprehension, Grammar, Vocabulary)
- Abstract Reasoning (Pattern Recognition, Logical Sequences)

QUESTION FORMAT:
- Multiple choice with 4 options (A, B, C, D)
- Appropriate difficulty for Grade 11-12 students
- Include brief explanations for correct answers
- Questions should test understanding, not just memorization

FILIPINO CONTEXT:
- Use examples familiar to Filipino students
- Reference Philippine geography, culture when relevant
- Use metric units for science questions
- English questions should reflect Philippine English usage

Generate questions that help students practice critical thinking and problem-solving skills needed for college entrance exams.`;

export const callGroqSTEMAssistant = async (
  message,
  conversationHistory = [],
) => {
  try {
    // Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new Error('Invalid message input');
    }

    if (message.length > 2000) {
      throw new Error('Message too long. Please keep it under 2000 characters.');
    }

    const messages = [
      { role: 'system', content: STEM_SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Limit history to last 10 messages
      { role: 'user', content: message.trim() },
    ];

    const response = await rateLimitedFetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Fast and good for educational content
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from Groq API');
    }

    return {
      success: true,
      message: data.choices[0].message.content,
      usage: data.usage,
    };
  } catch (error) {
    console.error('Groq STEM Assistant error:', error);
    return {
      success: false,
      message:
        error.message.includes('too long') 
          ? error.message
          : "I'm having trouble connecting right now. Please try again in a moment. In the meantime, feel free to ask me about Physics, Chemistry, Biology, or Mathematics!",
      error: error.message,
    };
  }
};

export const generateUPCATQuiz = async (
  subject,
  questionCount = 5,
  difficulty = 'medium',
) => {
  try {
    // Input validation
    if (!subject || typeof subject !== 'string') {
      throw new Error('Invalid subject');
    }

    if (questionCount < 1 || questionCount > 10) {
      throw new Error('Question count must be between 1 and 10');
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      difficulty = 'medium';
    }

    const prompt = `${UPCAT_QUIZ_PROMPT}\n\nGenerate ${questionCount} multiple-choice questions for: ${subject}\nDifficulty level: ${difficulty}\nFormat each question as JSON with this structure:\n{\n  "question": "Question text",\n  "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],\n  "correct": 0,\n  "explanation": "Brief explanation of correct answer",\n  "topic": "Specific topic/concept"\n}\n\nReturn an array of ${questionCount} questions in valid JSON format.`;

    const response = await rateLimitedFetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8, // Higher for more variety in questions
        max_tokens: 2048,
        top_p: 1,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from Groq API');
    }

    const responseText = data.choices[0].message.content;

    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      // Validate questions format
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('No valid questions generated');
      }

      return {
        success: true,
        questions: questions.slice(0, questionCount), // Ensure we don't exceed requested count
        usage: data.usage,
      };
    } catch (parseError) {
      // Fallback: return sample questions if JSON parsing fails
      return {
        success: true,
        questions: getSampleQuestions(subject, questionCount),
        fallback: true,
      };
    }
  } catch (error) {
    console.error('Groq Quiz Generator error:', error);
    return {
      success: false,
      questions: getSampleQuestions(subject, questionCount),
      error: error.message,
    };
  }
};

// Fallback sample questions for each subject
const getSampleQuestions = (subject, count) => {
  const questionBanks = {
    Mathematics: [
      {
        question: 'If f(x) = 2x² + 3x - 1, what is f(2)?',
        options: ['A) 11', 'B) 13', 'C) 15', 'D) 17'],
        correct: 1,
        explanation: 'f(2) = 2(2)² + 3(2) - 1 = 8 + 6 - 1 = 13',
        topic: 'Functions',
      },
      {
        question:
          'What is the slope of the line passing through points (2, 3) and (4, 7)?',
        options: ['A) 1', 'B) 2', 'C) 3', 'D) 4'],
        correct: 1,
        explanation: 'Slope = (y₂ - y₁)/(x₂ - x₁) = (7-3)/(4-2) = 4/2 = 2',
        topic: 'Coordinate Geometry',
      },
    ],
    Science: [
      {
        question:
          'Which law states that energy cannot be created or destroyed?',
        options: [
          "A) Newton's First Law",
          'B) Law of Conservation of Energy',
          "C) Ohm's Law",
          "D) Boyle's Law",
        ],
        correct: 1,
        explanation:
          'The Law of Conservation of Energy states that energy can only be transformed from one form to another, never created or destroyed.',
        topic: 'Physics - Energy',
      },
      {
        question: 'What is the pH of pure water at 25°C?',
        options: ['A) 0', 'B) 7', 'C) 14', 'D) 1'],
        correct: 1,
        explanation:
          'Pure water at 25°C has a pH of 7, which is neutral (neither acidic nor basic).',
        topic: 'Chemistry - Acids and Bases',
      },
    ],
    English: [
      {
        question:
          "Choose the word that best completes the sentence: 'The scientist's research was so _____ that it revolutionized the field.'",
        options: [
          'A) trivial',
          'B) groundbreaking',
          'C) ordinary',
          'D) confusing',
        ],
        correct: 1,
        explanation:
          'Groundbreaking means innovative or pioneering, which fits the context of revolutionary research.',
        topic: 'Vocabulary',
      },
    ],
    'Abstract Reasoning': [
      {
        question: 'In the sequence 2, 4, 8, 16, ?, what is the next number?',
        options: ['A) 20', 'B) 24', 'C) 32', 'D) 18'],
        correct: 2,
        explanation: 'Each number is doubled: 2×2=4, 4×2=8, 8×2=16, 16×2=32',
        topic: 'Number Patterns',
      },
    ],
  };

  const questions = questionBanks[subject] || questionBanks.Mathematics;
  return questions.slice(0, count);
};

export const validateGroqApiKey = async () => {
  try {
    if (GROQ_API_KEY === 'your-groq-api-key-here') {
      return false;
    }

    const response = await rateLimitedFetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 10,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
};

// Utility function to check if API key is configured
export const isGroqApiKeyConfigured = () => {
  return GROQ_API_KEY && GROQ_API_KEY !== 'your-groq-api-key-here';
};
