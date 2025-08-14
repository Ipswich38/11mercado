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

  const generateEducationalResponse = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    // Mathematics responses
    if (lowerQuestion.includes('algebra') || lowerQuestion.includes('equation')) {
      return `About Algebra:\n\nAlgebra is the branch of mathematics that uses symbols and letters to represent numbers and quantities in formulas and equations. It allows us to solve problems by finding unknown values. This mathematical system helps us work with unknowns in a systematic way.\n\nKey concepts include variables like x and y that represent unknown numbers. Equations show relationships between quantities and you can perform the same operation on both sides of an equation. Common operations include addition, subtraction, multiplication, and division.\n\nFor example, if 2x + 5 = 15, then x = 5 because 2 times 5 plus 5 equals 15. This demonstrates how algebra helps us find unknown values through logical steps. Understanding these principles opens doors to more advanced mathematical concepts.`;
    }
    
    if (lowerQuestion.includes('geometry')) {
      return `About Geometry:\n\nGeometry is the study of shapes, sizes, relative positions of figures, and properties of space. It is fundamental to understanding the physical world around us. This branch of mathematics helps us analyze and work with spatial relationships.\n\nBasic elements include points which are exact locations with no size. Lines extend infinitely in both directions while angles are formed when two lines meet. Common shapes include circles, triangles, rectangles, and many other geometric figures.\n\nPractical applications are everywhere in our daily lives. Architecture, engineering, art, navigation, and computer graphics all rely heavily on geometric principles. Understanding geometry helps us solve real-world problems involving space and measurement.`;
    }
    
    // Science responses
    if (lowerQuestion.includes('molecule') || lowerQuestion.includes('chemistry')) {
      return `About Molecules and Chemistry:\n\nMolecules are groups of two or more atoms held together by chemical bonds. They are the building blocks of all matter around us. Understanding molecules is essential to comprehending how the physical world operates.\n\nKey facts include that water consists of 2 hydrogen atoms and 1 oxygen atom. Chemical bonds form when atoms share or transfer electrons. Molecules determine the properties of substances we encounter daily.\n\nExamples include oxygen gas, carbon dioxide, and glucose. Different arrangements of the same atoms create different compounds with unique properties. Understanding molecules helps explain everything from why water boils to how medicines work in our bodies.`;
    }
    
    if (lowerQuestion.includes('physics') || lowerQuestion.includes('force') || lowerQuestion.includes('energy')) {
      return `🤖 About Physics:\n\nPhysics is the science that seeks to understand how the universe works, from the smallest particles to the largest galaxies.\n\nFundamental concepts:\n• Force: a push or pull that can change motion\n• Energy: the ability to do work or cause change\n• Matter: anything that has mass and takes up space\n• Motion: change in position over time\n\nEveryday physics: When you walk, throw a ball, or use electricity, you're experiencing physics principles. Understanding these helps explain everything from why planes fly to how your smartphone works.`;
    }
    
    if (lowerQuestion.includes('biology') || lowerQuestion.includes('cell') || lowerQuestion.includes('life')) {
      return `🤖 About Biology:\n\nBiology is the study of living organisms and their interactions with each other and their environment.\n\nCore principles:\n• All living things are made of cells\n• Organisms need energy to survive and grow\n• DNA carries genetic information\n• Evolution explains the diversity of life\n• Ecosystems show how organisms interact\n\nFrom tiny bacteria to giant whales, biology helps us understand life processes like growth, reproduction, and adaptation to environments.`;
    }
    
    // Research methodology
    if (lowerQuestion.includes('research') || lowerQuestion.includes('study') || lowerQuestion.includes('methodology')) {
      return `🤖 About Research Methodology:\n\nResearch methodology is the systematic approach to investigating questions and solving problems using scientific methods.\n\nKey steps:\n1. Define your research question clearly\n2. Review existing literature and studies\n3. Choose appropriate research methods\n4. Collect and analyze data systematically\n5. Draw conclusions based on evidence\n6. Share findings with others\n\nGood research is objective, reproducible, and builds on previous knowledge. Whether studying human behavior, testing new medicines, or exploring space, proper methodology ensures reliable results.`;
    }
    
    // General STEM response
    if (lowerQuestion.includes('engineering') || lowerQuestion.includes('technology')) {
      return `🤖 About Engineering and Technology:\n\nEngineering applies scientific knowledge to design and build solutions that improve human life.\n\nMain branches:\n• Civil: Infrastructure like bridges and buildings\n• Mechanical: Machines and mechanical systems\n• Electrical: Electronics and power systems\n• Software: Computer programs and applications\n• Chemical: Chemical processes and materials\n\nEngineers solve real-world problems by combining creativity with scientific principles. From smartphones to space shuttles, engineering makes modern life possible.`;
    }
    
    // Default comprehensive response
    return `🤖 Research and STEM-GPT Response:\n\nI'm here to help with STEM subjects and research methodology! Your question about "${question}" touches on important scientific concepts.\n\nTo provide you with the most helpful answer, could you be more specific about what aspect you'd like to explore? For example:\n• Are you looking for basic definitions and concepts?\n• Do you need help with problem-solving steps?\n• Are you working on a specific assignment or project?\n• Would you like to understand real-world applications?\n\nSTEM fields are interconnected - mathematics provides tools for science, science informs engineering, and technology enables new research. I'm here to help you understand these connections and concepts clearly.`;
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
                content: 'You are Research and STEM-GPT, an educational AI assistant. Provide clear, detailed, and educational explanations about STEM topics and research methodology. Focus on helping students understand concepts with examples and practical applications. Keep responses informative but accessible. Write in clean, readable paragraphs without using asterisks, bold text, or markdown formatting. Use simple, clear language organized in easy-to-read paragraphs.'
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
            Research and STEM-GPT
          </h1>
          <div className={getContrastClass(
            "text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full",
            "text-xs bg-gray-800 text-blue-400 px-3 py-1 rounded-full border border-blue-400"
          )}>
            KreativLoops AI
          </div>
        </div>
        <p className={getContrastClass(
          "text-gray-600 text-sm",
          "text-yellow-200 text-sm"
        )}>
          Powered by KreativLoops AI • STEM subjects and research methodology
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