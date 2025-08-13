import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function STEMLinks({ stemLinks, getContrastClass }) {
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
          STEM Educational Resources
        </h2>
        <p className={getContrastClass(
          "text-slate-600",
          "text-yellow-200"
        )}>
          Free online resources for science, technology, engineering, and mathematics
        </p>
      </div>

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
          These resources are completely free! Create accounts on Khan Academy and Coursera to track your progress and earn certificates.
        </p>
      </div>
    </div>
  );
}