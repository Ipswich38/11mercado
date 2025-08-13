import React from 'react';
import { ArrowLeft, Shield, AlertTriangle, Mail, User } from 'lucide-react';

export default function Legal({ getContrastClass, onClose }) {
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
            Legal Information
          </h1>
          <div className={getContrastClass(
            "text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full",
            "text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-400"
          )}>
            Important
          </div>
        </div>
        <p className={getContrastClass(
          "text-gray-600 text-sm",
          "text-yellow-200 text-sm"
        )}>
          Privacy policy, terms & conditions, and important disclaimers
        </p>
      </div>

      {/* Early Stage Disclaimer */}
      <div className={getContrastClass(
        "bg-orange-50/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-orange-200/50 mb-6",
        "bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border-2 border-orange-400/50 mb-6"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className={getContrastClass("text-orange-600", "text-orange-400")} size={24} />
          <h2 className={getContrastClass("text-xl font-semibold text-orange-900", "text-xl font-semibold text-orange-400")}>
            Early Stage Development Notice
          </h2>
        </div>
        <div className={getContrastClass("text-orange-800 space-y-3", "text-orange-200 space-y-3")}>
          <p>
            <strong>⚠️ This platform is currently in early development stage.</strong>
          </p>
          <p>
            You may encounter bugs, issues, or unexpected behavior. We appreciate your patience as we work to improve the system.
          </p>
          <p>
            <strong>For technical support or to report issues:</strong>
          </p>
          <div className="flex items-center gap-2 bg-orange-100 dark:bg-gray-800 p-3 rounded-lg">
            <Mail className={getContrastClass("text-orange-600", "text-orange-400")} size={16} />
            <a href="mailto:kreativloops@gmail.com" className={getContrastClass("text-orange-700 hover:underline", "text-orange-300 hover:underline")}>
              kreativloops@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Project Initiative */}
      <div className={getContrastClass(
        "bg-blue-50/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-blue-200/50 mb-6",
        "bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border-2 border-blue-400/50 mb-6"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <User className={getContrastClass("text-blue-600", "text-blue-400")} size={24} />
          <h2 className={getContrastClass("text-xl font-semibold text-blue-900", "text-xl font-semibold text-blue-400")}>
            Project Initiative
          </h2>
        </div>
        <div className={getContrastClass("text-blue-800 space-y-3", "text-blue-200 space-y-3")}>
          <p>
            <strong>📋 This is NOT an official CSANSCI platform.</strong>
          </p>
          <p>
            This is an independent initiative project developed by <strong>Cherwin Fernandez</strong>, HRPTA President of 11-Mercado, 
            to support students and parents with digital tools and resources.
          </p>
          <p>
            The platform aims to provide educational resources, community engagement tools, and administrative support 
            for the 11-Mercado class community.
          </p>
        </div>
      </div>

      {/* Data Privacy Statement */}
      <div className={getContrastClass(
        "bg-green-50/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-green-200/50 mb-6",
        "bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border-2 border-green-400/50 mb-6"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <Shield className={getContrastClass("text-green-600", "text-green-400")} size={24} />
          <h2 className={getContrastClass("text-xl font-semibold text-green-900", "text-xl font-semibold text-green-400")}>
            Data Privacy Statement
          </h2>
        </div>
        <div className={getContrastClass("text-green-800 space-y-3", "text-green-200 space-y-3")}>
          <h3 className="font-semibold">Information We Collect:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Basic usage analytics for platform improvement</li>
            <li>Community posts and messages (if you choose to share)</li>
            <li>Contact information (only when voluntarily provided)</li>
          </ul>
          
          <h3 className="font-semibold">How We Use Your Information:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>To provide and improve platform functionality</li>
            <li>To facilitate community communication</li>
            <li>To respond to support requests</li>
          </ul>
          
          <h3 className="font-semibold">Data Protection:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>We do not sell or share personal information with third parties</li>
            <li>All data is stored securely with appropriate safeguards</li>
            <li>You can request data deletion by contacting us</li>
          </ul>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className={getContrastClass(
        "bg-purple-50/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-purple-200/50 mb-6",
        "bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border-2 border-purple-400/50 mb-6"
      )}>
        <h2 className={getContrastClass("text-xl font-semibold text-purple-900 mb-4", "text-xl font-semibold text-purple-400 mb-4")}>
          Terms & Conditions
        </h2>
        <div className={getContrastClass("text-purple-800 space-y-3", "text-purple-200 space-y-3")}>
          <h3 className="font-semibold">Acceptable Use:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Use the platform respectfully and appropriately</li>
            <li>Do not share inappropriate or harmful content</li>
            <li>Respect other users' privacy and opinions</li>
            <li>Do not attempt to hack or disrupt the system</li>
          </ul>
          
          <h3 className="font-semibold">Educational Purpose:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>AI tools are for educational support, not academic dishonesty</li>
            <li>Always verify information from external sources</li>
            <li>Use resources to supplement, not replace, proper learning</li>
          </ul>
          
          <h3 className="font-semibold">Platform Availability:</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Service availability is not guaranteed</li>
            <li>Platform may undergo maintenance or updates</li>
            <li>Features may change or be discontinued</li>
          </ul>
        </div>
      </div>

      {/* Contact Information */}
      <div className={getContrastClass(
        "bg-gray-50/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-200/50 mb-6",
        "bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border-2 border-gray-400/50 mb-6"
      )}>
        <h2 className={getContrastClass("text-xl font-semibold text-gray-900 mb-4", "text-xl font-semibold text-gray-400 mb-4")}>
          Contact & Support
        </h2>
        <div className={getContrastClass("text-gray-800 space-y-3", "text-gray-200 space-y-3")}>
          <p>
            <strong>Project Developer:</strong> Cherwin Fernandez
          </p>
          <p>
            <strong>Position:</strong> HRPTA President, 11-Mercado
          </p>
          <div className="flex items-center gap-2">
            <Mail className={getContrastClass("text-gray-600", "text-gray-400")} size={16} />
            <span><strong>Technical Support:</strong></span>
            <a href="mailto:kreativloops@gmail.com" className={getContrastClass("text-blue-600 hover:underline", "text-blue-400 hover:underline")}>
              kreativloops@gmail.com
            </a>
          </div>
          <p className="text-sm">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Developer & Designer Credits */}
      <div className={getContrastClass(
        "bg-slate-50/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-slate-200/50 mb-6",
        "bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border-2 border-slate-400/50 mb-6"
      )}>
        <h2 className={getContrastClass("text-xl font-semibold text-slate-900 mb-4", "text-xl font-semibold text-slate-400 mb-4")}>
          Development & Design
        </h2>
        <div className={getContrastClass("text-slate-800 space-y-3", "text-slate-200 space-y-3")}>
          <p>
            <strong>Developer & Designer:</strong> kreativloops
          </p>
          <p className="text-sm">
            Professional web development and UI/UX design services for educational platforms and digital solutions.
          </p>
          <div className="flex items-center gap-2">
            <Mail className={getContrastClass("text-slate-600", "text-slate-400")} size={16} />
            <span><strong>Contact:</strong></span>
            <a href="mailto:kreativloops@gmail.com" className={getContrastClass("text-blue-600 hover:underline", "text-blue-400 hover:underline")}>
              kreativloops@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Copyright & Rights */}
      <div className={getContrastClass(
        "bg-indigo-50/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-indigo-200/50",
        "bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border-2 border-indigo-400/50"
      )}>
        <h2 className={getContrastClass("text-xl font-semibold text-indigo-900 mb-4", "text-xl font-semibold text-indigo-400 mb-4")}>
          Copyright & Rights
        </h2>
        <div className={getContrastClass("text-indigo-800 space-y-3", "text-indigo-200 space-y-3")}>
          <p>
            <strong>© {new Date().getFullYear()} kreativloops.</strong> All rights reserved.
          </p>
          <p className="text-sm">
            This platform, including its design, code, functionality, and content, is the intellectual property of kreativloops. 
            Unauthorized reproduction, distribution, or modification of any part of this system is prohibited without explicit written permission.
          </p>
          <p className="text-sm">
            <strong>Open Source Components:</strong> This project utilizes various open-source libraries and resources. 
            All third-party components retain their respective licenses and attributions.
          </p>
          <p className="text-sm">
            <strong>Educational Use:</strong> The content and tools provided are for educational purposes only. 
            Users are encouraged to verify information from authoritative sources.
          </p>
          <div className="pt-3 border-t border-indigo-200 dark:border-indigo-700">
            <p className="text-xs text-center">
              Developed with ❤️ by <strong>kreativloops</strong> • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}