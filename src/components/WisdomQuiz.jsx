'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Brain, CheckCircle, XCircle, ChevronRight, Award } from 'lucide-react';
import styles from './WisdomQuiz.module.css';

export default function WisdomQuiz({ wisdom, onQuizComplete }) {
  const { data: session } = useSession();
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safely handle wisdom and quizzes being undefined
    const wisdomQuizzes = wisdom?.quizzes;
    if (wisdomQuizzes && Array.isArray(wisdomQuizzes) && wisdomQuizzes.length > 0) {
      // Shuffle the quizzes for variety
      const shuffled = [...wisdomQuizzes].sort(() => Math.random() - 0.5);
      setQuizzes(shuffled);
    }
    setLoading(false);
  }, [wisdom]);

  // Don't render if no quizzes or still loading
  if (loading || quizzes.length === 0) {
    return null;
  }

  const currentQuiz = quizzes[currentQuestion];
  
  // Safety check for current quiz
  if (!currentQuiz) {
    return null;
  }

  const handleAnswer = async (option) => {
    if (showResult) return;
    
    setSelectedAnswer(option);
    setShowResult(true);

    const isCorrect = option === currentQuiz.correctAnswer;
    
    setAnswers(prev => [...prev, {
      quizId: currentQuiz.id,
      selectedAnswer: option,
      isCorrect
    }]);

    // Save attempt to API if user is logged in
    if (session?.user) {
      try {
        await fetch('/api/citizen/wisdom-quiz-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizId: currentQuiz.id,
            selectedAnswer: option,
            isCorrect
          })
        });
      } catch (error) {
        console.error('Error saving quiz attempt:', error);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizzes.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz completed
      const correctCount = answers.filter(a => a.isCorrect).length + 
        (selectedAnswer === currentQuiz.correctAnswer ? 1 : 0);
      
      if (onQuizComplete) {
        onQuizComplete({
          totalQuestions: quizzes.length,
          correctAnswers: correctCount,
          answers: [...answers, {
            quizId: currentQuiz.id,
            selectedAnswer,
            isCorrect: selectedAnswer === currentQuiz.correctAnswer
          }]
        });
      }
    }
  };

  const isCorrect = selectedAnswer === currentQuiz?.correctAnswer;
  const progress = ((currentQuestion + 1) / quizzes.length) * 100;

  return (
    <div className={styles.quizContainer}>
      <div className={styles.quizHeader}>
        <div className={styles.quizTitle}>
          <Brain size={24} />
          <h3>Test Your Knowledge</h3>
        </div>
        <div className={styles.progress}>
          <span>Question {currentQuestion + 1} of {quizzes.length}</span>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className={styles.questionCard}>
        <p className={styles.question}>{currentQuiz?.question}</p>
        
        <div className={styles.options}>
          {Array.isArray(currentQuiz?.options) && currentQuiz.options.map((option, index) => {
            let optionClass = styles.option;
            
            if (showResult) {
              if (option === currentQuiz.correctAnswer) {
                optionClass = `${styles.option} ${styles.correct}`;
              } else if (option === selectedAnswer && !isCorrect) {
                optionClass = `${styles.option} ${styles.incorrect}`;
              }
            } else if (selectedAnswer === option) {
              optionClass = `${styles.option} ${styles.selected}`;
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={optionClass}
                disabled={showResult}
              >
                <span className={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
                {showResult && option === currentQuiz.correctAnswer && (
                  <CheckCircle size={20} className={styles.iconCorrect} />
                )}
                {showResult && option === selectedAnswer && !isCorrect && (
                  <XCircle size={20} className={styles.iconIncorrect} />
                )}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className={`${styles.result} ${isCorrect ? styles.resultCorrect : styles.resultIncorrect}`}>
            {isCorrect ? (
              <>
                <CheckCircle size={24} />
                <div>
                  <strong>Correct! 🎉</strong>
                  {currentQuiz.explanation && (
                    <p className={styles.explanation}>{currentQuiz.explanation}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <XCircle size={24} />
                <div>
                  <strong>Not quite!</strong>
                  <p>The correct answer is: <strong>{currentQuiz.correctAnswer}</strong></p>
                  {currentQuiz.explanation && (
                    <p className={styles.explanation}>{currentQuiz.explanation}</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {showResult && (
          <button onClick={handleNext} className={styles.nextButton}>
            {currentQuestion < quizzes.length - 1 ? (
              <>
                Next Question <ChevronRight size={20} />
              </>
            ) : (
              <>
                <Award size={20} /> Complete Quiz
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
