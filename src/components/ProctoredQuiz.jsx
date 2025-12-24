'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Camera, Mic, Eye, AlertTriangle, Award } from 'lucide-react';
import styles from './ProctoredQuiz.module.css';

export default function ProctoredQuiz() {
  const { data: session } = useSession();
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [violations, setViolations] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [certificateEligible, setCertificateEligible] = useState(false);
  
  const videoRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    // Monitor tab switches
    const handleVisibilityChange = () => {
      if (quizStarted && document.hidden) {
        const newCount = tabSwitches + 1;
        setTabSwitches(newCount);
        
        if (newCount > 2) {
          setViolations(prev => [...prev, `Tab switch violation #${newCount} at ${new Date().toLocaleTimeString()}`]);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [quizStarted, tabSwitches]);

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return true;
    } catch (error) {
      alert('Camera and microphone access is required for the proctored quiz.');
      return false;
    }
  };

  const startQuiz = async () => {
    const cameraReady = await setupCamera();
    if (!cameraReady) return;

    try {
      const res = await fetch('/api/citizen/quiz');
      const data = await res.json();
      setQuestions(data.questions);
      setQuizStarted(true);
      startTimeRef.current = new Date();
      setIsSetupComplete(true);
    } catch (error) {
      alert('Failed to load quiz questions.');
    }
  };

  const submitAnswer = (answer) => {
    setAnswers([...answers, answer]);
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const score = answers.reduce((acc, answer, index) => {
      return acc + (answer === questions[index]?.correctAnswer ? 1 : 0);
    }, 0);
    
    const percentage = (score / questions.length) * 100;
    const eligible = percentage >= 70 && tabSwitches <= 2 && violations.length === 0;
    
    setCertificateEligible(eligible);
    
    // Submit quiz attempt
    await fetch('/api/citizen/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score,
        totalQuestions: questions.length,
        percentage,
        tabSwitches,
        violations,
        certificateEligible: eligible
      })
    });
    
    setShowResults(true);
    
    // Stop camera
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
  };

  const retakeQuiz = () => {
    setIsSetupComplete(false);
    setQuizStarted(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setTabSwitches(0);
    setViolations([]);
    setCertificateEligible(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  if (!session) {
    return <div className={styles.accessDenied}>Please log in to take the proctored quiz.</div>;
  }

  if (!isSetupComplete) {
    return (
      <div className={styles.setupContainer}>
        <div className={styles.setupCard}>
          <h1>Proctored Knowledge Quiz</h1>
          <div className={styles.requirements}>
            <h3>Requirements:</h3>
            <div className={styles.requirement}>
              <Camera size={20} />
              <span>Webcam access for monitoring</span>
            </div>
            <div className={styles.requirement}>
              <Mic size={20} />
              <span>Microphone access for audio monitoring</span>
            </div>
            <div className={styles.requirement}>
              <Eye size={20} />
              <span>Stay on this tab (max 2 switches allowed)</span>
            </div>
            <div className={styles.requirement}>
              <Award size={20} />
              <span>Score 70%+ to earn a certificate</span>
            </div>
          </div>
          <button onClick={startQuiz} className={styles.startButton}>
            Start Proctored Quiz
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = answers.reduce((acc, answer, index) => {
      return acc + (answer === questions[index]?.correctAnswer ? 1 : 0);
    }, 0);
    const percentage = (score / questions.length) * 100;

    return (
      <div className={styles.resultsContainer}>
        <div className={styles.resultsCard}>
          <h1>Quiz Completed!</h1>
          <div className={styles.scoreDisplay}>
            <span className={styles.score}>{score}/{questions.length}</span>
            <span className={styles.percentage}>{percentage.toFixed(1)}%</span>
          </div>
          
          <div className={styles.violations}>
            <p>Tab Switches: {tabSwitches}/2</p>
            {violations.length > 0 && (
              <div className={styles.violationList}>
                <AlertTriangle size={16} />
                <span>Violations detected</span>
              </div>
            )}
          </div>

          {certificateEligible ? (
            <div className={styles.certificate}>
              <Award size={24} />
              <p>Congratulations! You are eligible for a certificate.</p>
              <p>Visit the Certificate section in the menu to download it.</p>
            </div>
          ) : (
            <div className={styles.noCertificate}>
              <p>Certificate not earned. Requirements:</p>
              <ul>
                <li>Score ≥ 70% {percentage >= 70 ? '✓' : '✗'}</li>
                <li>Max 2 tab switches {tabSwitches <= 2 ? '✓' : '✗'}</li>
                <li>No violations {violations.length === 0 ? '✓' : '✗'}</li>
              </ul>
            </div>
          )}
          
          <button onClick={retakeQuiz} className={styles.retakeButton}>
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className={styles.quizContainer}>
      <div className={styles.monitoringPanel}>
        <video ref={videoRef} autoPlay muted className={styles.cameraFeed} />
        <div className={styles.stats}>
          <span>Tab Switches: {tabSwitches}/2</span>
          <span>Question: {currentQuestion + 1}/{questions.length}</span>
        </div>
      </div>

      <div className={styles.questionPanel}>
        <h2>{currentQ?.question}</h2>
        <div className={styles.options}>
          {currentQ?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => submitAnswer(option)}
              className={styles.optionButton}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}