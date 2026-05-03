'use client';

import { useState } from 'react';
import { QuizQuestion } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface QuizCardProps {
  question: QuizQuestion;
  onAnswer: (isCorrect: boolean, questionId?: number, selectedOption?: string) => void;
  onNext: () => void;
}

export function QuizCard({ question, onAnswer, onNext }: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const isCorrect = selectedAnswer === question.answer;

  const handleSelectAnswer = (answer: string) => {
    if (!isAnswered) {
      setSelectedAnswer(answer);
      setIsAnswered(true);
      const correct = answer === question.answer;
      onAnswer(correct, question.question_id, answer);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowExplanation(false);
    onNext();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Question */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {question.question}
        </h2>
        <p className="text-sm text-gray-500">
          Pregunta #{question.id}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === question.answer;

          let buttonClass = 'w-full justify-start text-left px-4 py-3 border-2 rounded-lg transition-colors ';

          if (!isAnswered) {
            buttonClass += 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-900 cursor-pointer';
          } else if (isCorrectOption) {
            buttonClass += 'border-green-500 bg-green-50 text-green-900';
          } else if (isSelected) {
            buttonClass += 'border-red-500 bg-red-50 text-red-900';
          } else {
            buttonClass += 'border-gray-300 text-gray-500 opacity-50';
          }

          return (
            <button
              key={option}
              onClick={() => handleSelectAnswer(option)}
              disabled={isAnswered}
              className={buttonClass}
            >
              <span className="text-sm">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation Section */}
      {isAnswered && (
        <div className="mb-6 border border-gray-200 rounded-lg">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? '✓ Respuesta Correcta' : '✗ Respuesta Incorrecta'}
              </span>
            </div>
            {showExplanation ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {showExplanation && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-700 leading-relaxed">
                {question.justification}
              </p>
              {question.source && (
                <p className="text-xs text-gray-500 mt-2">
                  Fuente: {question.source}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Next Button */}
      {isAnswered && (
        <Button
          onClick={handleNext}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
        >
          Siguiente Pregunta
        </Button>
      )}
    </div>
  );
}

/* Skeleton Loader */
export function QuizCardSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md animate-pulse">
      {/* Question skeleton */}
      <div className="mb-6">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>

      {/* Options skeleton */}
      <div className="space-y-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
        ))}
      </div>

      {/* Explanation skeleton */}
      <div className="h-10 bg-gray-200 rounded-lg"></div>
    </div>
  );
}
