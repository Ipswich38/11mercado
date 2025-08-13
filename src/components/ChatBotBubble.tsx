import React, { useState } from 'react';
import { Bot, X, MessageCircle, Users } from 'lucide-react';
import AIChatBot from './AIChatBot';
import { useAdminSession } from '../utils/adminSessionManager';

interface ChatBotBubbleProps {
  getContrastClass: (baseClass: string, contrastClass: string) => string;
}

export default function ChatBotBubble({ getContrastClass }: ChatBotBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Chatbot Bubble */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={handleToggle}
            className={getContrastClass(
              "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transform transition-all hover:scale-110 active:scale-95",
              "bg-gray-900 border-2 border-yellow-400 hover:bg-gray-800 text-yellow-400 p-4 rounded-full shadow-2xl transform transition-all hover:scale-110 active:scale-95"
            )}
          >
            <Bot size={24} />
          </button>
          
          {/* Tooltip */}
          <div className={getContrastClass(
            "absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap",
            "absolute bottom-full right-0 mb-2 bg-yellow-400 text-black text-xs px-3 py-2 rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap"
          )}>
            Ask PTA questions
            <div className={getContrastClass(
              "absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900",
              "absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-yellow-400"
            )}></div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <AIChatBot 
            getContrastClass={getContrastClass}
            onClose={handleClose}
          />
        </div>
      )}

      {/* Pulsing notification indicator (optional) */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 z-30">
          <div className={getContrastClass(
            "absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75",
            "absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75"
          )}></div>
        </div>
      )}
    </>
  );
}

// Enhanced chatbot bubble with message preview
export function ChatBotBubbleWithPreview({ getContrastClass }: ChatBotBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  
  const { getCurrentUserCount, getMaxUsers } = useAdminSession();
  const currentUsers = getCurrentUserCount();
  const maxUsers = getMaxUsers();

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setShowPreview(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Chatbot Bubble with Message Preview */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
          {/* User Counter - Subtle Small Bubble */}
          <div className={getContrastClass(
            "bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg border border-white/30 text-xs",
            "bg-gray-900/90 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg border border-yellow-400/50 text-xs"
          )}>
            <div className="flex items-center gap-1.5">
              <Users size={12} className={getContrastClass("text-blue-600", "text-yellow-400")} />
              <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>
                {currentUsers}/{maxUsers}
              </span>
            </div>
          </div>
          {/* Message Preview */}
          {showPreview && (
            <div className={getContrastClass(
              "bg-white border border-gray-200 rounded-2xl p-4 shadow-xl max-w-64 transform transition-all",
              "bg-gray-900 border-2 border-yellow-400 rounded-2xl p-4 shadow-xl max-w-64 transform transition-all"
            )}>
              <div className="flex items-start gap-3">
                <div className={getContrastClass(
                  "w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0",
                  "w-8 h-8 bg-gray-700 border border-yellow-400 rounded-full flex items-center justify-center flex-shrink-0"
                )}>
                  <Bot size={16} className={getContrastClass("text-white", "text-yellow-400")} />
                </div>
                <div className="flex-1">
                  <p className={getContrastClass(
                    "text-sm text-gray-700",
                    "text-sm text-yellow-200"
                  )}>
                    Hi! I'm here to help with PTA questions. Ask me about policies, procedures, or guidelines!
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className={getContrastClass(
                    "text-gray-400 hover:text-gray-600 transition-colors",
                    "text-yellow-400 hover:text-yellow-300 transition-colors"
                  )}
                >
                  <X size={16} />
                </button>
              </div>
              {/* Speech bubble tail */}
              <div className={getContrastClass(
                "absolute bottom-0 right-6 transform translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white",
                "absolute bottom-0 right-6 transform translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"
              )}></div>
            </div>
          )}

          {/* Chat Button */}
          <button
            onClick={handleToggle}
            className={getContrastClass(
              "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transform transition-all hover:scale-110 active:scale-95 relative",
              "bg-gray-900 border-2 border-yellow-400 hover:bg-gray-800 text-yellow-400 p-4 rounded-full shadow-2xl transform transition-all hover:scale-110 active:scale-95 relative"
            )}
          >
            <Bot size={24} />
            
            {/* Notification badge */}
            <div className={getContrastClass(
              "absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white",
              "absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900"
            )}></div>
          </button>
        </div>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <AIChatBot 
            getContrastClass={getContrastClass}
            onClose={handleClose}
          />
        </div>
      )}
    </>
  );
}