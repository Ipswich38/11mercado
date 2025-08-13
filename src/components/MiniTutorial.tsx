import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play, BookOpen, Upload, Users } from 'lucide-react';

export default function MiniTutorial({ appType, onClose, getContrastClass }) {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorials = {
    'stem-tools': {
      title: 'STEM Resources Tutorial',
      icon: <BookOpen size={24} />,
      color: 'from-purple-500 to-violet-600',
      steps: [
        {
          title: 'Welcome to STEM Resources',
          content: 'Access AI-powered educational tools and credible open-source materials for science, technology, engineering, and mathematics.',
          image: '🧬',
          tips: ['AI Research Assistant', 'Interactive Simulations', 'Educational Links']
        },
        {
          title: 'Using Research and STEM-GPT',
          content: 'Ask questions about any STEM topic and get intelligent responses with relevant educational resources.',
          image: '🤖',
          tips: ['Type your question clearly', 'Get AI responses with resources', 'Access credible materials']
        },
        {
          title: 'Browse Educational Resources',
          content: 'Explore curated links to Khan Academy, PhET simulations, MIT courses, and other trusted educational platforms.',
          image: '📚',
          tips: ['Click on resource links', 'Practice with simulations', 'Learn from experts']
        }
      ]
    },
    'donation-upload': {
      title: 'Donation Form Tutorial',
      icon: <Upload size={24} />,
      color: 'from-green-500 to-emerald-600',
      steps: [
        {
          title: 'Submit Your Donation',
          content: 'Easily submit donation details and upload receipts to support PTA projects and activities.',
          image: '💰',
          tips: ['Fill donation details', 'Upload receipt photo', 'Track your contributions']
        },
        {
          title: 'Fill Donation Information',
          content: 'Enter amount, description, and select the campaign you want to support.',
          image: '📝',
          tips: ['Enter accurate amount', 'Add clear description', 'Choose correct campaign']
        },
        {
          title: 'Upload Receipt & Get Reference',
          content: 'Take a clear photo of your receipt and upload it. After submission, you\'ll receive a reference number for tracking and editing.',
          image: '📄',
          tips: ['Clear, readable photo', 'Save your reference number', 'Use reference to edit if needed']
        },
        {
          title: 'Reference Number & Editing',
          content: 'After successful submission, you\'ll get a unique reference number. Download or note this number - you can use it to edit your donation entry if any details were incorrect.',
          image: '🔢',
          tips: ['Download reference receipt', 'Keep reference number safe', 'Edit entries anytime with reference']
        }
      ]
    },
    'community': {
      title: 'Community Hub Tutorial',
      icon: <Users size={24} />,
      color: 'from-orange-500 to-red-600',
      steps: [
        {
          title: 'Welcome to Community Hub',
          content: 'Share thoughts, write blog posts, and connect with other parents and students in the 11-Mercado community.',
          image: '🌟',
          tips: ['Share experiences', 'Write blog posts', 'Connect with others']
        },
        {
          title: 'Create Posts',
          content: 'Choose between quick thoughts or detailed blog posts to share with the community.',
          image: '✍️',
          tips: ['Choose post type', 'Write meaningful content', 'Add relevant tags']
        },
        {
          title: 'Engage with Community',
          content: 'Read, like, and comment on posts from other community members to build connections.',
          image: '💬',
          tips: ['Read others\' posts', 'Leave thoughtful comments', 'Build relationships']
        }
      ]
    }
  };

  const tutorial = tutorials[appType];
  if (!tutorial) return null;

  const currentStepData = tutorial.steps[currentStep];
  const isLastStep = currentStep === tutorial.steps.length - 1;
  const isFirstStep = currentStep === 0;

  const nextStep = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={getContrastClass(
        "bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 max-w-md w-full",
        "bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-yellow-400/50 max-w-md w-full"
      )}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${tutorial.color} p-6 rounded-t-3xl text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            {tutorial.icon}
            <h2 className="text-xl font-semibold">{tutorial.title}</h2>
          </div>
          <div className="flex gap-1">
            {tutorial.steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full flex-1 ${
                  index === currentStep ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">{currentStepData.image}</div>
            <h3 className={getContrastClass(
              "text-lg font-semibold text-gray-900 mb-3",
              "text-lg font-semibold text-yellow-400 mb-3"
            )}>
              {currentStepData.title}
            </h3>
            <p className={getContrastClass(
              "text-gray-600 text-sm leading-relaxed",
              "text-yellow-200 text-sm leading-relaxed"
            )}>
              {currentStepData.content}
            </p>
          </div>

          {/* Tips */}
          <div className={getContrastClass(
            "bg-blue-50 rounded-xl p-4 mb-6",
            "bg-gray-800 rounded-xl p-4 mb-6"
          )}>
            <h4 className={getContrastClass(
              "text-sm font-medium text-blue-900 mb-2",
              "text-sm font-medium text-blue-400 mb-2"
            )}>
              💡 Quick Tips:
            </h4>
            <ul className="space-y-1">
              {currentStepData.tips.map((tip, index) => (
                <li
                  key={index}
                  className={getContrastClass(
                    "text-xs text-blue-800",
                    "text-xs text-blue-200"
                  )}
                >
                  • {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={isFirstStep}
              className={getContrastClass(
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isFirstStep
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`,
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isFirstStep
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-yellow-400 hover:bg-gray-800'
                }`
              )}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="flex gap-2">
              <button
                onClick={skipTutorial}
                className={getContrastClass(
                  "px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors",
                  "px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 transition-colors"
                )}
              >
                Skip
              </button>
              
              {isLastStep ? (
                <button
                  onClick={onClose}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r ${tutorial.color} hover:shadow-lg transition-all`}
                >
                  <Play size={16} />
                  Get Started
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r ${tutorial.color} hover:shadow-lg transition-all`}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}