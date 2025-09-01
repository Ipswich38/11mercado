import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, BookOpen, X, Menu, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import Groq from 'groq-sdk';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function STEMChatAI({ getContrastClass, onClose }) {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m Research and STEM-GPT v3.0, your advanced AI assistant for STEM subjects and research methodology. I can help you with mathematics, science, engineering, technology, and research methods.\n\nWhat would you like to explore today?',
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

  // Initialize Groq client
  const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are Research and STEM-GPT v3.0, an advanced AI assistant specializing in Science, Technology, Engineering, and Mathematics education and research. Provide comprehensive, accurate, and educational responses. Use clear explanations with examples when helpful.'
          },
          { role: 'user', content: currentInput }
        ],
        model: 'llama3-70b-8192',
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      });

      const aiResponse = response.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'m having trouble connecting to my AI service right now. Please check that your API key is configured correctly and try again.',
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

  const resourceCategories = {
    mathematics: {
      name: "Mathematics",
      icon: "📐",
      resources: [
        { name: "Khan Academy Math", url: "https://www.khanacademy.org/math" },
        { name: "Wolfram Alpha", url: "https://www.wolframalpha.com" },
        { name: "GeoGebra", url: "https://www.geogebra.org" },
        { name: "Desmos Calculator", url: "https://www.desmos.com/calculator" }
      ]
    },
    science: {
      name: "Science",
      icon: "🔬",
      resources: [
        { name: "PhET Simulations", url: "https://phet.colorado.edu" },
        { name: "OpenStax Textbooks", url: "https://openstax.org" },
        { name: "NASA Education", url: "https://www.nasa.gov/audience/foreducators/" },
        { name: "ChemCollective", url: "https://www.chemcollective.org" }
      ]
    },
    technology: {
      name: "Technology",
      icon: "💻",
      resources: [
        { name: "GitHub Learning Lab", url: "https://lab.github.com" },
        { name: "freeCodeCamp", url: "https://www.freecodecamp.org" },
        { name: "MDN Web Docs", url: "https://developer.mozilla.org" },
        { name: "Stack Overflow", url: "https://stackoverflow.com" }
      ]
    },
    engineering: {
      name: "Engineering",
      icon: "⚙️",
      resources: [
        { name: "MIT OpenCourseWare", url: "https://ocw.mit.edu" },
        { name: "Engineering Toolbox", url: "https://www.engineeringtoolbox.com" },
        { name: "AutoCAD Learning", url: "https://www.autodesk.com/education" },
        { name: "IEEE Xplore", url: "https://ieeexplore.ieee.org" }
      ]
    },
    research: {
      name: "Research",
      icon: "📚",
      resources: [
        { name: "Google Scholar", url: "https://scholar.google.com" },
        { name: "ResearchGate", url: "https://www.researchgate.net" },
        { name: "arXiv", url: "https://arxiv.org" },
        { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov" }
      ]
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={getContrastClass(
        "w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl",
        "w-full max-w-6xl h-[90vh] bg-gray-900 rounded-2xl shadow-2xl border border-yellow-400"
      )}>
        {/* Header */}
        <div className={getContrastClass(
          "flex items-center justify-between p-4 border-b border-gray-200 rounded-t-2xl bg-gradient-to-r from-blue-50 to-purple-50",
          "flex items-center justify-between p-4 border-b border-gray-700 rounded-t-2xl bg-gradient-to-r from-gray-800 to-gray-900"
        )}>
          <div className="flex items-center space-x-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
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

        {/* Chat Messages */}
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

        {/* Input Area */}
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
      {showResourcePanel && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setShowResourcePanel(false)} />
          <div className="fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300">
            <div className={getContrastClass(
              "h-full bg-gradient-to-br from-white/95 via-blue-50/90 to-purple-50/95 backdrop-blur-xl border-l border-blue-200 shadow-2xl",
              "h-full bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl border-l-2 border-yellow-400 shadow-2xl"
            )}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Resource Links</h3>
                <button
                  onClick={() => setShowResourcePanel(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto h-full scrollbar-hide">
                {Object.entries(resourceCategories).map(([key, category]) => (
                  <div key={key} className="space-y-2">
                    <button
                      onClick={() => toggleCategory(key)}
                      className={getContrastClass(
                        "w-full flex items-center justify-between p-3 bg-white/70 hover:bg-white/90 rounded-lg transition-all duration-200 border border-gray-200",
                        "w-full flex items-center justify-between p-3 bg-gray-800/70 hover:bg-gray-800/90 rounded-lg transition-all duration-200 border border-gray-700"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium text-gray-800 dark:text-white">{category.name}</span>
                      </div>
                      {expandedCategories[key] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {expandedCategories[key] && (
                      <div className="space-y-2 ml-4">
                        {category.resources.map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={getContrastClass(
                              "flex items-center space-x-2 p-2 bg-white/50 hover:bg-white/80 rounded-md transition-colors group border border-gray-100",
                              "flex items-center space-x-2 p-2 bg-gray-700/50 hover:bg-gray-700/80 rounded-md transition-colors group border border-gray-600"
                            )}
                          >
                            <ExternalLink size={14} className="text-gray-500 group-hover:text-blue-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {resource.name}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}