import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, BookOpen, X, Menu, ExternalLink } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Enhanced text formatting function that preserves structure
  const formatAIResponse = (text) => {
    if (!text || typeof text !== 'string') return '';

    // Step 1: Clean up excessive markdown while preserving structure
    let cleaned = text
      // Remove excessive asterisks but preserve single ones for emphasis  
      .replace(/\*{3,}/g, '*')
      // Remove markdown headers but keep the text
      .replace(/^#{1,6}\s+/gm, '')
      // Remove excessive hashtags
      .replace(/#{2,}/g, '#')
      // Clean up markdown links but preserve the text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove excessive underscores
      .replace(/_{3,}/g, '_')
      // Preserve intentional line breaks and paragraph structure
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    // Step 2: Normalize whitespace within lines but preserve line structure
    const lines = cleaned.split('\n');
    const processedLines = lines.map(line => {
      // Preserve empty lines for paragraph breaks
      if (line.trim() === '') return '';
      
      // Clean excessive whitespace within the line
      return line.replace(/\s+/g, ' ').trim();
    });

    // Step 3: Handle special formatting patterns
    const formattedLines = [];
    let inCodeBlock = false;
    
    for (let i = 0; i < processedLines.length; i++) {
      const line = processedLines[i];
      const nextLine = processedLines[i + 1];
      
      // Detect and preserve code blocks
      if (line.includes('```')) {
        inCodeBlock = !inCodeBlock;
        formattedLines.push(line);
        continue;
      }
      
      // If we're in a code block, preserve exactly
      if (inCodeBlock) {
        formattedLines.push(line);
        continue;
      }
      
      // Handle numbered lists (preserve structure)
      if (/^\d+\.\s/.test(line)) {
        // This is a numbered list item
        formattedLines.push(line);
        continue;
      }
      
      // Handle bulleted lists  
      if (/^[-*+•]\s/.test(line)) {
        formattedLines.push(line);
        continue;
      }
      
      // Handle section headers (lines that end with a colon and next line is content)
      if (line.endsWith(':') && nextLine && !nextLine.startsWith(' ') && nextLine.trim() !== '') {
        formattedLines.push(line);
        continue;
      }
      
      // Handle continuation of numbered lists (lines that should be joined)
      if (line !== '' && 
          formattedLines.length > 0 && 
          /^\d+\.$/.test(formattedLines[formattedLines.length - 1])) {
        // Previous line was a number followed by period - join them
        formattedLines[formattedLines.length - 1] += ' ' + line;
        continue;
      }
      
      // Regular line processing
      formattedLines.push(line);
    }
    
    // Step 4: Clean up paragraph structure
    const result = formattedLines
      // Remove multiple consecutive empty lines
      .reduce((acc, line, index) => {
        if (line === '' && acc[acc.length - 1] === '') {
          return acc; // Skip multiple empty lines
        }
        acc.push(line);
        return acc;
      }, [])
      // Join lines back together
      .join('\n')
      // Clean up any remaining issues
      .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
      .trim();

    return result;
  };

  const getRelevantResources = (question) => {
    const lowerQuestion = question.toLowerCase();
    const resources = [];

    // Mathematics resources
    if (lowerQuestion.includes('math') || lowerQuestion.includes('equation') || lowerQuestion.includes('calculate') || 
        lowerQuestion.includes('algebra') || lowerQuestion.includes('geometry') || lowerQuestion.includes('calculus')) {
      resources.push(
        "📐 Khan Academy Math: https://www.khanacademy.org/math",
        "🧮 Wolfram Alpha: https://www.wolframalpha.com",
        "📊 GeoGebra: https://www.geogebra.org"
      );
    }

    // Chemistry/Molecules resources
    if (lowerQuestion.includes('molecule') || lowerQuestion.includes('chemistry') || lowerQuestion.includes('chemical') ||
        lowerQuestion.includes('atom') || lowerQuestion.includes('reaction') || lowerQuestion.includes('compound')) {
      resources.push(
        "🧪 PhET Chemistry Simulations: https://phet.colorado.edu/en/simulations/category/chemistry",
        "⚗️ ChemCollective Virtual Labs: https://www.chemcollective.org",
        "📚 OpenStax Chemistry: https://openstax.org/details/books/chemistry-2e"
      );
    }

    // Physics resources
    if (lowerQuestion.includes('physics') || lowerQuestion.includes('force') || lowerQuestion.includes('energy') ||
        lowerQuestion.includes('gravity') || lowerQuestion.includes('quantum') || lowerQuestion.includes('wave')) {
      resources.push(
        "🔬 PhET Physics Simulations: https://phet.colorado.edu/en/simulations/category/physics",
        "📖 OpenStax Physics: https://openstax.org/details/books/university-physics-volume-1",
        "🌌 NASA Physics Resources: https://www.nasa.gov/audience/foreducators/"
      );
    }

    // Biology resources
    if (lowerQuestion.includes('biology') || lowerQuestion.includes('cell') || lowerQuestion.includes('dna') ||
        lowerQuestion.includes('gene') || lowerQuestion.includes('organism') || lowerQuestion.includes('evolution')) {
      resources.push(
        "🧬 LabXchange Biology: https://www.labxchange.org",
        "📗 OpenStax Biology: https://openstax.org/details/books/biology-2e",
        "🔬 Online Biology Labs: https://www.olabs.edu.in"
      );
    }

    // Research methodology resources
    if (lowerQuestion.includes('research') || lowerQuestion.includes('study') || lowerQuestion.includes('methodology') ||
        lowerQuestion.includes('paper') || lowerQuestion.includes('analysis') || lowerQuestion.includes('data')) {
      resources.push(
        "📚 Google Scholar: https://scholar.google.com",
        "📄 arXiv Preprints: https://arxiv.org",
        "🔍 PubMed: https://www.ncbi.nlm.nih.gov/pubmed/",
        "📖 Open Access Journals: https://doaj.org"
      );
    }

    // Technology/Programming resources
    if (lowerQuestion.includes('programming') || lowerQuestion.includes('code') || lowerQuestion.includes('software') ||
        lowerQuestion.includes('computer') || lowerQuestion.includes('algorithm') || lowerQuestion.includes('technology')) {
      resources.push(
        "💻 FreeCodeCamp: https://www.freecodecamp.org",
        "🎓 MIT OpenCourseWare: https://ocw.mit.edu",
        "📺 Coursera Free Courses: https://www.coursera.org/courses?query=free"
      );
    }

    // Engineering resources
    if (lowerQuestion.includes('engineering') || lowerQuestion.includes('design') || lowerQuestion.includes('circuit') ||
        lowerQuestion.includes('mechanical') || lowerQuestion.includes('electrical') || lowerQuestion.includes('robotics')) {
      resources.push(
        "⚙️ Engineering ToolBox: https://www.engineeringtoolbox.com",
        "🎨 Autodesk Education: https://www.autodesk.com/education/edu-software",
        "🔧 SolidWorks Student: https://www.solidworks.com/sw/education/"
      );
    }

    return resources;
  };

  // Enhanced educational response generator with deeper understanding
  const generateEducationalResponse = (question) => {
    const lowerQuestion = question.toLowerCase();
    const questionWords = lowerQuestion.split(' ');
    
    // Advanced mathematics responses
    if (lowerQuestion.includes('algebra') || lowerQuestion.includes('equation')) {
      return `🤖 Advanced Algebra Analysis:\n\nAlgebra represents one of mathematics' most powerful abstractions, enabling us to work with unknown quantities systematically. This branch forms the foundation for advanced mathematical thinking and problem-solving across multiple disciplines.\n\nCore algebraic principles include variable manipulation, where letters represent unknown or changing values. Equation solving follows logical steps: isolate the variable by performing inverse operations. Function analysis helps us understand relationships between input and output values.\n\nReal-world applications span from calculating loan interest rates to modeling population growth. Engineers use algebraic equations to design structures, while economists model market behaviors. The abstract thinking skills developed through algebra enhance logical reasoning in all areas of life.\n\nNext steps for deeper understanding: Practice with word problems to see practical applications. Study graphing to visualize algebraic relationships. Explore how algebra connects to geometry and calculus for a comprehensive mathematical foundation.`;
    }
    
    if (lowerQuestion.includes('geometry')) {
      return `🤖 Comprehensive Geometry Guide:\n\nGeometry bridges abstract mathematical concepts with tangible spatial understanding, forming the visual foundation of mathematical thinking. This discipline develops spatial reasoning skills essential for numerous professional fields and daily problem-solving.\n\nFundamental geometric concepts include point, line, and plane relationships that define our three-dimensional world. Angle measurements, parallel and perpendicular relationships, and congruence principles create the framework for understanding space. Area and volume calculations have practical applications in construction, design, and manufacturing.\n\nModern applications extend from architectural design to computer graphics programming. GPS navigation systems use geometric principles for location tracking. Artists and designers apply geometric proportions for aesthetic appeal. Medical imaging technologies rely on geometric algorithms for accurate diagnosis.\n\nAdvanced exploration: Study coordinate geometry to connect algebra and geometry. Investigate trigonometry for advanced spatial relationships. Explore geometric proofs to develop logical reasoning skills essential for mathematical thinking.`;
    }
    
    // Advanced science responses
    if (lowerQuestion.includes('molecule') || lowerQuestion.includes('chemistry')) {
      return `🤖 Molecular Chemistry Deep Dive:\n\nMolecular chemistry reveals the fundamental mechanisms underlying all matter interactions, from simple water formation to complex biological processes. Understanding molecular behavior enables us to design new materials, develop medications, and comprehend life itself.\n\nMolecular structure determines chemical properties through electron sharing patterns in covalent bonds. Intermolecular forces like hydrogen bonding explain why water has unique properties enabling life. Reaction mechanisms show step-by-step processes for chemical transformations.\n\nPractical applications include pharmaceutical drug design, where molecular shape determines biological activity. Materials science creates new polymers with specific properties. Environmental chemistry helps us understand pollution effects and develop cleaner technologies.\n\nAdvanced study paths: Explore organic chemistry for carbon-based molecular complexity. Investigate biochemistry to understand life's molecular processes. Study physical chemistry to understand energy changes in molecular interactions and reaction rates.`;
    }
    
    if (lowerQuestion.includes('physics') || lowerQuestion.includes('force') || lowerQuestion.includes('energy')) {
      return `🤖 Comprehensive Physics Framework:\n\nPhysics provides the fundamental principles governing all natural phenomena, from quantum mechanics at the atomic scale to cosmological processes in distant galaxies. This science reveals the underlying unity of seemingly diverse natural events.\n\nClassical mechanics describes motion through Newton's laws, connecting force, mass, and acceleration. Energy conservation principles explain how systems transfer and transform energy without loss. Wave phenomena, including sound and light, demonstrate how energy travels through space and matter.\n\nModern physics applications include medical imaging technologies like MRI and CT scans. Semiconductor physics enables computer technology and renewable energy systems. Quantum mechanics principles drive emerging technologies like quantum computing and advanced materials science.\n\nExploration pathways: Study thermodynamics to understand energy flow in systems. Investigate electromagnetism for understanding modern technology. Explore relativity and quantum mechanics to grasp the universe's fundamental nature at extreme scales.`;
    }
    
    if (lowerQuestion.includes('biology') || lowerQuestion.includes('cell') || lowerQuestion.includes('life')) {
      return `🤖 Biological Systems Analysis:\n\nBiology illuminates the remarkable complexity and interconnectedness of living systems, from molecular machinery within cells to global ecosystem dynamics. This science reveals life's fundamental principles while informing medical treatments and environmental conservation.\n\nCellular biology demonstrates how molecular components organize into functional living units. DNA's information storage and protein synthesis create the molecular basis of heredity. Metabolic pathways show how organisms extract energy from nutrients and build essential molecules.\n\nEcological principles explain species interactions and environmental balance. Evolution provides the theoretical framework for understanding biological diversity and adaptation. Medical applications include understanding disease mechanisms and developing targeted treatments.\n\nAdvanced directions: Study genetics and molecular biology for understanding heredity mechanisms. Explore ecology and evolution for environmental and conservation applications. Investigate bioengineering to apply biological principles for technological solutions.`;
    }
    
    // Enhanced research methodology
    if (lowerQuestion.includes('research') || lowerQuestion.includes('study') || lowerQuestion.includes('methodology')) {
      return `🤖 Advanced Research Methodology:\n\nEffective research methodology combines systematic investigation with critical thinking to generate reliable knowledge and solve complex problems. Modern research approaches integrate multiple disciplines and advanced analytical tools.\n\nQuantitative methods use statistical analysis to identify patterns and test hypotheses with numerical data. Qualitative approaches explore complex social phenomena through interviews, observations, and textual analysis. Mixed methods research combines both approaches for comprehensive understanding.\n\nTechnology enhances modern research through big data analytics, machine learning algorithms, and advanced simulation techniques. Collaborative research platforms enable global cooperation and accelerated discovery. Open science practices promote transparency and reproducibility.\n\nProfessional development: Learn statistical software for data analysis. Understand peer review processes for scientific validation. Practice writing research proposals and communicating findings to diverse audiences for maximum impact.`;
    }
    
    // Enhanced engineering and technology response
    if (lowerQuestion.includes('engineering') || lowerQuestion.includes('technology')) {
      return `🤖 Engineering and Technology Integration:\n\nModern engineering integrates advanced computational tools, sustainable design principles, and interdisciplinary collaboration to address complex global challenges. Technology development requires understanding both technical possibilities and societal needs.\n\nSystems thinking approaches engineering challenges holistically, considering technical, economic, environmental, and social factors. Design optimization uses mathematical modeling and computer simulation to achieve optimal solutions. Project management principles ensure efficient resource utilization and timely completion.\n\nEmerging technologies include artificial intelligence integration, renewable energy systems, and biotechnology applications. Sustainable engineering practices minimize environmental impact while maximizing social benefit. Interdisciplinary collaboration combines expertise from multiple fields for innovative solutions.\n\nCareer pathways: Develop programming skills for modern engineering tools. Study systems analysis for complex problem-solving. Understand project management for effective team leadership and technical project execution.`;
    }
    
    // Enhanced default response with adaptive learning suggestions
    return `🤖 Advanced STEM Learning Assistant v3.0:\n\nYour inquiry about "${question}" opens fascinating connections across multiple STEM disciplines. Let me provide a comprehensive framework for deep understanding and practical application.\n\nInterdisciplinary connections: STEM fields are increasingly interconnected, with breakthrough discoveries often occurring at field boundaries. Mathematics provides the quantitative foundation for scientific analysis. Science informs engineering design principles. Technology enables advanced research methodologies and practical applications.\n\nLearning optimization strategies: Start with fundamental concepts before advancing to complex applications. Use visual representations and hands-on experiments to reinforce theoretical understanding. Practice problem-solving with real-world scenarios to develop practical skills.\n\nNext steps for exploration: Specify your current knowledge level for personalized recommendations. Identify your learning objectives whether academic, professional, or personal interest. Consider practical applications relevant to your goals and interests.\n\nHow can I help you dive deeper into this fascinating area of STEM knowledge?`;
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
    setInputText('');
    setIsLoading(true);

    try {
      let aiResponse = '';
      
      // Try to get AI response from Groq first
      try {
        if (groq && isGroqConfigured) {
          const response = await groq.chat.completions.create({
            messages: [
              {
                role: 'system',
                content: 'You are Research and STEM-GPT v3.0, an advanced educational AI assistant with enhanced capabilities. Provide comprehensive, insightful explanations about STEM topics and research methodology. Your v3.0 features include: deeper subject analysis, interdisciplinary connections, practical application guidance, adaptive learning recommendations, and career pathway insights. Focus on helping students develop critical thinking and connect theoretical concepts to real-world applications. Provide multiple learning pathways and suggest next steps for continued exploration. Write in clean, engaging paragraphs with clear structure and practical examples.'
              },
              {
                role: 'user',
                content: inputText
              }
            ],
            model: 'llama3-70b-8192',
            temperature: 0.3,
            max_tokens: 800
          });

          const rawResponse = response.choices[0]?.message?.content || '';
          aiResponse = formatAIResponse(rawResponse);
        }
      } catch (apiError) {
        console.log('Groq API not available, using fallback response');
      }

      // Create comprehensive response
      let fullResponse = '';
      
      if (aiResponse && aiResponse.trim().length > 10) {
        fullResponse = aiResponse;
      } else {
        // Enhanced fallback responses with actual educational content
        fullResponse = generateEducationalResponse(inputText);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Error:', error);
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

  // Create Resource Panel Component
  const ResourcePanel = () => (
    <div className={`fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out ${
      showResourcePanel ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className={getContrastClass(
        "h-full bg-gradient-to-br from-white/85 via-blue-50/80 to-purple-50/85 backdrop-blur-xl border-l border-blue-200 shadow-2xl",
        "h-full bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl border-l-2 border-yellow-400 shadow-2xl"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
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
          <div>
            <h4 className={getContrastClass("font-medium text-gray-800 mb-3", "font-medium text-yellow-300 mb-3")}>📐 Mathematics</h4>
            <div className="space-y-2">
              {[
                { name: "Khan Academy Math", url: "https://www.khanacademy.org/math" },
                { name: "OpenStax Math", url: "https://openstax.org/subjects/math" },
                { name: "Wolfram Alpha", url: "https://www.wolframalpha.com" },
                { name: "GeoGebra", url: "https://www.geogebra.org" },
                { name: "Paul's Online Math Notes", url: "https://tutorial.math.lamar.edu" },
                { name: "Brilliant Math", url: "https://brilliant.org/courses/algebra/" },
                { name: "PatrickJMT", url: "https://patrickjmt.com" },
                { name: "Professor Leonard", url: "https://www.youtube.com/c/ProfessorLeonard" }
              ].map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={getContrastClass(
                    "block p-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors",
                    "block p-2 rounded-lg text-sm text-yellow-200 hover:bg-gray-800 transition-colors"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{resource.name}</span>
                    <ExternalLink size={12} />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Science */}
          <div>
            <h4 className={getContrastClass("font-medium text-gray-800 mb-3", "font-medium text-yellow-300 mb-3")}>🔬 Science</h4>
            <div className="space-y-2">
              {[
                { name: "PhET Simulations", url: "https://phet.colorado.edu" },
                { name: "NASA Education", url: "https://www.nasa.gov/audience/foreducators/" },
                { name: "OpenStax Science", url: "https://openstax.org/subjects/science" },
                { name: "NOAA Education", url: "https://www.noaa.gov/education" },
                { name: "LabXchange", url: "https://www.labxchange.org" },
                { name: "ChemCollective", url: "https://www.chemcollective.org" },
                { name: "OLabs Virtual Labs", url: "https://www.olabs.edu.in" },
                { name: "Crash Course Science", url: "https://www.youtube.com/c/crashcourse" }
              ].map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={getContrastClass(
                    "block p-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors",
                    "block p-2 rounded-lg text-sm text-yellow-200 hover:bg-gray-800 transition-colors"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{resource.name}</span>
                    <ExternalLink size={12} />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Technology */}
          <div>
            <h4 className={getContrastClass("font-medium text-gray-800 mb-3", "font-medium text-yellow-300 mb-3")}>💻 Technology</h4>
            <div className="space-y-2">
              {[
                { name: "FreeCodeCamp", url: "https://www.freecodecamp.org" },
                { name: "MIT OpenCourseWare", url: "https://ocw.mit.edu" },
                { name: "Coursera Free", url: "https://www.coursera.org/courses?query=free" },
                { name: "edX Courses", url: "https://www.edx.org" }
              ].map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={getContrastClass(
                    "block p-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors",
                    "block p-2 rounded-lg text-sm text-yellow-200 hover:bg-gray-800 transition-colors"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{resource.name}</span>
                    <ExternalLink size={12} />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Research */}
          <div>
            <h4 className={getContrastClass("font-medium text-gray-800 mb-3", "font-medium text-yellow-300 mb-3")}>🔍 Research</h4>
            <div className="space-y-2">
              {[
                { name: "Google Scholar", url: "https://scholar.google.com" },
                { name: "arXiv Preprints", url: "https://arxiv.org" },
                { name: "PubMed", url: "https://www.ncbi.nlm.nih.gov/pubmed/" },
                { name: "Open Access Journals", url: "https://doaj.org" }
              ].map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={getContrastClass(
                    "block p-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors",
                    "block p-2 rounded-lg text-sm text-yellow-200 hover:bg-gray-800 transition-colors"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{resource.name}</span>
                    <ExternalLink size={12} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={getContrastClass(
      "fixed inset-0 bg-gray-50 z-50 flex flex-col",
      "fixed inset-0 bg-black z-50 flex flex-col"
    )}>
      {/* Header */}
      <div className={getContrastClass(
        "bg-white border-b border-gray-200 p-4",
        "bg-gray-900 border-b-2 border-yellow-400 p-4"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={getContrastClass(
                "p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors",
                "p-2 rounded-lg text-yellow-400 hover:bg-gray-800 transition-colors"
              )}
            >
              <ArrowLeft size={20} />
            </button>
            <Bot size={24} className={getContrastClass("text-gray-700", "text-yellow-400")} />
            <div>
              <h1 className={getContrastClass(
                "text-lg font-semibold text-gray-900",
                "text-lg font-semibold text-yellow-400"
              )}>
                Research and STEM-GPT v3.0
              </h1>
              <p className={getContrastClass(
                "text-sm text-gray-600",
                "text-sm text-yellow-200"
              )}>
                Enhanced AI for STEM learning and research
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowResourcePanel(true)}
            className={getContrastClass(
              "flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors",
              "flex items-center gap-2 px-4 py-2 bg-gray-800 text-yellow-400 border border-yellow-400 rounded-lg hover:bg-gray-700 transition-colors"
            )}
          >
            <BookOpen size={16} />
            Resource Links
          </button>
        </div>
      </div>

      {/* Conversation Area */}
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
              className={`max-w-[85%] p-4 rounded-2xl ${
                message.role === 'user'
                  ? getContrastClass(
                      'bg-blue-500 text-white ml-auto',
                      'bg-yellow-400 text-black ml-auto'
                    )
                  : getContrastClass(
                      'bg-white border border-gray-200 text-gray-900',
                      'bg-gray-800 border border-yellow-400 text-yellow-200'
                    )
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
              <p className={`text-xs mt-2 opacity-70`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
            {message.role === 'user' && (
              <div className={getContrastClass(
                "w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0",
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
              "bg-white border border-gray-200 text-gray-900 p-4 rounded-2xl",
              "bg-gray-800 border border-yellow-400 text-yellow-200 p-4 rounded-2xl"
            )}>
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - ChatGPT Style */}
      <div className={getContrastClass(
        "border-t border-gray-200 bg-white p-4",
        "border-t-2 border-yellow-400 bg-black p-4"
      )}>
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about math, science, engineering, technology, or research methodology..."
                className={getContrastClass(
                  "w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  "w-full p-3 border border-gray-600 bg-gray-900 text-yellow-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
                )}
                rows={Math.min(Math.max(inputText.split('\n').length, 1), 6)}
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
      
      {/* Backdrop for Resource Panel */}
      {showResourcePanel && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setShowResourcePanel(false)}
        />
      )}
    </div>
  );
}