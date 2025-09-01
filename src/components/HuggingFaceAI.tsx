import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, BookOpen, X, Menu, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import groq, { isGroqConfigured } from '../utils/groqClient';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function HuggingFaceAI({ getContrastClass, onClose }) {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m Research and STEM-GPT v3.0, your advanced AI assistant for STEM subjects and research methodology. I can help you with mathematics, science, engineering, technology, and research methods with enhanced capabilities including deeper analysis, interdisciplinary connections, and practical applications.\n\nWhat would you like to explore today?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResourcePanel, setShowResourcePanel] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    mathematics: false,
    science: false,
    technology: false,
    research: false,
    engineering: false
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatAIResponse = (text) => {
    if (!text || typeof text !== 'string') return '';

    let cleaned = text
      .replace(/\*{3,}/g, '*')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/#{2,}/g, '#')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/_{3,}/g, '_')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    const lines = cleaned.split('\n');
    const processedLines = lines.map(line => {
      if (line.trim() === '') return '';
      return line.replace(/\s+/g, ' ').trim();
    });

    const formattedLines = [];
    let inCodeBlock = false;
    
    for (let i = 0; i < processedLines.length; i++) {
      const line = processedLines[i];
      const nextLine = processedLines[i + 1];
      
      if (line.includes('```')) {
        inCodeBlock = !inCodeBlock;
        formattedLines.push(line);
        continue;
      }
      
      if (inCodeBlock) {
        formattedLines.push(line);
        continue;
      }
      
      if (/^\d+\.\s/.test(line)) {
        formattedLines.push(line);
        continue;
      }
      
      if (/^[-*+•]\s/.test(line)) {
        formattedLines.push(line);
        continue;
      }
      
      if (line.endsWith(':') && nextLine && !nextLine.startsWith(' ') && nextLine.trim() !== '') {
        formattedLines.push(line);
        continue;
      }
      
      if (line !== '' && 
          formattedLines.length > 0 && 
          /^\d+\.$/.test(formattedLines[formattedLines.length - 1])) {
        formattedLines[formattedLines.length - 1] += ' ' + line;
        continue;
      }
      
      formattedLines.push(line);
    }
    
    const result = formattedLines
      .reduce((acc, line, index) => {
        if (line === '' && acc[acc.length - 1] === '') {
          return acc;
        }
        acc.push(line);
        return acc;
      }, [])
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return result;
  };

  const handleSubmit = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      let aiResponse = '';
      
      // Debug logging for production
      console.log('API Debug Info:', {
        hasGroqClient: !!groq,
        isConfigured: isGroqConfigured,
        apiKeyExists: !!import.meta.env.VITE_GROQ_API_KEY,
        apiKeyLength: import.meta.env.VITE_GROQ_API_KEY?.length || 0,
        env: import.meta.env.MODE
      });
      
      if (groq && isGroqConfigured) {
        const isSimpleGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|thanks|thank you|bye|goodbye)$/i.test(currentInput.trim());
        
        let systemPrompt = '';
        let temperature = 0.3;
        let maxTokens = 1200;

        if (isSimpleGreeting) {
          systemPrompt = 'You are Research and STEM-GPT v3.0, a friendly AI assistant specializing in STEM education. For simple greetings, respond naturally and warmly while mentioning your expertise in STEM subjects. Keep responses conversational and brief.';
          temperature = 0.7;
          maxTokens = 150;
        } else {
          systemPrompt = 'You are Research and STEM-GPT v3.0, an advanced educational AI assistant. Provide comprehensive, insightful explanations about STEM topics and research methodology. Focus on helping students develop critical thinking and connect theoretical concepts to real-world applications. Write in clean, engaging paragraphs with clear structure and practical examples.';
          temperature = 0.2;
          maxTokens = 1500;
        }

        console.log('🔄 Making Groq API request with:', {
          model: 'llama3-8b-8192',
          temperature,
          maxTokens,
          messagesCount: 2
        });

        const response = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: currentInput }
          ],
          model: 'llama3-8b-8192', // Changed to smaller, more reliable model
          temperature: temperature,
          max_tokens: maxTokens
        });

        aiResponse = response.choices[0]?.message?.content || '';
        console.log('✅ Groq API Success:', { responseLength: aiResponse.length });
      } else {
        console.error('❌ Groq client not configured:', { groq: !!groq, isConfigured: isGroqConfigured });
        aiResponse = "I'm not properly configured right now. Please check back later for STEM education assistance!";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: formatAIResponse(aiResponse),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('🚨 Groq API Error Details:', {
        error: error,
        message: error?.message,
        status: error?.status,
        name: error?.name,
        stack: error?.stack?.substring(0, 200)
      });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m experiencing some technical difficulties right now. Please try again in a moment, or feel free to ask your question in a different way.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const ResourcePanel = () => (
    <div className={`fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out ${
      showResourcePanel ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className={getContrastClass(
        "h-full bg-gradient-to-br from-white/85 via-blue-50/80 to-purple-50/85 backdrop-blur-xl border-l border-blue-200 shadow-2xl",
        "h-full bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl border-l-2 border-yellow-400 shadow-2xl"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={getContrastClass(
            "text-lg font-semibold text-gray-900",
            "text-lg font-semibold text-yellow-400"
          )}>
            📚 Resource Links
          </h3>
          <button
            onClick={() => setShowResourcePanel(false)}
            className={getContrastClass(
              "p-2 rounded-lg text-gray-500 hover:bg-gray-100",
              "p-2 rounded-lg text-yellow-400 hover:bg-gray-800"
            )}
          >
            <X size={18} />
          </button>
        </div>
        
        <div 
          className="p-4 space-y-6 overflow-y-auto scrollbar-hide"
          style={{
            height: 'calc(100vh - 80px)',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {/* Mathematics */}
          <div className={getContrastClass(
            "bg-white/60 rounded-xl border border-gray-200",
            "bg-gray-800/60 rounded-xl border border-yellow-400/50"
          )}>
            <button
              onClick={() => toggleCategory('mathematics')}
              className={getContrastClass(
                "w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-xl transition-colors",
                "w-full flex items-center justify-between p-4 text-left hover:bg-gray-700 rounded-xl transition-colors"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={getContrastClass("font-medium text-gray-800", "font-medium text-yellow-300")}>
                  📐 Mathematics
                </span>
              </div>
              {expandedCategories.mathematics ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {expandedCategories.mathematics && (
              <div className="px-4 pb-4 space-y-2">
                <a
                  href="https://www.khanacademy.org/math"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={getContrastClass(
                    "flex items-center gap-2 p-3 bg-white/70 hover:bg-white/90 rounded-lg border transition-colors group",
                    "flex items-center gap-2 p-3 bg-gray-700/70 hover:bg-gray-700/90 rounded-lg border border-yellow-400/30 transition-colors group"
                  )}
                >
                  <ExternalLink size={16} className="text-blue-500" />
                  <span className={getContrastClass("text-gray-700 group-hover:text-blue-600", "text-gray-300 group-hover:text-yellow-300")}>
                    Khan Academy Math
                  </span>
                </a>
                <a
                  href="https://www.wolframalpha.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={getContrastClass(
                    "flex items-center gap-2 p-3 bg-white/70 hover:bg-white/90 rounded-lg border transition-colors group",
                    "flex items-center gap-2 p-3 bg-gray-700/70 hover:bg-gray-700/90 rounded-lg border border-yellow-400/30 transition-colors group"
                  )}
                >
                  <ExternalLink size={16} className="text-blue-500" />
                  <span className={getContrastClass("text-gray-700 group-hover:text-blue-600", "text-gray-300 group-hover:text-yellow-300")}>
                    Wolfram Alpha
                  </span>
                </a>
                <a
                  href="https://www.geogebra.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={getContrastClass(
                    "flex items-center gap-2 p-3 bg-white/70 hover:bg-white/90 rounded-lg border transition-colors group",
                    "flex items-center gap-2 p-3 bg-gray-700/70 hover:bg-gray-700/90 rounded-lg border border-yellow-400/30 transition-colors group"
                  )}
                >
                  <ExternalLink size={16} className="text-blue-500" />
                  <span className={getContrastClass("text-gray-700 group-hover:text-blue-600", "text-gray-300 group-hover:text-yellow-300")}>
                    GeoGebra
                  </span>
                </a>
              </div>
            )}
          </div>

          {/* Science */}
          <div className={getContrastClass(
            "bg-white/60 rounded-xl border border-gray-200",
            "bg-gray-800/60 rounded-xl border border-yellow-400/50"
          )}>
            <button
              onClick={() => toggleCategory('science')}
              className={getContrastClass(
                "w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-xl transition-colors",
                "w-full flex items-center justify-between p-4 text-left hover:bg-gray-700 rounded-xl transition-colors"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={getContrastClass("font-medium text-gray-800", "font-medium text-yellow-300")}>
                  🔬 Science
                </span>
              </div>
              {expandedCategories.science ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {expandedCategories.science && (
              <div className="px-4 pb-4 space-y-2">
                <a
                  href="https://phet.colorado.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={getContrastClass(
                    "flex items-center gap-2 p-3 bg-white/70 hover:bg-white/90 rounded-lg border transition-colors group",
                    "flex items-center gap-2 p-3 bg-gray-700/70 hover:bg-gray-700/90 rounded-lg border border-yellow-400/30 transition-colors group"
                  )}
                >
                  <ExternalLink size={16} className="text-blue-500" />
                  <span className={getContrastClass("text-gray-700 group-hover:text-blue-600", "text-gray-300 group-hover:text-yellow-300")}>
                    PhET Simulations
                  </span>
                </a>
                <a
                  href="https://openstax.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={getContrastClass(
                    "flex items-center gap-2 p-3 bg-white/70 hover:bg-white/90 rounded-lg border transition-colors group",
                    "flex items-center gap-2 p-3 bg-gray-700/70 hover:bg-gray-700/90 rounded-lg border border-yellow-400/30 transition-colors group"
                  )}
                >
                  <ExternalLink size={16} className="text-blue-500" />
                  <span className={getContrastClass("text-gray-700 group-hover:text-blue-600", "text-gray-300 group-hover:text-yellow-300")}>
                    OpenStax Textbooks
                  </span>
                </a>
                <a
                  href="https://www.nasa.gov/audience/foreducators/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={getContrastClass(
                    "flex items-center gap-2 p-3 bg-white/70 hover:bg-white/90 rounded-lg border transition-colors group",
                    "flex items-center gap-2 p-3 bg-gray-700/70 hover:bg-gray-700/90 rounded-lg border border-yellow-400/30 transition-colors group"
                  )}
                >
                  <ExternalLink size={16} className="text-blue-500" />
                  <span className={getContrastClass("text-gray-700 group-hover:text-blue-600", "text-gray-300 group-hover:text-yellow-300")}>
                    NASA Education
                  </span>
                </a>
              </div>
            )}
          </div>

          {/* Technology */}
          <div className={getContrastClass(
            "bg-white/60 rounded-xl border border-gray-200",
            "bg-gray-800/60 rounded-xl border border-yellow-400/50"
          )}>
            <button
              onClick={() => toggleCategory('technology')}
              className={getContrastClass(
                "w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-xl transition-colors",
                "w-full flex items-center justify-between p-4 text-left hover:bg-gray-700 rounded-xl transition-colors"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={getContrastClass("font-medium text-gray-800", "font-medium text-yellow-300")}>
                  💻 Technology
                </span>
              </div>
              {expandedCategories.technology ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {expandedCategories.technology && (
              <div className="px-4 pb-4 space-y-2">
                <a
                  href="https://www.freecodecamp.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={getContrastClass(
                    "flex items-center gap-2 p-3 bg-white/70 hover:bg-white/90 rounded-lg border transition-colors group",
                    "flex items-center gap-2 p-3 bg-gray-700/70 hover:bg-gray-700/90 rounded-lg border border-yellow-400/30 transition-colors group"
                  )}
                >
                  <ExternalLink size={16} className="text-blue-500" />
                  <span className={getContrastClass("text-gray-700 group-hover:text-blue-600", "text-gray-300 group-hover:text-yellow-300")}>
                    freeCodeCamp
                  </span>
                </a>
                <a
                  href="https://ocw.mit.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={getContrastClass(
                    "flex items-center gap-2 p-3 bg-white/70 hover:bg-white/90 rounded-lg border transition-colors group",
                    "flex items-center gap-2 p-3 bg-gray-700/70 hover:bg-gray-700/90 rounded-lg border border-yellow-400/30 transition-colors group"
                  )}
                >
                  <ExternalLink size={16} className="text-blue-500" />
                  <span className={getContrastClass("text-gray-700 group-hover:text-blue-600", "text-gray-300 group-hover:text-yellow-300")}>
                    MIT OpenCourseWare
                  </span>
                </a>
              </div>
            )}
          </div>

          {/* Research */}
          <div className={getContrastClass(
            "bg-white/60 rounded-xl border border-gray-200",
            "bg-gray-800/60 rounded-xl border border-yellow-400/50"
          )}>
            <button
              onClick={() => toggleCategory('research')}
              className={getContrastClass(
                "w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-xl transition-colors",
                "w-full flex items-center justify-between p-4 text-left hover:bg-gray-700 rounded-xl transition-colors"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={getContrastClass("font-medium text-gray-800", "font-medium text-yellow-300")}>
                  📚 Research
                </span>
              </div>
              {expandedCategories.research ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {expandedCategories.research && (
              <div className="px-4 pb-4 space-y-2">
                <a
                  href="https://scholar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={getContrastClass(
                    "flex items-center gap-2 p-3 bg-white/70 hover:bg-white/90 rounded-lg border transition-colors group",
                    "flex items-center gap-2 p-3 bg-gray-700/70 hover:bg-gray-700/90 rounded-lg border border-yellow-400/30 transition-colors group"
                  )}
                >
                  <ExternalLink size={16} className="text-blue-500" />
                  <span className={getContrastClass("text-gray-700 group-hover:text-blue-600", "text-gray-300 group-hover:text-yellow-300")}>
                    Google Scholar
                  </span>
                </a>
                <a
                  href="https://arxiv.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={getContrastClass(
                    "flex items-center gap-2 p-3 bg-white/70 hover:bg-white/90 rounded-lg border transition-colors group",
                    "flex items-center gap-2 p-3 bg-gray-700/70 hover:bg-gray-700/90 rounded-lg border border-yellow-400/30 transition-colors group"
                  )}
                >
                  <ExternalLink size={16} className="text-blue-500" />
                  <span className={getContrastClass("text-gray-700 group-hover:text-blue-600", "text-gray-300 group-hover:text-yellow-300")}>
                    arXiv
                  </span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={getContrastClass(
        "w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col",
        "w-full max-w-6xl h-[90vh] bg-gray-900 rounded-2xl shadow-2xl border border-yellow-400 flex flex-col"
      )}>
        {/* Header */}
        <div className={getContrastClass(
          "flex items-center justify-between p-4 border-b border-gray-200 rounded-t-2xl bg-gradient-to-r from-blue-50 to-purple-50",
          "flex items-center justify-between p-4 border-b border-gray-700 rounded-t-2xl bg-gradient-to-r from-gray-800 to-gray-900"
        )}>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className={getContrastClass(
                "p-2 hover:bg-gray-100 rounded-lg transition-colors",
                "p-2 hover:bg-gray-700 rounded-lg transition-colors"
              )}
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <Bot className="text-blue-500" size={24} />
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Research.STEM-GPT</h2>
            </div>
          </div>
          
          <button
            onClick={() => setShowResourcePanel(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <BookOpen size={16} />
            <span className="hidden sm:inline">Resource Links</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : getContrastClass('bg-gray-100 text-gray-600', 'bg-gray-700 text-gray-300')
                }`}>
                  {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : getContrastClass('bg-gray-100 text-gray-800 rounded-bl-md', 'bg-gray-700 text-gray-100 rounded-bl-md')
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-3xl">
                <div className={getContrastClass('bg-gray-100 text-gray-600', 'bg-gray-700 text-gray-300') + ' flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center'}>
                  <Bot size={16} />
                </div>
                <div className={getContrastClass('bg-gray-100', 'bg-gray-700') + ' px-4 py-3 rounded-2xl rounded-bl-md'}>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={getContrastClass(
          "p-4 border-t border-gray-200 rounded-b-2xl bg-gradient-to-r from-blue-50 to-purple-50",
          "p-4 border-t border-gray-700 rounded-b-2xl bg-gradient-to-r from-gray-800 to-gray-900"
        )}>
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about STEM subjects..."
                className={getContrastClass(
                  "w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white",
                  "w-full px-4 py-3 border border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
                )}
                rows={2}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!inputText.trim() || isLoading}
              className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Resource Panel */}
      <ResourcePanel />
      
      {/* Backdrop */}
      {showResourcePanel && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setShowResourcePanel(false)}
        />
      )}
    </div>
  );
}