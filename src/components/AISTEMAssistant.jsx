import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { callGroqSTEMAssistant } from '../utils/groqService';
import {
  MessageCircle,
  Send,
  Bot,
  Lightbulb,
  BookOpen,
  Calculator,
  Atom,
  Microscope,
  Zap,
  Brain,
  Sparkles,
  FileText,
  AlertCircle,
} from 'lucide-react';

const AISTEMAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content:
        "Hi! I'm your AI STEM Assistant! 🤖 I'm here to help Grade 11 students with Physics, Chemistry, Biology, and Mathematics. Ask me anything!",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const quickTopics = [
    {
      title: 'Physics Concepts',
      icon: Zap,
      color: 'bg-blue-500',
      topics: ['Kinematics', 'Forces', 'Energy', 'Waves', 'Electricity'],
    },
    {
      title: 'Chemistry Basics',
      icon: Atom,
      color: 'bg-green-500',
      topics: [
        'Atomic Structure',
        'Chemical Bonds',
        'Reactions',
        'Organic Chemistry',
      ],
    },
    {
      title: 'Biology Topics',
      icon: Microscope,
      color: 'bg-purple-500',
      topics: [
        'Cell Biology',
        'Genetics',
        'Evolution',
        'Ecology',
        'Human Body',
      ],
    },
    {
      title: 'Mathematics',
      icon: Calculator,
      color: 'bg-orange-500',
      topics: ['Algebra', 'Calculus', 'Statistics', 'Trigonometry', 'Geometry'],
    },
  ];

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim()) return;

    // Clear any previous errors
    setError(null);

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Get conversation history for context
      const conversationHistory = messages
        .filter(
          (msg) =>
            msg.type !== 'bot' ||
            !msg.content.includes("Hi! I'm your AI STEM Assistant"),
        )
        .map((msg) => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content,
        }));

      // Call Groq API
      const response = await callGroqSTEMAssistant(
        currentInput,
        conversationHistory,
      );

      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.success ? response.message : response.message,
        timestamp: new Date().toLocaleTimeString(),
        error: !response.success
      };

      setMessages((prev) => [...prev, botResponse]);
      
      if (!response.success) {
        setError('Failed to get response from AI assistant');
      }
    } catch (error) {
      console.error('Error calling AI:', error);
      setError('Connection error. Please try again.');
      
      const fallbackResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content:
          "I'm having trouble connecting right now. Please try again in a moment. In the meantime, feel free to ask me about Physics, Chemistry, Biology, or Mathematics!",
        timestamp: new Date().toLocaleTimeString(),
        error: true
      };
      setMessages((prev) => [...prev, fallbackResponse]);
    }

    setIsTyping(false);
    // Focus back to input after sending
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [inputMessage, messages]);

  const handleQuickTopic = useCallback((topic) => {
    setInputMessage(`Tell me about ${topic}`);
    inputRef.current?.focus();
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content:
          "Hi! I'm your AI STEM Assistant! 🤖 I'm here to help Grade 11 students with Physics, Chemistry, Biology, and Mathematics. Ask me anything!",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setError(null);
  }, []);

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Brain className="text-white" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">AI STEM Assistant</h3>
          <p className="text-sm text-gray-600">For Grade 11 Students</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {error && (
            <div className="flex items-center gap-1 text-red-600 text-sm" role="alert" aria-live="polite">
              <AlertCircle size={14} />
              <span>Error</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-green-600 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Online</span>
          </div>
          <button
            onClick={clearMessages}
            className="text-gray-400 hover:text-gray-600 text-sm"
            title="Clear conversation"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Quick Topics */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Quick Topics:
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {quickTopics.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <button
                key={index}
                onClick={() => handleQuickTopic(topic.title)}
                className={`${topic.color} text-white p-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1`}
              >
                <Icon size={14} />
                {topic.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.type === 'bot' && (
                <div className="flex items-center gap-2 mb-1">
                  <Bot size={16} className="text-blue-500" />
                  <span className="text-xs font-medium text-blue-600">
                    AI Assistant
                  </span>
                </div>
              )}
              <p className="text-sm whitespace-pre-line">{message.content}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs opacity-70">{message.timestamp}</p>
                {message.error && (
                  <AlertCircle size={12} className="text-red-500" title="Error in response" />
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-blue-500" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me about Physics, Chemistry, Biology, or Math..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          disabled={isTyping}
          maxLength={2000}
          aria-label="Message input"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isTyping}
        >
          <Send size={16} />
        </Button>
      </div>

      {/* Resources Footer */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Sparkles size={12} />
            <span>Powered by AI</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText size={12} />
            <span>Grade 11 STEM Curriculum</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISTEMAssistant;
