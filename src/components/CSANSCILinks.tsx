import React from 'react';
import { ExternalLink, School, FileText, Calendar, Users, BookOpen, MapPin } from 'lucide-react';

export default function CSANSCILinks({ getContrastClass }) {
  const links = [
    {
      id: 1,
      name: "CSANSCI Facebook Page",
      description: "Official school Facebook page for updates and announcements",
      url: "https://www.facebook.com/csjdmnshs",
      icon: <School size={24} />,
      color: "from-blue-500 to-blue-600"
    },
    {
      id: 2,
      name: "DepEd CSANSCI Website",
      description: "Official DepEd school website with academic resources",
      url: "https://depedcsjdmnshs.weebly.com/",
      icon: <FileText size={24} />,
      color: "from-green-500 to-green-600"
    },
    {
      id: 3,
      name: "SJDM LGU Facebook",
      description: "San Jose del Monte City Local Government Unit official page",
      url: "https://www.facebook.com/sjdmpio",
      icon: <MapPin size={24} />,
      color: "from-red-500 to-pink-600"
    }
  ];

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
          School Links
        </h2>
        <p className={getContrastClass(
          "text-slate-600",
          "text-yellow-200"
        )}>
          Official CSANSCI (CSJDM NHS) and local government links
        </p>
      </div>

      <div className="space-y-4">
        {links.map((link) => (
          <div
            key={link.id}
            onClick={() => handleLinkClick(link.url)}
            className={getContrastClass(
              `bg-gradient-to-r ${link.color} p-6 rounded-3xl shadow-xl cursor-pointer transform transition-all hover:scale-105 active:scale-95`,
              `bg-gray-900 p-6 rounded-3xl shadow-xl cursor-pointer transform transition-all hover:scale-105 active:scale-95 border-2 border-yellow-400`
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-white">
                {link.icon}
              </div>
              <ExternalLink className="text-white/60" size={20} />
            </div>
            
            <h3 className="text-white font-bold text-xl mb-2">
              {link.name}
            </h3>
            
            <p className="text-white/90 text-sm mb-4">
              {link.description}
            </p>
            
            <div className="text-white/70 text-xs">
              {link.url}
            </div>
          </div>
        ))}
      </div>
      
      <div className={getContrastClass(
        "bg-amber-50 border border-amber-200 rounded-3xl p-4",
        "bg-gray-900 border-2 border-yellow-400 rounded-3xl p-4"
      )}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-amber-600">⚠️</span>
          <h3 className={getContrastClass(
            "font-semibold text-amber-800",
            "font-semibold text-yellow-400"
          )}>
            Note
          </h3>
        </div>
        <p className={getContrastClass(
          "text-amber-700 text-sm",
          "text-yellow-200 text-sm"
        )}>
          These links will open in your default browser. Make sure you're connected to the internet.
        </p>
      </div>
    </div>
  );
}