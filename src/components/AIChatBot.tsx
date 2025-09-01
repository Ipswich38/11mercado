import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Loader, ArrowLeft } from 'lucide-react';
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

interface AIChatBotProps {
  getContrastClass: (baseClass: string, contrastClass: string) => string;
  onClose: () => void;
}

export default function AIChatBot({ getContrastClass, onClose }: AIChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your enhanced PTA assistant for the 11Mercado hub v3.0. I now have advanced AI capabilities including context-aware responses, adaptive intelligence, and educational support. I can help you with DepEd PTA guidelines, all 9 mini apps, STEM learning assistance, and provide personalized recommendations based on our conversation.\n\nMy new v3.0 features include smart query routing, conversation memory, and proactive suggestions. Whether you need step-by-step guidance, complex analysis, or creative brainstorming, I adapt my responses to match your needs.\n\nWhat would you like to explore today? I\'m here to make your PTA experience more intelligent and efficient than ever before.',
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

  // Enhanced AI response generation with conversation context and smart routing
  const generateRegularResponse = async (userInput: string, context: string): Promise<Message> => {
    // Analyze conversation history for context
    const conversationContext = messages
      .slice(-5) // Last 5 messages for context
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    // Smart routing based on query type
    const queryType = analyzeQueryType(userInput);
    const enhancedSystemPrompt = buildEnhancedSystemPrompt(context, queryType, conversationContext);

    if (!groq || !isGroqConfigured) {
      throw new Error('AI service not configured');
    }
    
    // Use more advanced model for complex queries
    const modelChoice = queryType === 'complex' ? 'deepseek-r1-distill-llama-70b' : 'deepseek-r1-distill-llama-70b';
    
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: enhancedSystemPrompt },
        { role: 'user', content: userInput }
      ],
      model: modelChoice,
      temperature: queryType === 'creative' ? 0.7 : 0.3,
      max_tokens: queryType === 'detailed' ? 1500 : 1000,
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

  // Analyze query type for smart routing
  const analyzeQueryType = (query: string): 'simple' | 'detailed' | 'complex' | 'creative' => {
    const lowerQuery = query.toLowerCase();
    
    // Complex queries require deeper analysis
    if (lowerQuery.includes('explain why') || lowerQuery.includes('compare') || lowerQuery.includes('analyze') || lowerQuery.includes('what if')) {
      return 'complex';
    }
    
    // Detailed queries need comprehensive responses
    if (lowerQuery.includes('step by step') || lowerQuery.includes('how to') || lowerQuery.includes('process') || query.length > 100) {
      return 'detailed';
    }
    
    // Creative queries for brainstorming or suggestions
    if (lowerQuery.includes('ideas') || lowerQuery.includes('suggest') || lowerQuery.includes('brainstorm') || lowerQuery.includes('creative')) {
      return 'creative';
    }
    
    return 'simple';
  };

  // Build enhanced system prompt based on context
  const buildEnhancedSystemPrompt = (context: string, queryType: string, conversationContext: string): string => {
    const basePrompt = `You are an advanced AI assistant for the 11Mercado PTA hub v3.0. You help parents, teachers, and school administrators with:

1. DepEd Omnibus Code for Parent-Teacher Associations (PTA): Guidelines, procedures, and best practices
2. 11Mercado Mini Apps: Complete usage instructions for all 9 apps in the hub
3. Educational support and STEM learning assistance

CONVERSATION CONTEXT:
${conversationContext}

RELEVANT KNOWLEDGE:
${context}

ENHANCED CAPABILITIES (v3.0):
- Context-aware responses based on conversation history
- Adaptive response style based on query complexity
- Proactive suggestions and follow-up questions
- Cross-functional knowledge integration
- Educational guidance and learning support

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

RESPONSE STYLE FOR ${queryType.toUpperCase()} QUERIES:`;

    switch (queryType) {
      case 'complex':
        return basePrompt + `
- Provide comprehensive analysis with multiple perspectives
- Include examples and case studies where relevant
- Break down complex concepts into understandable parts
- Offer practical implementation strategies
- Consider potential challenges and solutions`;

      case 'detailed':
        return basePrompt + `
- Provide clear, step-by-step instructions
- Include all necessary details and prerequisites  
- Mention common pitfalls to avoid
- Offer alternative approaches when applicable
- Include verification or success indicators`;

      case 'creative':
        return basePrompt + `
- Generate innovative and practical ideas
- Provide multiple options and approaches
- Consider different stakeholder perspectives
- Include implementation tips for creative solutions
- Encourage collaboration and community involvement`;

      default:
        return basePrompt + `
- Provide concise, accurate information
- Be friendly and conversational
- Include relevant next steps or related topics
- Write in clear, simple language
- Avoid bullet points, use flowing paragraphs`;
    }
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
      let assistantMessage: Message;
      
      // Check if query is PTA-related for enhanced RAG response
      if (ptaRAG.isPTARelated(input)) {
        // Use RAG system for PTA-specific queries
        const ragResult: Answer = ptaRAG.ask(input, 5);
        
        if (ragResult.hits.length > 0) {
          // Enhanced response with citations
          let enhancedContent = ragResult.answer;
          
          // Add citation information
          if (ragResult.citations.length > 0) {
            enhancedContent += `\n\nSources: ${ragResult.citations.join(', ')}`;
          }
          
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: formatAIResponse(enhancedContent),
            timestamp: new Date(),
            citations: ragResult.citations
          };
        } else {
          // Fallback to regular knowledge base search
          const relevantSections = searchKnowledge(input);
          const context = relevantSections.map(section => 
            `${section.title}: ${section.content}`
          ).join('\n\n');
          
          assistantMessage = await generateRegularResponse(input, context);
        }
      } else {
        // Use existing knowledge base for non-PTA queries
        const relevantSections = searchKnowledge(input);
        const context = relevantSections.map(section => 
          `${section.title}: ${section.content}`
        ).join('\n\n');
        
        assistantMessage = await generateRegularResponse(input, context);
      }

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
              {message.citations && message.citations.length > 0 && (
                <div className={`mt-3 p-2 rounded-lg text-xs ${
                  getContrastClass(
                    'bg-blue-50 border-l-4 border-blue-400',
                    'bg-gray-700 border-l-4 border-yellow-400'
                  )
                }`}>
                  <strong className={getContrastClass('text-blue-700', 'text-yellow-300')}>
                    📚 Sources:
                  </strong>
                  <span className={getContrastClass('text-blue-600 ml-2', 'text-yellow-200 ml-2')}>
                    {message.citations.join(' • ')}
                  </span>
                </div>
              )}
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