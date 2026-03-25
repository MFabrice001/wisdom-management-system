'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Brain, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import styles from './WisdomQuizCard.module.css';

export default function WisdomQuizCard({ quiz }) {
  const { data: session } = useSession();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAnswer = async (option) => {
    if (showResult || submitting) return;
    
    setSelectedAnswer(option);
    setShowResult(true);
    setSubmitting(true);

    const isCorrect = option === quiz.correctAnswer;
    
    // Save attempt to API if user is logged in
    if (session?.user) {
      try {
        await fetch('/api/citizen/wisdom-quiz-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizId: quiz.id,
            selectedAnswer: option,
            isCorrect
          })
        });
      } catch (error) {
        console.error('Error saving quiz attempt:', error);
      }
    }
    
    setSubmitting(false);
  };

  const isCorrect = selectedAnswer === quiz?.correctAnswer;

  return (
    <div className={styles.quizCard}>
      <div className={styles.quizHeader}>
        <Brain size={18} />
        <span className={styles.quizLabel}>Ibisakuzo (Quiz)</span>
      </div>
      
      <div className={styles.questionSection}>
        <p className={styles.question}>{quiz.question}</p>
        
        <div className={styles.options}>
          {Array.isArray(quiz.options) && quiz.options.map((option, index) => {
            let optionClass = styles.option;
            
            if (showResult) {
              if (option === quiz.correctAnswer) {
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
                disabled={showResult || submitting}
              >
                <span className={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
                {showResult && option === quiz.correctAnswer && (
                  <CheckCircle size={16} className={styles.iconCorrect} />
                )}
                {showResult && option === selectedAnswer && !isCorrect && (
                  <XCircle size={16} className={styles.iconIncorrect} />
                )}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className={`${styles.result} ${isCorrect ? styles.resultCorrect : styles.resultIncorrect}`}>
            {isCorrect ? (
              <>
                <CheckCircle size={20} />
                <div>
                  <strong>Ni byo! (Correct!) 🎉</strong>
                  {quiz.explanation && (
                    <p className={styles.explanation}>{quiz.explanation}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <XCircle size={20} />
                <div>
                  <strong>Si byo! (Not quite!)</strong>
                  <p className={styles.correctAnswer}>
                    Igisubizo/nkakurikiro: <strong>{quiz.correctAnswer}</strong>
                  </p>
                  {quiz.explanation && (
                    <p className={styles.explanation}>{quiz.explanation}</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}