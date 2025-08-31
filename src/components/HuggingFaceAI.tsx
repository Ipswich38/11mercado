import React, { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import groq, { isGroqConfigured } from '../utils/groqClient';

export default function HuggingFaceAI({ getContrastClass, onClose }) {
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Clean and format AI response text
  const formatAIResponse = (text) => {
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
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setResponse('');
    
    try {
      // Get relevant resources based on the question
      const relevantResources = getRelevantResources(inputText);
      
      // Create a comprehensive response with resources
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
            max_tokens: 500
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
        fullResponse = `🤖 AI Response:\n${aiResponse}\n\n`;
        // Only add resources if the AI response is short or seems incomplete
        if (aiResponse.length < 100) {
          fullResponse += `📚 For more information:\n${relevantResources.slice(0, 2).join('\n')}\n\n`;
        }
      } else {
        // Enhanced fallback responses with actual educational content
        fullResponse = generateEducationalResponse(inputText);
        
        // Add a few relevant resources only if the question is very specific
        if (relevantResources.length > 0 && inputText.length > 20) {
          fullResponse += `\n\n📚 Additional Resources:\n${relevantResources.slice(0, 3).join('\n')}`;
        }
      }

      setResponse(fullResponse);
      
    } catch (error) {
      console.error('Error:', error);
      // Use the same educational response system for errors
      const fallbackResponse = generateEducationalResponse(inputText);
      setResponse(fallbackResponse);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className={getContrastClass(
        "bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/30 mb-6",
        "bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border-2 border-yellow-400/50 mb-6"
      )}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className={getContrastClass(
              "p-2 rounded-xl text-gray-600 hover:bg-gray-100",
              "p-2 rounded-xl text-yellow-400 hover:bg-gray-800"
            )}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className={getContrastClass(
            "text-xl font-light text-gray-900",
            "text-xl font-light text-yellow-400"
          )}>
            Research and STEM-GPT v3.0
          </h1>
          <div className={getContrastClass(
            "text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full",
            "text-xs bg-gray-800 text-blue-400 px-3 py-1 rounded-full border border-blue-400"
          )}>
            Enhanced KreativLoops AI
          </div>
        </div>
        <p className={getContrastClass(
          "text-gray-600 text-sm",
          "text-yellow-200 text-sm"
        )}>
          Enhanced AI v3.0 • Advanced STEM analysis and interdisciplinary learning
        </p>
      </div>

      {/* Main Content */}
      <div className={getContrastClass(
        "bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/30 space-y-6",
        "bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border-2 border-yellow-400/50 space-y-6"
      )}>
        {/* Input Section */}
        <div>
          <h3 className={getContrastClass("font-semibold text-gray-900 mb-4", "font-semibold text-yellow-400 mb-4")}>
            Ask about STEM or Research
          </h3>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about math, science, engineering, technology, or research methodology..."
            className={getContrastClass(
              "w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500",
              "w-full h-32 p-4 bg-gray-800 border border-yellow-400 text-yellow-100 rounded-lg resize-none focus:ring-2 focus:ring-yellow-400"
            )}
          />
          
          <button
            onClick={handleSubmit}
            disabled={!inputText.trim() || isLoading}
            className={getContrastClass(
              "mt-4 flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50",
              "mt-4 flex items-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-300 disabled:opacity-50"
            )}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <Send size={16} />
                Ask AI
              </>
            )}
          </button>
        </div>

        {/* Response Section */}
        {response && (
          <div className={getContrastClass(
            "bg-blue-50/70 backdrop-blur-md rounded-xl p-6 border border-blue-200/50",
            "bg-gray-800/70 backdrop-blur-md rounded-xl p-6 border border-yellow-400/50"
          )}>
            <h3 className={getContrastClass("font-semibold text-blue-900 mb-4", "font-semibold text-yellow-400 mb-4")}>
              Research and STEM-GPT Response
            </h3>
            <div className={getContrastClass(
              "text-blue-900 whitespace-pre-wrap leading-relaxed",
              "text-yellow-100 whitespace-pre-wrap leading-relaxed"
            )}>
              {response}
            </div>
          </div>
        )}

        {/* Open Source STEM Resources */}
        <div className={getContrastClass(
          "bg-green-50/70 backdrop-blur-md rounded-xl p-6 border border-green-200/50",
          "bg-gray-900/70 backdrop-blur-md rounded-xl p-6 border border-green-400/50"
        )}>
          <h3 className={getContrastClass("font-semibold text-green-900 mb-4", "font-semibold text-green-400 mb-4")}>
            📚 Open Source STEM & Research Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className={getContrastClass("font-medium text-green-800", "font-medium text-green-300")}>📐 Mathematics</h4>
              <ul className={getContrastClass("text-green-700 text-sm space-y-1", "text-green-200 text-sm space-y-1")}>
                <li>• <a href="https://www.khanacademy.org/math" target="_blank" rel="noopener noreferrer" className="hover:underline">Khan Academy Mathematics</a></li>
                <li>• <a href="https://openstax.org/subjects/math" target="_blank" rel="noopener noreferrer" className="hover:underline">OpenStax Math Textbooks</a></li>
                <li>• <a href="https://www.wolframalpha.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Wolfram Alpha Calculator</a></li>
                <li>• <a href="https://www.geogebra.org" target="_blank" rel="noopener noreferrer" className="hover:underline">GeoGebra Math Tools</a></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className={getContrastClass("font-medium text-green-800", "font-medium text-green-300")}>🔬 Science</h4>
              <ul className={getContrastClass("text-green-700 text-sm space-y-1", "text-green-200 text-sm space-y-1")}>
                <li>• <a href="https://phet.colorado.edu" target="_blank" rel="noopener noreferrer" className="hover:underline">PhET Interactive Simulations</a></li>
                <li>• <a href="https://www.nasa.gov/audience/foreducators/" target="_blank" rel="noopener noreferrer" className="hover:underline">NASA Educational Resources</a></li>
                <li>• <a href="https://openstax.org/subjects/science" target="_blank" rel="noopener noreferrer" className="hover:underline">OpenStax Science Books</a></li>
                <li>• <a href="https://www.noaa.gov/education" target="_blank" rel="noopener noreferrer" className="hover:underline">NOAA Education Resources</a></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className={getContrastClass("font-medium text-green-800", "font-medium text-green-300")}>💻 Technology</h4>
              <ul className={getContrastClass("text-green-700 text-sm space-y-1", "text-green-200 text-sm space-y-1")}>
                <li>• <a href="https://www.freecodecamp.org" target="_blank" rel="noopener noreferrer" className="hover:underline">FreeCodeCamp</a></li>
                <li>• <a href="https://ocw.mit.edu" target="_blank" rel="noopener noreferrer" className="hover:underline">MIT OpenCourseWare</a></li>
                <li>• <a href="https://www.coursera.org/courses?query=free" target="_blank" rel="noopener noreferrer" className="hover:underline">Coursera Free Courses</a></li>
                <li>• <a href="https://www.edx.org" target="_blank" rel="noopener noreferrer" className="hover:underline">edX Free Courses</a></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className={getContrastClass("font-medium text-green-800", "font-medium text-green-300")}>🔍 Research</h4>
              <ul className={getContrastClass("text-green-700 text-sm space-y-1", "text-green-200 text-sm space-y-1")}>
                <li>• <a href="https://scholar.google.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Google Scholar</a></li>
                <li>• <a href="https://arxiv.org" target="_blank" rel="noopener noreferrer" className="hover:underline">arXiv Preprints</a></li>
                <li>• <a href="https://www.ncbi.nlm.nih.gov/pubmed/" target="_blank" rel="noopener noreferrer" className="hover:underline">PubMed Database</a></li>
                <li>• <a href="https://doaj.org" target="_blank" rel="noopener noreferrer" className="hover:underline">Directory of Open Access Journals</a></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className={getContrastClass("font-medium text-green-800", "font-medium text-green-300")}>⚙️ Engineering</h4>
              <ul className={getContrastClass("text-green-700 text-sm space-y-1", "text-green-200 text-sm space-y-1")}>
                <li>• <a href="https://www.engineeringtoolbox.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Engineering ToolBox</a></li>
                <li>• <a href="https://www.autodesk.com/education/edu-software" target="_blank" rel="noopener noreferrer" className="hover:underline">Autodesk Education (Free)</a></li>
                <li>• <a href="https://www.solidworks.com/sw/education/" target="_blank" rel="noopener noreferrer" className="hover:underline">SolidWorks Student Edition</a></li>
                <li>• <a href="https://www.analog.com/en/education.html" target="_blank" rel="noopener noreferrer" className="hover:underline">Analog Devices University</a></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className={getContrastClass("font-medium text-green-800", "font-medium text-green-300")}>🧪 Laboratory</h4>
              <ul className={getContrastClass("text-green-700 text-sm space-y-1", "text-green-200 text-sm space-y-1")}>
                <li>• <a href="https://www.labxchange.org" target="_blank" rel="noopener noreferrer" className="hover:underline">LabXchange Virtual Labs</a></li>
                <li>• <a href="https://www.chemcollective.org" target="_blank" rel="noopener noreferrer" className="hover:underline">ChemCollective Virtual Labs</a></li>
                <li>• <a href="https://www.merlot.org" target="_blank" rel="noopener noreferrer" className="hover:underline">MERLOT Science Resources</a></li>
                <li>• <a href="https://www.olabs.edu.in" target="_blank" rel="noopener noreferrer" className="hover:underline">Online Labs (OLabs)</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* AI Info Section */}
        <div className={getContrastClass(
          "bg-blue-50/70 backdrop-blur-md rounded-xl p-4 border border-blue-200/50",
          "bg-gray-800/70 backdrop-blur-md rounded-xl p-4 border border-blue-400/50"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-blue-600">🤖</div>
            <h4 className={getContrastClass("font-medium text-blue-900", "font-medium text-blue-400")}>
              Powered by KreativLoops AI
            </h4>
          </div>
          <p className={getContrastClass("text-blue-800 text-sm", "text-blue-200 text-sm")}>
            Advanced AI technology for STEM education and research methodology guidance. Fast, accurate responses for students and researchers.
          </p>
        </div>
      </div>
    </div>
  );
}