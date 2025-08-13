import React from 'react';
import { Mail, Calendar } from 'lucide-react';

export default function OfficersApp({ officers, getContrastClass }) {
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
          Meet Our Officers
        </h2>
        <p className={getContrastClass(
          "text-slate-600",
          "text-yellow-200"
        )}>
          Get to know your PTA leadership team
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
  );
}