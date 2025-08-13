import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, TrendingUp, BarChart3, PieChart, Calculator, Brain, History, X, HelpCircle } from 'lucide-react';
import { evaluate, parse, simplify } from 'mathjs';

interface CalculationHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
  aiAnalysis?: string;
}

interface AIAnalysisResponse {
  explanation: string;
  concepts: string[];
  nextSteps: string[];
  visualization?: 'graph' | 'table' | 'diagram' | null;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

export default function AIScientificCalculator({ getContrastClass, onClose }) {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isRadians, setIsRadians] = useState(true);
  const [memoryValue, setMemoryValue] = useState(0);
  const [showTutorialMode, setShowTutorialMode] = useState(true);

  const scientificButtons = [
    // Row 1: Clear and basic operations
    [
      { label: 'C', type: 'clear', className: 'bg-red-500 text-white' },
      { label: 'CE', type: 'clearEntry', className: 'bg-orange-500 text-white' },
      { label: '⌫', type: 'backspace', className: 'bg-orange-500 text-white' },
      { label: '÷', type: 'operator', value: '/' }
    ],
    // Row 2: Advanced functions
    [
      { label: 'sin', type: 'function', value: 'sin(' },
      { label: 'cos', type: 'function', value: 'cos(' },
      { label: 'tan', type: 'function', value: 'tan(' },
      { label: '×', type: 'operator', value: '*' }
    ],
    // Row 3: More functions
    [
      { label: 'sin⁻¹', type: 'function', value: 'asin(' },
      { label: 'cos⁻¹', type: 'function', value: 'acos(' },
      { label: 'tan⁻¹', type: 'function', value: 'atan(' },
      { label: '-', type: 'operator', value: '-' }
    ],
    // Row 4: Logarithms and powers
    [
      { label: 'ln', type: 'function', value: 'log(' },
      { label: 'log₁₀', type: 'function', value: 'log10(' },
      { label: 'x²', type: 'function', value: '^2' },
      { label: '+', type: 'operator', value: '+' }
    ],
    // Row 5: More powers and constants
    [
      { label: 'xʸ', type: 'function', value: '^' },
      { label: '√x', type: 'function', value: 'sqrt(' },
      { label: 'π', type: 'constant', value: 'pi' },
      { label: '(', type: 'bracket', value: '(' }
    ],
    // Row 6: Numbers and operations
    [
      { label: '7', type: 'number', value: '7' },
      { label: '8', type: 'number', value: '8' },
      { label: '9', type: 'number', value: '9' },
      { label: ')', type: 'bracket', value: ')' }
    ],
    // Row 7
    [
      { label: '4', type: 'number', value: '4' },
      { label: '5', type: 'number', value: '5' },
      { label: '6', type: 'number', value: '6' },
      { label: 'e', type: 'constant', value: 'e' }
    ],
    // Row 8
    [
      { label: '1', type: 'number', value: '1' },
      { label: '2', type: 'number', value: '2' },
      { label: '3', type: 'number', value: '3' },
      { label: 'x!', type: 'function', value: '!' }
    ],
    // Row 9
    [
      { label: '±', type: 'negate', value: '-' },
      { label: '0', type: 'number', value: '0' },
      { label: '.', type: 'decimal', value: '.' },
      { label: '=', type: 'equals', className: 'bg-blue-500 text-white col-span-1' }
    ]
  ];

  const handleButtonClick = async (button) => {
    if (isProcessing) return;

    switch (button.type) {
      case 'clear':
        setDisplay('0');
        setExpression('');
        setCurrentAnalysis(null);
        setShowAnalysis(false);
        break;
      
      case 'clearEntry':
        setDisplay('0');
        break;
      
      case 'backspace':
        if (display !== '0') {
          const newDisplay = display.slice(0, -1) || '0';
          setDisplay(newDisplay);
          setExpression(prev => prev.slice(0, -1));
        }
        break;
      
      case 'number':
      case 'operator':
      case 'function':
      case 'constant':
      case 'bracket':
      case 'decimal':
        const newValue = button.value;
        if (display === '0' && button.type === 'number') {
          setDisplay(newValue);
          setExpression(newValue);
        } else {
          setDisplay(prev => prev + newValue);
          setExpression(prev => prev + newValue);
        }
        break;
      
      case 'negate':
        if (display !== '0') {
          const negated = display.startsWith('-') ? display.slice(1) : '-' + display;
          setDisplay(negated);
        }
        break;
      
      case 'equals':
        await handleCalculation();
        break;
    }
  };

