import React, { useState } from 'react';
import { Button } from './ui/button';
import { generateUPCATQuiz } from '../utils/groqService';
import {
  Brain,
  Trophy,
  Timer,
  CheckCircle,
  XCircle,
  RefreshCw,
  Zap,
  Target,
  Award,
  BookOpen,
  BarChart,
  Loader2,
} from 'lucide-react';

const AIQuizGenerator = () => {
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizStats, setQuizStats] = useState({
    totalQuizzes: 12,
    averageScore: 78,
    bestScore: 95,
    timeSpentToday: 45,
  });

  const quizCategories = [
    {
      name: 'Math',
      color: 'bg-blue-500',
      icon: '📊',
      topics: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics'],
    },
    {
      name: 'Science',
      color: 'bg-green-500',
      icon: '🔬',
      topics: ['Physics', 'Chemistry', 'Biology', 'Earth Science'],
    },
    {
      name: 'English',
      color: 'bg-purple-500',
      icon: '📚',
      topics: ['Reading Comprehension', 'Grammar', 'Vocabulary', 'Writing'],
    },
    {
      name: 'Abstract Reasoning',
      color: 'bg-orange-500',
      icon: '🧩',
      topics: ['Pattern Recognition', 'Logical Sequences', 'Spatial Relations'],
    },
  ];

  const sampleQuestions = {
    Math: [
      {
        id: 1,
        question: 'If f(x) = 2x² + 3x - 1, what is f(2)?',
        options: ['A) 11', 'B) 13', 'C) 15', 'D) 17'],
        correct: 1,
        explanation: 'f(2) = 2(2)² + 3(2) - 1 = 2(4) + 6 - 1 = 8 + 6 - 1 = 13',
      },
      {
        id: 2,
        question:
          'What is the slope of the line passing through points (2, 3) and (4, 7)?',
        options: ['A) 1', 'B) 2', 'C) 3', 'D) 4'],
        correct: 1,
        explanation: 'Slope = (y₂ - y₁)/(x₂ - x₁) = (7 - 3)/(4 - 2) = 4/2 = 2',
      },
    ],
    Science: [
      {
        id: 1,
        question: 'Which of the following is NOT a greenhouse gas?',
        options: [
          'A) Carbon dioxide',
          'B) Methane',
          'C) Nitrogen',
          'D) Water vapor',
        ],
        correct: 2,
        explanation:
          "Nitrogen (N₂) makes up 78% of our atmosphere but is not a greenhouse gas because it doesn't absorb infrared radiation.",
      },
      {
        id: 2,
        question: 'What is the pH of pure water at 25°C?',
        options: ['A) 0', 'B) 7', 'C) 14', 'D) 1'],
        correct: 1,
        explanation:
          'Pure water at 25°C has a pH of 7, which is neutral (neither acidic nor basic).',
      },
    ],
  };

  const generateQuiz = async (category) => {
    setIsGenerating(true);

    try {
      // Call Groq API to generate quiz questions
      const response = await generateUPCATQuiz(category, 5, 'medium');

      let questions;
      if (response.success && response.questions.length > 0) {
        questions = response.questions;
      } else {
        // Fallback to sample questions if API fails
        questions = sampleQuestions[category] || sampleQuestions.Math;
      }

      setCurrentQuiz({
        category,
        questions: questions,
        startTime: Date.now(),
        isAIGenerated: response.success && !response.fallback,
      });
      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);
    } catch (error) {
      console.error('Quiz generation error:', error);
      // Fallback to sample questions
      const questions = sampleQuestions[category] || sampleQuestions.Math;
      setCurrentQuiz({
        category,
        questions: questions,
        startTime: Date.now(),
        isAIGenerated: false,
      });
      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (answerIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answerIndex,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setShowResults(true);
    // Update stats (in real app, this would save to backend)
    setQuizStats((prev) => ({
      ...prev,
      totalQuizzes: prev.totalQuizzes + 1,
      timeSpentToday:
        prev.timeSpentToday +
        Math.floor((Date.now() - currentQuiz.startTime) / 60000),
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    currentQuiz.questions.forEach((question, index) => {
      if (answers[index] === question.correct) {
        correct++;
      }
    });
    return Math.round((correct / currentQuiz.questions.length) * 100);
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setShowResults(false);
    setCurrentQuestion(0);
    setAnswers({});
  };

  if (showResults) {
    const score = calculateScore();
    const correctAnswers = Object.values(answers).filter(
      (answer, index) => answer === currentQuiz.questions[index].correct,
    ).length;

    return (
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="text-white" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Quiz Complete!
          </h3>
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-gray-600">
              Here are your results for {currentQuiz.category}
            </p>
            {currentQuiz.isAIGenerated && (
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                AI Generated
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {score}%
            </div>
            <p className="text-sm text-gray-600">Final Score</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {correctAnswers}/{currentQuiz.questions.length}
            </div>
            <p className="text-sm text-gray-600">Correct Answers</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {currentQuiz.questions.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correct;

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  isCorrect
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="text-green-500 mt-1" size={20} />
                  ) : (
                    <XCircle className="text-red-500 mt-1" size={20} />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">
                      {question.question}
                    </p>
                    <p className="text-sm text-gray-600">
                      Your answer: {question.options[userAnswer]} | Correct:{' '}
                      {question.options[question.correct]}
                    </p>
                    {!isCorrect && (
                      <p className="text-xs text-gray-500 mt-1 italic">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button onClick={resetQuiz} className="flex-1" variant="outline">
            <RefreshCw size={16} className="mr-2" />
            New Quiz
          </Button>
          <Button
            onClick={() => generateQuiz(currentQuiz.category)}
            className="flex-1"
          >
            <Zap size={16} className="mr-2" />
            Retry {currentQuiz.category}
          </Button>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="text-white animate-spin" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Generating Quiz...
          </h3>
          <p className="text-gray-600 mb-4">
            Creating personalized questions using AI
          </p>
          <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse"
              style={{ width: '70%' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (currentQuiz) {
    const question = currentQuiz.questions[currentQuestion];
    const progress =
      ((currentQuestion + 1) / currentQuiz.questions.length) * 100;

    return (
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900">
                {currentQuiz.category} Quiz
              </h3>
              {currentQuiz.isAIGenerated && (
                <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  AI Generated
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {currentQuiz.questions.length}
            </p>
          </div>
          <div className="flex items-center gap-2 text-orange-600">
            <Timer size={16} />
            <span className="text-sm font-medium">
              {Math.floor((Date.now() - currentQuiz.startTime) / 60000)}:
              {String(
                Math.floor(
                  ((Date.now() - currentQuiz.startTime) % 60000) / 1000,
                ),
              ).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {question.question}
          </h4>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  answers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={resetQuiz}>
            Exit Quiz
          </Button>
          <Button
            onClick={nextQuestion}
            disabled={answers[currentQuestion] === undefined}
          >
            {currentQuestion < currentQuiz.questions.length - 1
              ? 'Next Question'
              : 'Finish Quiz'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Brain className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">AI Quiz Generator</h3>
          <p className="text-sm text-gray-600">
            College Entrance Exam Practice
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 text-center">
          <BookOpen className="text-blue-500 mx-auto mb-1" size={20} />
          <div className="font-bold text-gray-900">
            {quizStats.totalQuizzes}
          </div>
          <p className="text-xs text-gray-600">Quizzes Taken</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 text-center">
          <Target className="text-green-500 mx-auto mb-1" size={20} />
          <div className="font-bold text-gray-900">
            {quizStats.averageScore}%
          </div>
          <p className="text-xs text-gray-600">Average Score</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 text-center">
          <Award className="text-yellow-500 mx-auto mb-1" size={20} />
          <div className="font-bold text-gray-900">{quizStats.bestScore}%</div>
          <p className="text-xs text-gray-600">Best Score</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 text-center">
          <BarChart className="text-purple-500 mx-auto mb-1" size={20} />
          <div className="font-bold text-gray-900">
            {quizStats.timeSpentToday}m
          </div>
          <p className="text-xs text-gray-600">Today</p>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Choose a Category</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizCategories.map((category, index) => (
            <button
              key={index}
              onClick={() => generateQuiz(category.name)}
              disabled={isGenerating}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform`}
                >
                  {category.icon}
                </div>
                <div className="text-left">
                  <h5 className="font-semibold text-gray-900">
                    {category.name}
                  </h5>
                  <p className="text-sm text-gray-600">
                    {category.topics.slice(0, 2).join(', ')}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
        <div className="flex items-start gap-3">
          <Zap className="text-indigo-600 mt-1" size={20} />
          <div>
            <h5 className="font-semibold text-gray-900 mb-1">💡 Study Tips</h5>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Take quizzes regularly to identify weak areas</li>
              <li>• Review explanations for wrong answers</li>
              <li>• Time yourself to simulate exam conditions</li>
              <li>• Focus on subjects with lower scores</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIQuizGenerator;
