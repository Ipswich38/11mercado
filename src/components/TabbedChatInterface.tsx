import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Loader, ArrowLeft, Plus, Code, Brain, FileText, Palette, MessageCircle } from 'lucide-react';
import groq, { isGroqConfigured } from '../utils/groqClient';
import { depedOmnibusKnowledge, miniAppsKnowledge, searchKnowledge, getAllKnowledge } from '../utils/knowledgeBase';
import { ptaRAG, type Answer } from '../utils/ptaRagSystem';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: string[];
}

interface ChatTab {
  id: string;
  title: string;
  category: 'code' | 'study-buddy' | 'exam' | 'creative' | 'chat';
  icon: React.ReactNode;
  messages: Message[];
  systemPrompt: string;
}

interface TabbedChatInterfaceProps {
  getContrastClass: (baseClass: string, contrastClass: string) => string;
  onClose: () => void;
}

export default function TabbedChatInterface({ getContrastClass, onClose }: TabbedChatInterfaceProps) {
  const [tabs, setTabs] = useState<ChatTab[]>([
    {
      id: 'chat-1',
      title: 'PTA Chat',
      category: 'chat',
      icon: <MessageCircle size={16} />,
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: 'Hello! I\'m your enhanced PTA assistant. I can help you with DepEd PTA guidelines, all 9 mini apps, STEM learning assistance, and provide personalized recommendations. What would you like to explore today?',
          timestamp: new Date()
        }
      ],
      systemPrompt: 'You are an enhanced PTA assistant for 11Mercado hub. Help with DepEd guidelines, mini apps usage, and educational support.'
    }
  ]);
  
  const [activeTabId, setActiveTabId] = useState('chat-1');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getTabSystemPrompt = (category: ChatTab['category']): string => {
    switch (category) {
      case 'code':
        return 'You are a specialized coding assistant. Help with programming questions, code debugging, best practices, and software development. Provide clear, executable code examples and explanations.';
      case 'study-buddy':
        return 'You are a study buddy assistant. Help with learning concepts, creating study plans, explaining difficult topics, and providing educational support across various subjects.';
      case 'exam':
        return 'You are an exam preparation specialist. Create practice questions, provide test-taking strategies, help with review materials, and simulate exam scenarios for various subjects.';
      case 'creative':
        return 'You are a creative assistant. Help with brainstorming ideas, creative writing, design concepts, artistic projects, and innovative problem-solving approaches.';
      case 'chat':
      default:
        return 'You are an enhanced PTA assistant for 11Mercado hub. Help with DepEd guidelines, mini apps usage, and educational support.';
    }
  };

  const createNewTab = (category: ChatTab['category']) => {
    const categoryConfig = {
      code: { title: 'Code Assistant', icon: <Code size={16} /> },
      'study-buddy': { title: 'Study Buddy', icon: <Brain size={16} /> },
      exam: { title: 'Exam Tryout', icon: <FileText size={16} /> },
      creative: { title: 'Creative AI', icon: <Palette size={16} /> },
      chat: { title: 'AI Chat', icon: <MessageCircle size={16} /> }
    };

    const config = categoryConfig[category];
    const newTab: ChatTab = {
      id: `${category}-${Date.now()}`,
      title: config.title,
      category,
      icon: config.icon,
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: `Hello! I'm your ${config.title.toLowerCase()}. How can I help you today?`,
          timestamp: new Date()
        }
      ],
      systemPrompt: getTabSystemPrompt(category)
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    const filteredTabs = tabs.filter(tab => tab.id !== tabId);
    
    if (filteredTabs.length === 0) {
      createNewTab('chat');
      return;
    }
    
    setTabs(filteredTabs);
    
    if (activeTabId === tabId) {
      setActiveTabId(filteredTabs[filteredTabs.length - 1].id);
    }
  };

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const formatAIResponse = (text: string) => {
    let cleaned = text.replace(/\*+/g, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    const sentences = cleaned.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    const paragraphs = [];
    for (let i = 0; i < sentences.length; i += 3) {
      const paragraph = sentences.slice(i, i + 3)
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 0)
        .join('. ');
      
      if (paragraph) {
        paragraphs.push(paragraph + (paragraph.endsWith('.') ? '' : '.'));
      }
    }
    
    return paragraphs.join('\n\n');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeTab?.messages]);

  const generateResponse = async (userInput: string, tab: ChatTab): Promise<Message> => {
    const conversationContext = tab.messages
      .slice(-5)
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    if (!groq || !isGroqConfigured) {
      throw new Error('AI service not configured');
    }
    
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: `${tab.systemPrompt}\n\nConversation context:\n${conversationContext}` },
        { role: 'user', content: userInput }
      ],
      model: 'deepseek-r1-distill-llama-70b',
      temperature: 0.3,
      max_tokens: 1000,
      top_p: 1,
      stream: false
    });

    const rawContent = response.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';
    const formattedContent = formatAIResponse(rawContent);
    
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: formattedContent,
      timestamp: new Date()
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !activeTab) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, messages: [...tab.messages, userMessage] }
        : tab
    ));
    
    setInput('');
    setIsLoading(true);

    try {
      const assistantMessage = await generateResponse(input, activeTab);
      
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, messages: [...tab.messages, assistantMessage] }
          : tab
      ));
    } catch (error) {
      console.error('Error calling AI service:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting to the AI service right now. Please try again in a moment.',
        timestamp: new Date()
      };
      
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, messages: [...tab.messages, errorMessage] }
          : tab
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={getContrastClass(
      "fixed inset-0 bg-gray-50 z-50 flex flex-col",
      "fixed inset-0 bg-gray-900 z-50 flex flex-col"
    )}>
      {/* Header */}
      <div className={getContrastClass(
        "bg-white border-b border-gray-200 p-4",
        "bg-gray-800 border-b border-gray-700 p-4"
      )}>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className={getContrastClass(
              "p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600",
              "p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
            )}
          >
            <ArrowLeft size={20} />
          </button>
          <Bot size={24} className={getContrastClass("text-blue-600", "text-blue-400")} />
          <div>
            <h1 className={getContrastClass(
              "text-lg font-semibold text-gray-900",
              "text-lg font-semibold text-white"
            )}>
              AI Chat Hub
            </h1>
            <p className={getContrastClass(
              "text-sm text-gray-600",
              "text-sm text-gray-400"
            )}>
              Multi-purpose AI assistant with specialized tabs
            </p>
          </div>
        </div>
      </div>

      {/* Material 3 Card Container */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className={getContrastClass(
          "h-full bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden flex flex-col",
          "h-full bg-gray-800 rounded-3xl border border-gray-600 shadow-lg overflow-hidden flex flex-col"
        )}>
          {/* Tab Bar */}
          <div className={getContrastClass(
            "border-b border-gray-200 bg-gray-50",
            "border-b border-gray-700 bg-gray-900"
          )}>
            <div className="flex items-center overflow-x-auto scrollbar-thin">
              {tabs.map(tab => (
                <div key={tab.id} className="flex items-center">
                  <button
                    onClick={() => setActiveTabId(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                      activeTabId === tab.id
                        ? getContrastClass(
                            'border-blue-500 bg-white text-blue-600',
                            'border-blue-400 bg-gray-800 text-blue-400'
                          )
                        : getContrastClass(
                            'border-transparent hover:bg-gray-100 text-gray-600',
                            'border-transparent hover:bg-gray-700 text-gray-400'
                          )
                    }`}
                  >
                    {tab.icon}
                    <span className="text-sm font-medium">{tab.title}</span>
                    {tabs.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                        className={getContrastClass(
                          "ml-1 p-1 rounded hover:bg-gray-200 text-gray-400",
                          "ml-1 p-1 rounded hover:bg-gray-600 text-gray-500"
                        )}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </button>
                </div>
              ))}
              
              {/* Add Tab Dropdown */}
              <div className="relative group">
                <button className={getContrastClass(
                  "flex items-center gap-1 px-3 py-3 text-gray-600 hover:bg-gray-100 transition-colors",
                  "flex items-center gap-1 px-3 py-3 text-gray-400 hover:bg-gray-700 transition-colors"
                )}>
                  <Plus size={16} />
                  <span className="text-sm">New</span>
                </button>
                
                {/* Dropdown Menu */}
                <div className={`absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 ${
                  getContrastClass(
                    "bg-white border-gray-200",
                    "bg-gray-800 border-gray-600"
                  )
                }`}>
                  <button
                    onClick={() => createNewTab('code')}
                    className={getContrastClass(
                      "flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left w-full text-gray-700",
                      "flex items-center gap-2 px-4 py-2 hover:bg-gray-700 text-left w-full text-gray-300"
                    )}
                  >
                    <Code size={16} />
                    <span className="text-sm whitespace-nowrap">Code Assistant</span>
                  </button>
                  <button
                    onClick={() => createNewTab('study-buddy')}
                    className={getContrastClass(
                      "flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left w-full text-gray-700",
                      "flex items-center gap-2 px-4 py-2 hover:bg-gray-700 text-left w-full text-gray-300"
                    )}
                  >
                    <Brain size={16} />
                    <span className="text-sm whitespace-nowrap">Study Buddy</span>
                  </button>
                  <button
                    onClick={() => createNewTab('exam')}
                    className={getContrastClass(
                      "flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left w-full text-gray-700",
                      "flex items-center gap-2 px-4 py-2 hover:bg-gray-700 text-left w-full text-gray-300"
                    )}
                  >
                    <FileText size={16} />
                    <span className="text-sm whitespace-nowrap">Exam Tryout</span>
                  </button>
                  <button
                    onClick={() => createNewTab('creative')}
                    className={getContrastClass(
                      "flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left w-full text-gray-700",
                      "flex items-center gap-2 px-4 py-2 hover:bg-gray-700 text-left w-full text-gray-300"
                    )}
                  >
                    <Palette size={16} />
                    <span className="text-sm whitespace-nowrap">Creative AI</span>
                  </button>
                  <button
                    onClick={() => createNewTab('chat')}
                    className={getContrastClass(
                      "flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left w-full text-gray-700 border-t border-gray-100",
                      "flex items-center gap-2 px-4 py-2 hover:bg-gray-700 text-left w-full text-gray-300 border-t border-gray-600"
                    )}
                  >
                    <MessageCircle size={16} />
                    <span className="text-sm whitespace-nowrap">General Chat</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab?.messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className={getContrastClass(
                    "w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0",
                    "w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"
                  )}>
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-4 rounded-3xl ${
                    message.role === 'user'
                      ? getContrastClass(
                          'bg-blue-500 text-white',
                          'bg-blue-600 text-white'
                        )
                      : getContrastClass(
                          'bg-gray-100 text-gray-900',
                          'bg-gray-700 text-gray-100'
                        )
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' 
                      ? 'text-white/70'
                      : getContrastClass('text-gray-500', 'text-gray-400')
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className={getContrastClass(
                    "w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0",
                    "w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0"
                  )}>
                    <User size={16} className="text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className={getContrastClass(
                  "w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0",
                  "w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"
                )}>
                  <Bot size={16} className="text-white" />
                </div>
                <div className={getContrastClass(
                  "bg-gray-100 text-gray-900 p-4 rounded-3xl",
                  "bg-gray-700 text-gray-100 p-4 rounded-3xl"
                )}>
                  <div className="flex items-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={getContrastClass(
            "border-t border-gray-200 p-4",
            "border-t border-gray-700 p-4"
          )}>
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask your ${activeTab?.title.toLowerCase()} something...`}
                className={getContrastClass(
                  "flex-1 p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white",
                  "flex-1 p-3 border border-gray-600 bg-gray-800 text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                )}
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white p-3 rounded-xl transition-colors flex items-center justify-center"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}