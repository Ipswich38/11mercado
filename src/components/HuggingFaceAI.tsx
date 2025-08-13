import React, { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';

export default function HuggingFaceAI({ getContrastClass, onClose }) {
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setResponse('');
    
    try {
      // Get relevant resources based on the question
      const relevantResources = getRelevantResources(inputText);
      
      // Create a comprehensive response with resources
      let aiResponse = '';
      
      // Try to get AI response first
      try {
        const apiResponse = await fetch(
          "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY || 'hf_demo'}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              inputs: `You are Research and STEM-GPT. Provide a clear, educational answer about: ${inputText}`,
              parameters: {
                max_new_tokens: 200,
                temperature: 0.7,
                return_full_text: false
              }
            }),
          }
        );
        
        if (apiResponse.ok) {
          const result = await apiResponse.json();
          if (result && result.length > 0 && result[0].generated_text) {
            aiResponse = result[0].generated_text;
          }
        }
      } catch (apiError) {
        console.log('API not available, using fallback response');
      }

      // Create comprehensive response
      let fullResponse = '';
      
      if (aiResponse) {
        fullResponse = `🤖 AI Response:\n${aiResponse}\n\n`;
      } else {
        // Fallback educational response
        if (inputText.toLowerCase().includes('molecule')) {
          fullResponse = `🤖 About Molecules:\n\nMolecules are groups of two or more atoms held together by chemical bonds. They are the smallest units of chemical compounds that retain the chemical properties of that compound. For example, a water molecule (H₂O) consists of two hydrogen atoms and one oxygen atom.\n\n`;
        } else {
          fullResponse = `🤖 Research and STEM-GPT Response:\n\nI'm analyzing your question about "${inputText}". This appears to be a ${inputText.toLowerCase().includes('research') ? 'research methodology' : 'STEM'} topic that requires detailed exploration.\n\n`;
        }
      }

      // Add relevant resources
      if (relevantResources.length > 0) {
        fullResponse += `📚 Recommended Resources:\n\n`;
        relevantResources.forEach(resource => {
          fullResponse += `${resource}\n`;
        });
        fullResponse += `\n💡 These credible, open-source resources will provide detailed information and interactive tools for deeper understanding.`;
      } else {
        // Add general resources if no specific match
        fullResponse += `📚 General STEM Resources:\n\n📐 Khan Academy: https://www.khanacademy.org\n🔬 PhET Simulations: https://phet.colorado.edu\n📚 OpenStax Textbooks: https://openstax.org\n🔍 Google Scholar: https://scholar.google.com`;
      }

      setResponse(fullResponse);
      
    } catch (error) {
      console.error('Error:', error);
      const fallbackResources = getRelevantResources(inputText);
      let fallbackResponse = `🤖 Question: "${inputText}"\n\nI'm Research and STEM-GPT, here to help with STEM subjects and research methodology.\n\n`;
      
      if (fallbackResources.length > 0) {
        fallbackResponse += `📚 Relevant Resources:\n\n`;
        fallbackResources.forEach(resource => {
          fallbackResponse += `${resource}\n`;
        });
      }
      
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
            Hugging Face AI
          </div>
        </div>
        <p className={getContrastClass(
          "text-gray-600 text-sm",
          "text-yellow-200 text-sm"
        )}>
          Powered by Hugging Face AI models • STEM subjects and research methodology
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
              Powered by Hugging Face AI
            </h4>
          </div>
          <p className={getContrastClass("text-blue-800 text-sm", "text-blue-200 text-sm")}>
            Open-source AI models for STEM education and research methodology guidance. Perfect for students and researchers.
          </p>
        </div>
      </div>
    </div>
  );
}