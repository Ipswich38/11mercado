import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Loader, ArrowLeft } from 'lucide-react';
import groq, { isGroqConfigured } from '../utils/groqClient';
import { depedOmnibusKnowledge, miniAppsKnowledge, searchKnowledge, getAllKnowledge } from '../utils/knowledgeBase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatBotProps {
  getContrastClass: (baseClass: string, contrastClass: string) => string;
  onClose: () => void;
}

export default function AIChatBot({ getContrastClass, onClose }: AIChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your PTA assistant for the 11Mercado hub. I can help you with DepEd PTA guidelines including formation, roles, financial management, and meetings. I also know how to use all 9 mini apps in 11Mercado and can provide tips for donation forms, project proposals, and community features.\n\nWhat would you like to know? I\'m here to make your PTA experience smoother and more efficient.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Clean and format AI response text
  const formatAIResponse = (text: string) => {
    // Remove all asterisks and markdown formatting
    let cleaned = text.replace(/\*+/g, '');
    
    // Remove excessive whitespace and normalize line breaks
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Split into sentences
    const sentences = cleaned.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    // Group sentences into paragraphs of 3 sentences each
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
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Search relevant knowledge sections
      const relevantSections = searchKnowledge(input);
      const context = relevantSections.map(section => 
        `${section.title}: ${section.content}`
      ).join('\n\n');

      const systemPrompt = `You are an expert assistant for the 11Mercado PTA hub. You help parents, teachers, and school administrators with two main areas:

1. DepEd Omnibus Code for Parent-Teacher Associations (PTA): Guidelines, procedures, and best practices
2. 11Mercado Mini Apps: Complete usage instructions for all 9 apps in the hub

RELEVANT KNOWLEDGE:
${context}

INSTRUCTIONS:
- Provide accurate, helpful answers based on the provided knowledge
- For app usage questions, give step-by-step instructions
- For PTA policy questions, reference DepEd guidelines
- If asked about features not covered in the knowledge base, acknowledge the limitation
- Be friendly and conversational while staying informative
- Write in clean, readable paragraphs without using asterisks, bold text, or markdown formatting
- Use simple, clear language organized in easy-to-read paragraphs
- Avoid bullet points and use flowing paragraph text instead

AVAILABLE MINI APPS IN 11MERCADO:
1. STEM Resources (AI tools + educational links)
2. Weather App (local weather info)  
3. Donation Form (4 payment modes)
4. Community Forum (discussions)
5. Meet the Officers (PTA contact info)
6. School Links (official websites)
7. Donation Progress (campaign tracking)
8. Contact Us (message PTA)
9. Projects (proposals + tracking)

Answer the user's question based on this knowledge.`;

      if (!groq || !isGroqConfigured) {
        throw new Error('AI service not configured');
      }
      
      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input }
        ],
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 1000,
        top_p: 1,
        stream: false
      });

      const rawContent = response.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';
      const formattedContent = formatAIResponse(rawContent);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: formattedContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling Groq API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting to the AI service right now. Please try again in a moment.',
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
      handleSendMessage();
    }
  };

  return (
    <div className={getContrastClass(
      "fixed inset-0 bg-white z-50 flex flex-col",
      "fixed inset-0 bg-black z-50 flex flex-col"
    )}>
      {/* Header */}
      <div className={getContrastClass(
        "bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white",
        "bg-gray-900 border-b-2 border-yellow-400 p-4"
      )}>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className={getContrastClass(
              "p-2 rounded-lg hover:bg-white/20 transition-colors",
              "p-2 rounded-lg hover:bg-gray-800 transition-colors text-yellow-400"
            )}
          >
            <ArrowLeft size={20} />
          </button>
          <Bot size={24} className={getContrastClass("text-white", "text-yellow-400")} />
          <div>
            <h1 className={getContrastClass(
              "text-lg font-semibold text-white",
              "text-lg font-semibold text-yellow-400"
            )}>
              DepEd PTA Assistant
            </h1>
            <p className={getContrastClass(
              "text-sm text-white/80",
              "text-sm text-yellow-200"
            )}>
              PTA guidelines & mini app instructions
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className={getContrastClass(
                "w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0",
                "w-8 h-8 bg-gray-700 border border-yellow-400 rounded-full flex items-center justify-center flex-shrink-0"
              )}>
                <Bot size={16} className={getContrastClass("text-white", "text-yellow-400")} />
              </div>
            )}
            <div
              className={`max-w-[85%] p-4 rounded-3xl ${
                message.role === 'user'
                  ? getContrastClass(
                      'bg-blue-500 text-white',
                      'bg-yellow-400 text-black'
                    )
                  : getContrastClass(
                      'bg-gray-100 text-gray-900',
                      'bg-gray-800 border border-yellow-400 text-yellow-200'
                    )
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-2 ${
                message.role === 'user' 
                  ? getContrastClass('text-white/70', 'text-black/70')
                  : getContrastClass('text-gray-500', 'text-yellow-400/70')
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
            {message.role === 'user' && (
              <div className={getContrastClass(
                "w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0",
                "w-8 h-8 bg-gray-700 border border-yellow-400 rounded-full flex items-center justify-center flex-shrink-0"
              )}>
                <User size={16} className={getContrastClass("text-white", "text-yellow-400")} />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className={getContrastClass(
              "w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0",
              "w-8 h-8 bg-gray-700 border border-yellow-400 rounded-full flex items-center justify-center flex-shrink-0"
            )}>
              <Bot size={16} className={getContrastClass("text-white", "text-yellow-400")} />
            </div>
            <div className={getContrastClass(
              "bg-gray-100 text-gray-900 p-4 rounded-3xl",
              "bg-gray-800 border border-yellow-400 text-yellow-200 p-4 rounded-3xl"
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
        "border-t bg-white p-4",
        "border-t-2 border-yellow-400 bg-black p-4"
      )}>
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about PTA guidelines or how to use any mini app..."
            className={getContrastClass(
              "flex-1 p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500",
              "flex-1 p-3 border border-gray-600 bg-gray-900 text-yellow-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
  );
}