  const handleCalculation = async () => {
    if (!expression || isProcessing) return;

    setIsProcessing(true);
    
    try {
      // Convert degrees to radians if needed
      let processedExpression = expression;
      if (!isRadians) {
        processedExpression = processedExpression
          .replace(/sin\(/g, 'sin(deg2rad(')
          .replace(/cos\(/g, 'cos(deg2rad(')
          .replace(/tan\(/g, 'tan(deg2rad(');
      }

      // Handle factorial notation
      processedExpression = processedExpression.replace(/(\d+)!/g, 'factorial($1)');
      
      // Evaluate the expression using mathjs
      const result = evaluate(processedExpression);
      const formattedResult = typeof result === 'number' ? 
        (Number.isInteger(result) ? result.toString() : result.toFixed(8).replace(/\.?0+$/, '')) : 
        result.toString();

      setDisplay(formattedResult);

      // Add to history
      const newHistoryItem: CalculationHistory = {
        id: Date.now().toString(),
        expression: expression,
        result: formattedResult,
        timestamp: new Date()
      };

      setHistory(prev => [newHistoryItem, ...prev.slice(0, 19)]); // Keep last 20 calculations

      // Generate AI analysis if in tutorial mode
      if (showTutorialMode) {
        setTimeout(async () => {
          await generateAIAnalysis(expression, formattedResult);
        }, 1000); // 1 second delay for tutoring approach
      }

    } catch (error) {
      setDisplay('Error');
      console.error('Calculation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAIAnalysis = async (expr: string, result: string) => {
    // Simulate AI analysis generation
    const analysisPrompts = {
      trigonometric: {
        explanation: `This calculation involves trigonometric functions. The result ${result} represents the ${expr.includes('sin') ? 'sine' : expr.includes('cos') ? 'cosine' : 'tangent'} value.`,
        concepts: ['Trigonometry', 'Unit Circle', 'Angle Measurement'],
        nextSteps: ['Try different angle values', 'Explore inverse functions', 'Practice with real-world applications'],
        difficulty: 'intermediate' as const
      },
      logarithmic: {
        explanation: `This logarithmic calculation gives us ${result}. Logarithms help us solve exponential equations and understand growth patterns.`,
        concepts: ['Logarithms', 'Exponential Functions', 'Mathematical Inverse'],
        nextSteps: ['Explore different bases', 'Try exponential form', 'Practice with scientific notation'],
        difficulty: 'advanced' as const
      },
      algebraic: {
        explanation: `This algebraic expression evaluates to ${result}. Understanding order of operations and mathematical relationships is key.`,
        concepts: ['Order of Operations', 'Algebraic Manipulation', 'Mathematical Relationships'],
        nextSteps: ['Try simplifying step by step', 'Explore similar expressions', 'Practice with variables'],
        difficulty: 'basic' as const
      },
      basic: {
        explanation: `The calculation ${expr} equals ${result}. This demonstrates fundamental arithmetic operations.`,
        concepts: ['Basic Arithmetic', 'Number Operations', 'Mathematical Precision'],
        nextSteps: ['Try more complex expressions', 'Explore scientific notation', 'Practice mental math'],
        difficulty: 'basic' as const
      }
    };

    // Determine the type of calculation
    let analysisType = 'basic';
    if (expr.includes('sin') || expr.includes('cos') || expr.includes('tan')) {
      analysisType = 'trigonometric';
    } else if (expr.includes('log') || expr.includes('ln')) {
      analysisType = 'logarithmic';
    } else if (expr.includes('^') || expr.includes('sqrt') || expr.includes('*') || expr.includes('/')) {
      analysisType = 'algebraic';
    }

    const analysis = analysisPrompts[analysisType];
    
    // Add visualization suggestion based on function type
    let visualization = null;
    if (expr.includes('sin') || expr.includes('cos') || expr.includes('tan')) {
      visualization = 'graph';
    } else if (expr.includes('log') || expr.includes('ln')) {
      visualization = 'graph';
    }

    setCurrentAnalysis({
      ...analysis,
      visualization
    });
    setShowAnalysis(true);
  };

  const renderVisualization = () => {
    if (!currentAnalysis?.visualization) return null;

    return (
      <div className={getContrastClass(
        "bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4",
        "bg-gray-800 border border-yellow-400 rounded-xl p-4 mt-4"
      )}>
        <div className="flex items-center gap-2 mb-3">
          {currentAnalysis.visualization === 'graph' && <BarChart3 size={20} className={getContrastClass("text-blue-600", "text-yellow-400")} />}
          <h4 className={getContrastClass("font-semibold text-blue-800", "font-semibold text-yellow-400")}>
            Visual Representation
          </h4>
        </div>
        <div className={getContrastClass(
          "bg-white rounded-lg p-4 text-center",
          "bg-gray-900 rounded-lg p-4 text-center"
        )}>
          <div className="text-4xl mb-2">📊</div>
          <p className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
            Graph visualization would appear here in a full implementation
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div className={getContrastClass(
        "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
        "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
      )}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className={getContrastClass(
              "p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors",
              "p-2 rounded-xl text-yellow-400 hover:bg-gray-800 transition-colors"
            )}
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className={getContrastClass(
            "text-xl font-light text-slate-900",
            "text-xl font-light text-yellow-400"
          )}>
            AI Scientific Calculator
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={getContrastClass(
                "p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors",
                "p-2 rounded-xl text-yellow-400 hover:bg-gray-800 transition-colors"
              )}
            >
              <History size={18} />
            </button>
            <button
              onClick={() => setShowTutorialMode(!showTutorialMode)}
              className={getContrastClass(
                `p-2 rounded-xl transition-colors ${showTutorialMode ? 'bg-blue-100 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`,
                `p-2 rounded-xl transition-colors ${showTutorialMode ? 'bg-gray-800 text-yellow-400' : 'text-yellow-400 hover:bg-gray-800'}`
              )}
            >
              <Brain size={18} />
            </button>
          </div>
        </div>
        
        <p className={getContrastClass(
          "text-slate-600 text-sm",
          "text-yellow-200 text-sm"
        )}>
          World-standard accuracy with AI tutoring • {showTutorialMode ? 'Tutorial Mode ON' : 'Tutorial Mode OFF'}
        </p>
      </div>

      {/* Display */}
      <div className={getContrastClass(
        "bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20",
        "bg-gray-900 rounded-2xl p-6 shadow-lg border-2 border-yellow-400"
      )}>
        <div className="text-right">
          <div className={getContrastClass(
            "text-sm text-gray-500 mb-1 min-h-[20px]",
            "text-sm text-yellow-300 mb-1 min-h-[20px]"
          )}>
            {expression}
          </div>
          <div className={getContrastClass(
            "text-3xl font-light text-gray-900 min-h-[40px] break-all",
            "text-3xl font-light text-yellow-400 min-h-[40px] break-all"
          )}>
            {display}
          </div>
        </div>
        
        {isProcessing && (
          <div className="flex items-center justify-center mt-4">
            <Loader2 className="animate-spin text-blue-500" size={20} />
            <span className={getContrastClass("ml-2 text-sm text-gray-600", "ml-2 text-sm text-yellow-200")}>
              AI analyzing...
            </span>
          </div>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsRadians(!isRadians)}
          className={getContrastClass(
            `px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isRadians ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`,
            `px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isRadians ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-yellow-400'}`
          )}
        >
          {isRadians ? 'RAD' : 'DEG'}
        </button>
        <div className="flex-1" />
        <div className={getContrastClass(
          "px-3 py-2 bg-gray-100 rounded-xl text-sm text-gray-600",
          "px-3 py-2 bg-gray-800 rounded-xl text-sm text-yellow-400"
        )}>
          MEM: {memoryValue}
        </div>
      </div>

      {/* Calculator Buttons */}
      <div className={getContrastClass(
        "bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20",
        "bg-gray-900 rounded-2xl p-4 shadow-lg border-2 border-yellow-400"
      )}>
        <div className="grid grid-cols-4 gap-2">
          {scientificButtons.flat().map((button, index) => (
            <button
              key={index}
              onClick={() => handleButtonClick(button)}
              disabled={isProcessing}
              className={getContrastClass(
                `p-3 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 ${
                  button.className || 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`,
                `p-3 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 ${
                  button.className || 'bg-gray-800 text-yellow-400 hover:bg-gray-700 border border-yellow-400'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`
              )}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Analysis Panel */}
      {showAnalysis && currentAnalysis && (
        <div className={getContrastClass(
          "bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20",
          "bg-gray-900 rounded-2xl p-6 shadow-xl border-2 border-yellow-400"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className={getContrastClass("text-blue-600", "text-yellow-400")} size={20} />
              <h3 className={getContrastClass(
                "text-lg font-semibold text-gray-900",
                "text-lg font-semibold text-yellow-400"
              )}>
                AI Tutor Analysis
              </h3>
            </div>
            <button
              onClick={() => setShowAnalysis(false)}
              className={getContrastClass(
                "p-1 rounded-lg text-gray-500 hover:bg-gray-100",
                "p-1 rounded-lg text-yellow-400 hover:bg-gray-800"
              )}
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className={getContrastClass("font-medium text-gray-800 mb-2", "font-medium text-yellow-400 mb-2")}>
                Explanation
              </h4>
              <p className={getContrastClass("text-gray-600 text-sm", "text-yellow-200 text-sm")}>
                {currentAnalysis.explanation}
              </p>
            </div>

            <div>
              <h4 className={getContrastClass("font-medium text-gray-800 mb-2", "font-medium text-yellow-400 mb-2")}>
                Key Concepts
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentAnalysis.concepts.map((concept, index) => (
                  <span
                    key={index}
                    className={getContrastClass(
                      "bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-lg",
                      "bg-gray-800 text-yellow-400 text-xs px-2 py-1 rounded-lg border border-yellow-400"
                    )}
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className={getContrastClass("font-medium text-gray-800 mb-2", "font-medium text-yellow-400 mb-2")}>
                Next Steps
              </h4>
              <ul className={getContrastClass("text-gray-600 text-sm space-y-1", "text-yellow-200 text-sm space-y-1")}>
                {currentAnalysis.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className={getContrastClass("text-blue-500", "text-yellow-400")}>•</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {renderVisualization()}
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className={getContrastClass(
          "bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20",
          "bg-gray-900 rounded-2xl p-6 shadow-xl border-2 border-yellow-400"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className={getContrastClass("text-blue-600", "text-yellow-400")} size={20} />
              <h3 className={getContrastClass(
                "text-lg font-semibold text-gray-900",
                "text-lg font-semibold text-yellow-400"
              )}>
                Calculation History
              </h3>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className={getContrastClass(
                "p-1 rounded-lg text-gray-500 hover:bg-gray-100",
                "p-1 rounded-lg text-yellow-400 hover:bg-gray-800"
              )}
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {history.length === 0 ? (
              <p className={getContrastClass("text-gray-500 text-sm text-center", "text-yellow-300 text-sm text-center")}>
                No calculations yet
              </p>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className={getContrastClass(
                    "bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100",
                    "bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-700 border border-yellow-400"
                  )}
                  onClick={() => {
                    setExpression(item.expression);
                    setDisplay(item.expression);
                  }}
                >
                  <div className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-300")}>
                    {item.expression}
                  </div>
                  <div className={getContrastClass("font-medium text-gray-900", "font-medium text-yellow-400")}>
                    = {item.result}
                  </div>
                  <div className={getContrastClass("text-xs text-gray-400 mt-1", "text-xs text-yellow-500 mt-1")}>
                    {item.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tutorial Tip */}
      {showTutorialMode && (
        <div className={getContrastClass(
          "bg-blue-50 border border-blue-200 rounded-xl p-4",
          "bg-gray-900 border border-yellow-400 rounded-xl p-4"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle size={16} className={getContrastClass("text-blue-600", "text-yellow-400")} />
            <h4 className={getContrastClass("font-semibold text-blue-800", "font-semibold text-yellow-400")}>
              AI Tutor Mode
            </h4>
          </div>
          <p className={getContrastClass("text-blue-700 text-sm", "text-yellow-200 text-sm")}>
            Tutorial mode is active. After each calculation, I'll provide explanations and learning guidance to help you understand the concepts better.
          </p>
        </div>
      )}
    </div>
  );
}