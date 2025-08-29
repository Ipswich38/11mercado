import React from 'react';
import { Mail, Calendar, ArrowLeft } from 'lucide-react';

export default function Officers({ onClose, getContrastClass }) {
  // Same officer data as in App.tsx
  const officers = [
    {
      id: 1,
      name: "Cherwin Fernandez",
      position: "President",
      email: "11mercado.pta@gmail.com",
      term: "2025-2026",
      photo: "👨‍💼",
      bio: "Dedicated leader committed to advancing educational excellence and community engagement."
    },
    {
      id: 2,
      name: "Dante Navarro",
      position: "Vice President",
      email: "11mercado.pta@gmail.com",
      term: "2025-2026",
      photo: "👨‍💼",
      bio: "Experienced advocate for student welfare and parent-teacher collaboration."
    },
    {
      id: 3,
      name: "Laarni Gilles",
      position: "Secretary",
      email: "11mercado.pta@gmail.com",
      term: "2025-2026",
      photo: "👩‍📋",
      bio: "Organized professional ensuring transparent communication and accurate record-keeping."
    },
    {
      id: 4,
      name: "Cyndee Delmendo",
      position: "Treasurer",
      email: "11mercado.pta@gmail.com",
      term: "2025-2026",
      photo: "👩‍💰",
      bio: "Financial expert dedicated to responsible fund management and fiscal transparency."
    },
    {
      id: 5,
      name: "Gina Genido",
      position: "Auditor",
      email: "11mercado.pta@gmail.com",
      term: "2025-2026",
      photo: "👩‍💼",
      bio: "Meticulous auditor ensuring accountability and proper oversight of PTA operations."
    }
  ];

  return (
    <div className={getContrastClass(
      "min-h-screen bg-surface-50",
      "min-h-screen bg-surface-900"
    )}>
      {/* Header */}
      <header className={getContrastClass(
        "glass border-b border-surface-300 sticky top-0 z-40 shadow-material",
        "glass-dark border-b border-surface-700 sticky top-0 z-40 shadow-material"
      )}>
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={getContrastClass(
                "btn-text state-layer p-3 rounded-material text-surface-700",
                "btn-text state-layer p-3 rounded-material text-surface-300"
              )}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className={getContrastClass(
                "text-title-large text-surface-900",
                "text-title-large text-surface-100"
              )}>
                Meet the Officers
              </h1>
              <p className={getContrastClass("text-body-small text-surface-600", "text-body-small text-surface-400")}>
                Your PTA Leadership Team
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <div className={getContrastClass(
          "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
          "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
        )}>
          <h2 className={getContrastClass(
            "text-2xl font-light text-slate-900 mb-2",
            "text-2xl font-light text-yellow-400 mb-2"
          )}>
            Meet Our Officers
          </h2>
          <p className={getContrastClass(
            "text-slate-600",
            "text-yellow-200"
          )}>
            Get to know your PTA leadership team • Contact information and profiles
          </p>
        </div>

        <div className="space-y-4">
          {officers.map((officer) => (
            <div
              key={officer.id}
              className={getContrastClass(
                "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
                "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
              )}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{officer.photo}</div>
                <div className="flex-1">
                  <h3 className={getContrastClass(
                    "text-xl font-semibold text-slate-900",
                    "text-xl font-semibold text-yellow-400"
                  )}>
                    {officer.name}
                  </h3>
                  <p className={getContrastClass(
                    "text-blue-600 font-medium mb-2",
                    "text-yellow-300 font-medium mb-2"
                  )}>
                    {officer.position}
                  </p>
                  <p className={getContrastClass(
                    "text-slate-600 text-sm leading-relaxed",
                    "text-yellow-200 text-sm leading-relaxed"
                  )}>
                    {officer.bio}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={18} className={getContrastClass("text-slate-500", "text-yellow-400")} />
                  <a
                    href={`mailto:${officer.email}`}
                    className={getContrastClass(
                      "text-blue-600 hover:underline",
                      "text-yellow-300 hover:underline"
                    )}
                  >
                    {officer.email}
                  </a>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar size={18} className={getContrastClass("text-slate-500", "text-yellow-400")} />
                  <span className={getContrastClass(
                    "text-slate-600 text-sm",
                    "text-yellow-200 text-sm"
                  )}>
                    Term: {officer.term}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}