import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Target,
  ArrowLeft,
  BookOpen,
  Award,
  Timer,
  Lightbulb
} from 'lucide-react';
import groq, { isGroqConfigured } from '../utils/groqClient';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
}

interface QuizState {
  questions: Question[];
  currentQuestion: number;
  userAnswers: (number | null)[];
  showResults: boolean;
  startTime: Date | null;
  timeSpent: number;
  isGenerating: boolean;
  canViewAnswers: boolean;
  selectedSubjects: string[];
  questionStartTime: Date | null;
  questionTimeSpent: number;
  showQuestionTimer: boolean;
}

interface UPCATQuizGeneratorProps {
  getContrastClass: (baseClass: string, contrastClass: string) => string;
  onClose: () => void;
}

export default function UPCATQuizGenerator({ getContrastClass, onClose }: UPCATQuizGeneratorProps) {
  const [quiz, setQuiz] = useState<QuizState>({
    questions: [],
    currentQuestion: 0,
    userAnswers: [],
    showResults: false,
    startTime: null,
    timeSpent: 0,
    isGenerating: false,
    canViewAnswers: false,
    selectedSubjects: ['Mathematics', 'Science', 'Language Proficiency', 'Reading Comprehension'],
    questionStartTime: null,
    questionTimeSpent: 0,
    showQuestionTimer: false
  });

  const [showExplanation, setShowExplanation] = useState<{ [key: number]: boolean }>({});
  const [analysisResult, setAnalysisResult] = useState<{ [key: number]: string }>({});

  const subjects = [
    'Mathematics',
    'Science', 
    'Language Proficiency',
    'Reading Comprehension',
    'Abstract Reasoning',
    'General Information'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quiz.startTime && !quiz.showResults) {
      interval = setInterval(() => {
        const now = new Date();
        const totalElapsed = Math.floor((now.getTime() - quiz.startTime!.getTime()) / 1000);
        setQuiz(prev => ({ ...prev, timeSpent: totalElapsed }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quiz.startTime, quiz.showResults]);

  // Per-question timer effect
  useEffect(() => {
    let questionInterval: NodeJS.Timeout;
    const currentUserAnswer = quiz.userAnswers[quiz.currentQuestion];
    
    if (quiz.questionStartTime && !quiz.showResults && currentUserAnswer === null) {
      questionInterval = setInterval(() => {
        const now = new Date();
        const questionElapsed = Math.floor((now.getTime() - quiz.questionStartTime!.getTime()) / 1000);
        setQuiz(prev => ({ ...prev, questionTimeSpent: questionElapsed }));
        
        // Show timer after 30 seconds if no answer selected
        if (questionElapsed >= 30 && !quiz.showQuestionTimer) {
          setQuiz(prev => ({ ...prev, showQuestionTimer: true }));
        }
        
        // Auto-advance after 5 minutes (300 seconds) if no answer
        if (questionElapsed >= 300) {
          // Move to next question or finish quiz
          if (quiz.currentQuestion < quiz.questions.length - 1) {
            setQuiz(prev => ({
              ...prev,
              currentQuestion: prev.currentQuestion + 1,
              questionStartTime: new Date(),
              questionTimeSpent: 0,
              showQuestionTimer: false
            }));
          } else {
            setQuiz(prev => ({ ...prev, showResults: true }));
          }
        }
      }, 1000);
    }
    
    return () => clearInterval(questionInterval);
  }, [quiz.questionStartTime, quiz.showResults, quiz.currentQuestion, quiz.userAnswers, quiz.showQuestionTimer, quiz.questions.length]);

  const generateQuiz = async () => {
    setQuiz(prev => ({ ...prev, isGenerating: true }));
    
    const subjectsText = quiz.selectedSubjects.join(', ');
    
    const prompt = `Generate 20 high-quality UPCAT (University of the Philippines College Admission Test) questions that meet Singapore-level academic standards. The questions should cover: ${subjectsText}.

CRITICAL REQUIREMENTS:
1. Questions must be challenging, analytical, and test deep understanding
2. Each question should have 4 options (A, B, C, D)
3. Include a mix of difficulty levels (Easy: 20%, Medium: 50%, Hard: 30%)
4. Questions should test critical thinking, not just memorization
5. Include detailed explanations for each correct answer
6. Cover diverse topics within each subject

FORMAT: Return a JSON array with exactly this structure:
[
  {
    "question": "Question text here",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of why this answer is correct and others are wrong",
    "subject": "Mathematics",
    "difficulty": "Medium",
    "topic": "Specific topic within subject"
  }
]

SUBJECTS TO COVER:
- Mathematics: Algebra, Geometry, Trigonometry, Statistics, Calculus concepts
- Science: Physics, Chemistry, Biology, Earth Science
- Language Proficiency: Grammar, Vocabulary, Sentence Construction
- Reading Comprehension: Critical analysis, inference, main ideas
- Abstract Reasoning: Pattern recognition, logical sequences
- General Information: Current events, Filipino culture, world knowledge

Make questions challenging but fair, requiring analytical thinking and comprehensive understanding.`;

    try {
      // Debug logging
      console.log('Groq configured:', isGroqConfigured);
      console.log('Groq client exists:', !!groq);
      console.log('API Key present:', !!import.meta.env.VITE_GROQ_API_KEY);
      console.log('API Key preview:', import.meta.env.VITE_GROQ_API_KEY?.substring(0, 10) + '...');
      
      if (!groq || !isGroqConfigured) {
        throw new Error('AI service not configured. Please check environment variables.');
      }
      
      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-70b-8192',
        temperature: 0.7,
        max_tokens: 4000,
        stream: false
      });

      const content = response.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const questionsData = JSON.parse(jsonMatch[0]);
        const formattedQuestions: Question[] = questionsData.map((q: any, index: number) => ({
          id: index + 1,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          subject: q.subject,
          difficulty: q.difficulty,
          topic: q.topic
        }));

        setQuiz(prev => ({
          ...prev,
          questions: formattedQuestions,
          userAnswers: new Array(20).fill(null),
          isGenerating: false,
          startTime: new Date(),
          currentQuestion: 0,
          showResults: false,
          canViewAnswers: false,
          questionStartTime: new Date(),
          questionTimeSpent: 0,
          showQuestionTimer: false
        }));
        setShowExplanation({});
        setAnalysisResult({});
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      setQuiz(prev => ({ ...prev, isGenerating: false }));
      
      // Provide more specific error messages
      let errorMessage = 'Error generating quiz. ';
      if (error.message.includes('not configured')) {
        errorMessage += 'AI service not configured. Please check environment variables.';
      } else if (error.message.includes('Invalid response format')) {
        errorMessage += 'AI returned invalid response format. Please try again.';
      } else if (error.message.includes('401')) {
        errorMessage += 'API key invalid or expired.';
      } else if (error.message.includes('429')) {
        errorMessage += 'API rate limit exceeded. Please wait and try again.';
      } else if (error.message.includes('quota')) {
        errorMessage += 'API quota exceeded. Please check your API key limits.';
      } else {
        errorMessage += `Please try again. Error: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...quiz.userAnswers];
    newAnswers[quiz.currentQuestion] = answerIndex;
    setQuiz(prev => ({ 
      ...prev, 
      userAnswers: newAnswers,
      canViewAnswers: true, // Allow immediate answer viewing once selected
      showQuestionTimer: false // Hide timer once answer is selected
    }));
  };

  const analyzeAnswer = async (questionIndex: number) => {
    const question = quiz.questions[questionIndex];
    const userAnswer = quiz.userAnswers[questionIndex];
    
    if (userAnswer === null) {
      alert('Please select an answer first.');
      return;
    }

    const isCorrect = userAnswer === question.correctAnswer;
    const userChoice = question.options[userAnswer];
    const correctChoice = question.options[question.correctAnswer];

    const analysisPrompt = `Analyze this UPCAT question response:

Question: ${question.question}
Options: ${question.options.join(', ')}
Student chose: ${userChoice}
Correct answer: ${correctChoice}
Result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}

Provide a detailed analysis explaining:
1. Why the answer is ${isCorrect ? 'correct' : 'incorrect'}
2. The reasoning behind the correct answer
3. Common mistakes students make with this type of question
4. Study tips for this topic

Keep it encouraging and educational.`;

    try {
      if (!groq || !isGroqConfigured) {
        throw new Error('AI service not configured. Please check environment variables.');
      }
      
      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: analysisPrompt }],
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 500,
        stream: false
      });

      const analysis = response.choices[0]?.message?.content || 'Analysis unavailable.';
      setAnalysisResult(prev => ({ ...prev, [questionIndex]: analysis }));
      setShowExplanation(prev => ({ ...prev, [questionIndex]: true }));
    } catch (error) {
      console.error('Error analyzing answer:', error);
      setShowExplanation(prev => ({ ...prev, [questionIndex]: true }));
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (quiz.userAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const getScoreMessage = (score: number) => {
    const percentage = (score / 20) * 100;
    if (percentage >= 90) return "Outstanding! You're ready for UPCAT!";
    if (percentage >= 80) return "Excellent work! Keep practicing!";
    if (percentage >= 70) return "Good job! Focus on weak areas.";
    if (percentage >= 60) return "Fair performance. More study needed.";
    return "Keep studying! You can improve with practice.";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetQuiz = () => {
    setQuiz({
      questions: [],
      currentQuestion: 0,
      userAnswers: [],
      showResults: false,
      startTime: null,
      timeSpent: 0,
      isGenerating: false,
      canViewAnswers: false,
      selectedSubjects: ['Mathematics', 'Science', 'Language Proficiency', 'Reading Comprehension'],
      questionStartTime: null,
      questionTimeSpent: 0,
      showQuestionTimer: false
    });
    setShowExplanation({});
    setAnalysisResult({});
  };

  const finishQuiz = () => {
    setQuiz(prev => ({ ...prev, showResults: true }));
  };

  // Quiz Setup Screen
  if (quiz.questions.length === 0 && !quiz.isGenerating) {
    return (
      <div className={getContrastClass(
        "fixed inset-0 bg-white z-50 flex flex-col",
        "fixed inset-0 bg-black z-50 flex flex-col"
      )}>
        {/* Header */}
        <div className={getContrastClass(
          "bg-gradient-to-r from-purple-600 to-violet-600 p-4 text-white",
          "bg-gray-900 border-b-2 border-yellow-400 p-4"
        )}>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={getContrastClass(
                "p-2 rounded-lg hover:bg-white/20 transition-colors",
                "p-2 rounded-lg hover:bg-gray-800 transition-colors text-yellow-400"
              )}
            >
              <ArrowLeft size={20} />
            </button>
            <Brain size={24} className={getContrastClass("text-white", "text-yellow-400")} />
            <div>
              <h1 className={getContrastClass(
                "text-xl font-bold text-white",
                "text-xl font-bold text-yellow-400"
              )}>
                College Entrance Exam: Quiz Generator
              </h1>
              <p className={getContrastClass(
                "text-sm text-white/80",
                "text-sm text-yellow-200"
              )}>
                High-quality practice questions for UP admission
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Welcome Card */}
          <div className={getContrastClass(
            "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
            "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
          )}>
            <div className="text-center">
              <div className="text-6xl mb-4">🧠</div>
              <h2 className={getContrastClass(
                "text-2xl font-bold text-gray-900 mb-2",
                "text-2xl font-bold text-yellow-400 mb-2"
              )}>
                AI-Powered UPCAT Practice
              </h2>
              <p className={getContrastClass(
                "text-gray-600 mb-4",
                "text-yellow-200 mb-4"
              )}>
                Experience Singapore-level quality questions designed to challenge your critical thinking and analytical skills.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Target, title: "20 Questions", desc: "Comprehensive coverage of UPCAT topics" },
              { icon: Timer, title: "5-Min Timer", desc: "5 minutes per question, advance early when answered" },
              { icon: Lightbulb, title: "AI Analysis", desc: "Instant explanations when you select an answer" },
              { icon: Award, title: "High Standards", desc: "Singapore-level question quality" }
            ].map((feature, index) => (
              <div
                key={index}
                className={getContrastClass(
                  "bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20 flex items-center gap-4",
                  "bg-gray-900 rounded-2xl p-4 shadow-lg border border-yellow-400 flex items-center gap-4"
                )}
              >
                <div className={getContrastClass(
                  "w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center",
                  "w-12 h-12 bg-gray-800 border border-yellow-400 rounded-xl flex items-center justify-center"
                )}>
                  <feature.icon size={24} className={getContrastClass("text-purple-600", "text-yellow-400")} />
                </div>
                <div>
                  <h3 className={getContrastClass(
                    "font-semibold text-gray-900",
                    "font-semibold text-yellow-400"
                  )}>
                    {feature.title}
                  </h3>
                  <p className={getContrastClass(
                    "text-sm text-gray-600",
                    "text-sm text-yellow-200"
                  )}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Subject Selection */}
          <div className={getContrastClass(
            "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
            "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
          )}>
            <h3 className={getContrastClass(
              "text-lg font-semibold text-gray-900 mb-4",
              "text-lg font-semibold text-yellow-400 mb-4"
            )}>
              Select Subjects to Include
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => {
                    const newSubjects = quiz.selectedSubjects.includes(subject)
                      ? quiz.selectedSubjects.filter(s => s !== subject)
                      : [...quiz.selectedSubjects, subject];
                    setQuiz(prev => ({ ...prev, selectedSubjects: newSubjects }));
                  }}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    quiz.selectedSubjects.includes(subject)
                      ? getContrastClass(
                          'bg-purple-500 text-white',
                          'bg-yellow-400 text-black'
                        )
                      : getContrastClass(
                          'bg-gray-100 text-gray-700 hover:bg-gray-200',
                          'bg-gray-800 text-yellow-400 hover:bg-gray-700 border border-gray-600'
                        )
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={generateQuiz}
            disabled={quiz.selectedSubjects.length === 0}
            className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <Brain size={24} />
            Generate AI Quiz
          </button>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (quiz.isGenerating) {
    return (
      <div className={getContrastClass(
        "fixed inset-0 bg-white z-50 flex items-center justify-center",
        "fixed inset-0 bg-black z-50 flex items-center justify-center"
      )}>
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
          <h2 className={getContrastClass(
            "text-xl font-semibold text-gray-900 mb-2",
            "text-xl font-semibold text-yellow-400 mb-2"
          )}>
            Generating Your Quiz
          </h2>
          <p className={getContrastClass(
            "text-gray-600",
            "text-yellow-200"
          )}>
            AI is creating 20 high-quality questions...
          </p>
        </div>
      </div>
    );
  }

  // Results Screen
  if (quiz.showResults) {
    const score = calculateScore();
    const percentage = (score / 20) * 100;
    
    return (
      <div className={getContrastClass(
        "fixed inset-0 bg-white z-50 flex flex-col",
        "fixed inset-0 bg-black z-50 flex flex-col"
      )}>
        {/* Header */}
        <div className={getContrastClass(
          "bg-gradient-to-r from-purple-600 to-violet-600 p-4 text-white",
          "bg-gray-900 border-b-2 border-yellow-400 p-4"
        )}>
          <div className="flex items-center gap-3">
            <Award size={24} className={getContrastClass("text-white", "text-yellow-400")} />
            <div>
              <h1 className={getContrastClass(
                "text-xl font-bold text-white",
                "text-xl font-bold text-yellow-400"
              )}>
                Quiz Results
              </h1>
              <p className={getContrastClass(
                "text-sm text-white/80",
                "text-sm text-yellow-200"
              )}>
                Your UPCAT practice performance
              </p>
            </div>
          </div>
        </div>

        {/* Results Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Score Card */}
          <div className={getContrastClass(
            "bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl p-6 text-white text-center",
            "bg-gray-900 border-2 border-yellow-400 rounded-3xl p-6 text-center"
          )}>
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : '📚'}
            </div>
            <div className={getContrastClass(
              "text-4xl font-bold text-white mb-2",
              "text-4xl font-bold text-yellow-400 mb-2"
            )}>
              {score}/20
            </div>
            <div className={getContrastClass(
              "text-xl text-white/90 mb-2",
              "text-xl text-yellow-200 mb-2"
            )}>
              {percentage.toFixed(1)}% Correct
            </div>
            <p className={getContrastClass(
              "text-white/80",
              "text-yellow-300"
            )}>
              {getScoreMessage(score)}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className={getContrastClass(
              "bg-white/60 backdrop-blur-md rounded-2xl p-4 text-center",
              "bg-gray-900 border border-yellow-400 rounded-2xl p-4 text-center"
            )}>
              <Clock size={24} className={getContrastClass("mx-auto mb-2 text-purple-600", "mx-auto mb-2 text-yellow-400")} />
              <div className={getContrastClass(
                "text-2xl font-bold text-gray-900",
                "text-2xl font-bold text-yellow-400"
              )}>
                {formatTime(quiz.timeSpent)}
              </div>
              <div className={getContrastClass(
                "text-sm text-gray-600",
                "text-sm text-yellow-200"
              )}>
                Time Spent
              </div>
            </div>
            
            <div className={getContrastClass(
              "bg-white/60 backdrop-blur-md rounded-2xl p-4 text-center",
              "bg-gray-900 border border-yellow-400 rounded-2xl p-4 text-center"
            )}>
              <Target size={24} className={getContrastClass("mx-auto mb-2 text-purple-600", "mx-auto mb-2 text-yellow-400")} />
              <div className={getContrastClass(
                "text-2xl font-bold text-gray-900",
                "text-2xl font-bold text-yellow-400"
              )}>
                {20 - score}
              </div>
              <div className={getContrastClass(
                "text-sm text-gray-600",
                "text-sm text-yellow-200"
              )}>
                To Review
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={resetQuiz}
              className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              Take New Quiz
            </button>
            
            <button
              onClick={onClose}
              className={getContrastClass(
                "w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors",
                "w-full bg-gray-700 border border-yellow-400 hover:bg-gray-600 text-yellow-400 font-semibold py-3 px-4 rounded-xl transition-colors"
              )}
            >
              Back to STEM Tools
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Interface
  const currentQ = quiz.questions[quiz.currentQuestion];
  const userAnswer = quiz.userAnswers[quiz.currentQuestion];
  
  return (
    <div className={getContrastClass(
      "fixed inset-0 bg-white z-50 flex flex-col",
      "fixed inset-0 bg-black z-50 flex flex-col"
    )}>
      {/* Header */}
      <div className={getContrastClass(
        "bg-gradient-to-r from-purple-600 to-violet-600 p-4 text-white",
        "bg-gray-900 border-b-2 border-yellow-400 p-4"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={24} className={getContrastClass("text-white", "text-yellow-400")} />
            <div>
              <div className={getContrastClass(
                "text-lg font-bold text-white",
                "text-lg font-bold text-yellow-400"
              )}>
                Question {quiz.currentQuestion + 1} of 20
              </div>
              <div className={getContrastClass(
                "text-sm text-white/80",
                "text-sm text-yellow-200"
              )}>
                {currentQ?.subject} • {currentQ?.difficulty}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={getContrastClass(
              "text-lg font-bold text-white",
              "text-lg font-bold text-yellow-400"
            )}>
              {formatTime(quiz.timeSpent)}
            </div>
            {quiz.showQuestionTimer && userAnswer === null && (
              <div className={getContrastClass(
                "text-sm font-medium text-orange-200 bg-orange-500/20 px-2 py-1 rounded-lg mb-1",
                "text-sm font-medium text-orange-300 bg-orange-500/20 border border-orange-400 px-2 py-1 rounded-lg mb-1"
              )}>
                ⏱️ {formatTime(300 - quiz.questionTimeSpent)} left
              </div>
            )}
            <div className={getContrastClass(
              "text-xs text-white/80",
              "text-xs text-yellow-200"
            )}>
              {userAnswer !== null ? 'Answer selected' : 'Select an answer'}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className={getContrastClass(
          "bg-white/20 rounded-full h-2 mt-3",
          "bg-gray-700 rounded-full h-2 mt-3"
        )}>
          <div
            className="bg-white h-2 rounded-full transition-all"
            style={{ width: `${((quiz.currentQuestion + 1) / 20) * 100}%` }}
          />
        </div>
        
        {/* Answered Questions Indicator */}
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className={getContrastClass("text-white/60", "text-yellow-300")}>
            Progress: {quiz.currentQuestion + 1}/20
          </span>
          <span className={getContrastClass("text-white/60", "text-yellow-300")}>
            Answered: {quiz.userAnswers.filter(answer => answer !== null).length}/20
          </span>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Question */}
        <div className={getContrastClass(
          "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
          "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
        )}>
          <div className="flex items-center gap-2 mb-4">
            <span className={getContrastClass(
              "bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-medium",
              "bg-gray-800 text-yellow-400 border border-yellow-400 px-2 py-1 rounded-full text-xs font-medium"
            )}>
              {currentQ?.topic}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              currentQ?.difficulty === 'Easy' 
                ? 'bg-green-100 text-green-600' 
                : currentQ?.difficulty === 'Medium'
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-red-100 text-red-600'
            }`}>
              {currentQ?.difficulty}
            </span>
          </div>
          
          <h2 className={getContrastClass(
            "text-lg font-semibold text-gray-900 leading-relaxed",
            "text-lg font-semibold text-yellow-400 leading-relaxed"
          )}>
            {currentQ?.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => selectAnswer(index)}
              className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${
                userAnswer === index
                  ? getContrastClass(
                      'bg-purple-100 border-purple-500 text-purple-900',
                      'bg-gray-800 border-yellow-400 text-yellow-400'
                    )
                  : getContrastClass(
                      'bg-white/60 border-white/20 text-gray-900 hover:bg-purple-50 hover:border-purple-200',
                      'bg-gray-900 border-gray-600 text-yellow-200 hover:bg-gray-800 hover:border-yellow-400'
                    )
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold ${
                  userAnswer === index
                    ? getContrastClass('border-purple-500 bg-purple-500 text-white', 'border-yellow-400 bg-yellow-400 text-black')
                    : getContrastClass('border-gray-300', 'border-gray-600')
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="flex-1">{option.replace(/^[A-D]\)\s*/, '')}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Analysis Section */}
        {userAnswer !== null && (
          <div className={getContrastClass(
            "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
            "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={getContrastClass(
                "text-lg font-semibold text-gray-900",
                "text-lg font-semibold text-yellow-400"
              )}>
                Answer Analysis
              </h3>
              <button
                onClick={() => analyzeAnswer(quiz.currentQuestion)}
                disabled={userAnswer === null}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                  userAnswer !== null
                    ? getContrastClass(
                        'bg-purple-500 hover:bg-purple-600 text-white',
                        'bg-yellow-400 hover:bg-yellow-500 text-black'
                      )
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                {showExplanation[quiz.currentQuestion] ? <EyeOff size={16} /> : <Eye size={16} />}
                {userAnswer !== null ? 'View Analysis' : 'Select answer first'}
              </button>
            </div>

            {showExplanation[quiz.currentQuestion] && (
              <div className="space-y-4">
                {/* Correct/Incorrect indicator */}
                <div className={`flex items-center gap-2 p-3 rounded-xl ${
                  userAnswer === currentQ?.correctAnswer
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {userAnswer === currentQ?.correctAnswer ? (
                    <CheckCircle size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                  <span className="font-semibold">
                    {userAnswer === currentQ?.correctAnswer ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>

                {/* AI Analysis */}
                {analysisResult[quiz.currentQuestion] && (
                  <div className={getContrastClass(
                    "bg-gray-50 p-4 rounded-xl",
                    "bg-gray-800 p-4 rounded-xl"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <Brain size={16} className={getContrastClass("text-purple-600", "text-yellow-400")} />
                      <span className={getContrastClass(
                        "font-semibold text-gray-900",
                        "font-semibold text-yellow-400"
                      )}>
                        AI Analysis
                      </span>
                    </div>
                    <p className={getContrastClass(
                      "text-gray-700 text-sm leading-relaxed",
                      "text-yellow-200 text-sm leading-relaxed"
                    )}>
                      {analysisResult[quiz.currentQuestion]}
                    </p>
                  </div>
                )}

                {/* Standard Explanation */}
                <div className={getContrastClass(
                  "bg-blue-50 p-4 rounded-xl",
                  "bg-gray-800 border border-blue-400 p-4 rounded-xl"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={16} className={getContrastClass("text-blue-600", "text-blue-400")} />
                    <span className={getContrastClass(
                      "font-semibold text-blue-900",
                      "font-semibold text-blue-400"
                    )}>
                      Explanation
                    </span>
                  </div>
                  <p className={getContrastClass(
                    "text-blue-800 text-sm leading-relaxed",
                    "text-blue-200 text-sm leading-relaxed"
                  )}>
                    {currentQ?.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const newQuestion = Math.max(0, quiz.currentQuestion - 1);
              setQuiz(prev => ({ 
                ...prev, 
                currentQuestion: newQuestion,
                questionStartTime: prev.userAnswers[newQuestion] === null ? new Date() : prev.questionStartTime,
                questionTimeSpent: prev.userAnswers[newQuestion] === null ? 0 : prev.questionTimeSpent,
                showQuestionTimer: prev.userAnswers[newQuestion] === null ? false : prev.showQuestionTimer,
                canViewAnswers: prev.userAnswers[newQuestion] !== null
              }));
            }}
            disabled={quiz.currentQuestion === 0}
            className={getContrastClass(
              "px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-xl transition-colors disabled:cursor-not-allowed",
              "px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-yellow-400 border border-yellow-400 rounded-xl transition-colors disabled:cursor-not-allowed"
            )}
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {quiz.currentQuestion === 19 ? (
              <button
                onClick={finishQuiz}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-colors"
              >
                Finish Quiz
              </button>
            ) : (
              <button
                onClick={() => {
                  const newQuestion = Math.min(19, quiz.currentQuestion + 1);
                  setQuiz(prev => ({ 
                    ...prev, 
                    currentQuestion: newQuestion,
                    questionStartTime: prev.userAnswers[newQuestion] === null ? new Date() : prev.questionStartTime,
                    questionTimeSpent: prev.userAnswers[newQuestion] === null ? 0 : prev.questionTimeSpent,
                    showQuestionTimer: prev.userAnswers[newQuestion] === null ? false : prev.showQuestionTimer,
                    canViewAnswers: prev.userAnswers[newQuestion] !== null
                  }));
                }}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold rounded-xl transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}