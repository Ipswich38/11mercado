import React from 'react';
import { ChevronRight, ExternalLink } from 'lucide-react';

export default function STEMTools({ aiSTEMTools, stemLinks, getContrastClass, onToolSelect }) {
  const handleLinkClick = (url) => {
    window.open(url, '_blank');
  };
  return (
    <div className="p-4 space-y-4">
      <div className={getContrastClass(
        "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
        "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
      )}>
        <h2 className={getContrastClass(
          "text-2xl font-light text-slate-900 mb-2",
          "text-2xl font-light text-yellow-400 mb-2"
        )}>
          STEM Resources
        </h2>
        <p className={getContrastClass(
          "text-slate-600",
          "text-yellow-200"
        )}>
          AI-powered tools and educational resources for STEM learning • College Entrance Exam Quiz Generator now available!
        </p>
      </div>

      {/* AI STEM Tools Section */}
      <div>
        <h3 className={getContrastClass(
          "text-lg font-semibold text-slate-900 mb-3",
          "text-lg font-semibold text-yellow-400 mb-3"
        )}>
          🤖 AI-Powered Tools
        </h3>
        <div className="space-y-4">
          {aiSTEMTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => {
                if (tool.id === 1) { // College Entrance Exam Quiz Generator
                  onToolSelect('upcat-quiz-generator');
                } else if (tool.id === 2) { // AI Scientific Calculator
                  onToolSelect('ai-scientific-calculator');
                } else if (tool.id === 3) { // AI Assistant (Combined)
                  onToolSelect('ai-assistant');
                } else {
                  // Handle other AI tools here in the future
                  console.log(`Opening ${tool.name}`);
                }
              }}
              className={getContrastClass(
                `bg-gradient-to-r ${tool.color} p-6 rounded-3xl shadow-xl cursor-pointer transform transition-all hover:scale-105 active:scale-95`,
                `bg-gray-900 p-6 rounded-3xl shadow-xl cursor-pointer transform transition-all hover:scale-105 active:scale-95 border-2 border-yellow-400`
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">{tool.icon}</div>
                <div className="bg-white/20 px-3 py-1 rounded-full">
                  <span className="text-white text-xs font-medium">{tool.category}</span>
                </div>
              </div>
              
              <h3 className="text-white font-bold text-xl mb-2">
                {tool.name}
              </h3>
              
              <p className="text-white/90 text-sm mb-4">
                {tool.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {tool.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="bg-white/20 text-white text-xs px-2 py-1 rounded-lg"
                  >
                    {subject}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Tap to access</span>
                <ChevronRight className="text-white" size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STEM Links Section */}
      <div>
        <h3 className={getContrastClass(
          "text-lg font-semibold text-slate-900 mb-3",
          "text-lg font-semibold text-yellow-400 mb-3"
        )}>
          📚 Educational Resources
        </h3>
        <div className="space-y-4">
          {stemLinks.map((link) => (
            <div
              key={link.id}
              onClick={() => handleLinkClick(link.url)}
              className={getContrastClass(
                "bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/20 cursor-pointer transform transition-all hover:scale-105 active:scale-95",
                "bg-gray-900 p-6 rounded-3xl shadow-xl border-2 border-yellow-400 cursor-pointer transform transition-all hover:scale-105 active:scale-95"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{link.icon}</div>
                  <div>
                    <h3 className={getContrastClass(
                      "text-xl font-semibold text-slate-900",
                      "text-xl font-semibold text-yellow-400"
                    )}>
                      {link.name}
                    </h3>
                    <div className={getContrastClass(
                      "bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full inline-block mt-1",
                      "bg-gray-800 text-yellow-400 text-xs px-2 py-1 rounded-full inline-block mt-1"
                    )}>
                      {link.category}
                    </div>
                  </div>
                </div>
                <ExternalLink className={getContrastClass("text-slate-400", "text-yellow-400")} size={20} />
              </div>
              
              <p className={getContrastClass(
                "text-slate-600 text-sm mb-4 leading-relaxed",
                "text-yellow-200 text-sm mb-4 leading-relaxed"
              )}>
                {link.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {link.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className={getContrastClass(
                      "bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-lg",
                      "bg-gray-800 text-yellow-300 text-xs px-3 py-1 rounded-lg"
                    )}
                  >
                    {subject}
                  </span>
                ))}
              </div>
              
              <div className={getContrastClass(
                "text-blue-600 text-sm font-medium hover:underline",
                "text-yellow-300 text-sm font-medium hover:underline"
              )}>
                Visit {link.name} →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tip */}
      <div className={getContrastClass(
        "bg-blue-50 border border-blue-200 rounded-3xl p-4",
        "bg-gray-900 border-2 border-yellow-400 rounded-3xl p-4"
      )}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-600">💡</span>
          <h3 className={getContrastClass(
            "font-semibold text-blue-800",
            "font-semibold text-yellow-400"
          )}>
            Pro Tip
          </h3>
        </div>
        <p className={getContrastClass(
          "text-blue-700 text-sm",
          "text-yellow-200 text-sm"
        )}>
          All AI-powered STEM tools are now available! College Entrance Exam Quiz Generator, AI Scientific Calculator, AI Research Tool, and STEM GPT Tools are ready for learning.
        </p>
      </div>
    </div>
  );
}