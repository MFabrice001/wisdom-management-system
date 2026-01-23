'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Camera, Mic, Eye, AlertTriangle, Award } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './ProctoredQuiz.module.css';

export default function ProctoredQuiz() {
  const { data: session } = useSession();
  const { language } = useLanguage();
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
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [timerExpired, setTimerExpired] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [maxAttempts] = useState(3);
  
  const videoRef = useRef(null);
  const startTimeRef = useRef(null);

  const translations = {
    en: {
      title: 'Proctored Knowledge Quiz',
      accessDenied: 'Please log in to take the proctored quiz.',
      attemptsUsed: 'Attempts used',
      remaining: 'Remaining',
      requirements: 'Requirements:',
      webcamAccess: 'Webcam access for monitoring',
      microphoneAccess: 'Microphone access for audio monitoring',
      stayOnTab: 'Stay on this tab (max 2 switches allowed)',
      scoreRequirement: 'Score 70%+ to earn a certificate',
      maxAttempts: 'Maximum',
      attemptsAllowed: 'attempts allowed',
      startQuiz: 'Start Proctored Quiz',
      quizCompleted: 'Quiz Completed!',
      tabSwitches: 'Tab Switches',
      violationsDetected: 'Violations detected',
      congratulations: 'Congratulations! You are eligible for a certificate.',
      visitCertificate: 'Visit the Certificate section in the menu to download it.',
      certificateNotEarned: 'Certificate not earned. Requirements:',
      score: 'Score ≥ 70%',
      maxTabSwitches: 'Max 2 tab switches',
      noViolations: 'No violations',
      retakeQuiz: 'Retake Quiz',
      attemptsRemaining: 'attempts remaining',
      noMoreAttempts: 'No more attempts remaining',
      used: 'used',
      question: 'Question',
      time: 'Time'
    },
    rw: {
      title: 'Ikizamini Gikurikiranwa',
      accessDenied: 'Nyamuneka injira kugira ngo ukore ikizamini gikurikiranwa.',
      attemptsUsed: 'Ibigerageza byakoreshejwe',
      remaining: 'Bisigaye',
      requirements: 'Ibisabwa:',
      webcamAccess: 'Kugera kuri kamera yo gukurikirana',
      microphoneAccess: 'Kugera kuri mikoro yo gukurikirana amajwi',
      stayOnTab: 'Guma kuri iyi tab (byemewe guhindura inshuro 2 gusa)',
      scoreRequirement: 'Bonera 70%+ kugira ngo ubone impamyabumenyi',
      maxAttempts: 'Byibuze',
      attemptsAllowed: 'ibigerageza byemewe',
      startQuiz: 'Tangira Ikizamini',
      quizCompleted: 'Ikizamini Cyarangiye!',
      tabSwitches: 'Guhindura Tab',
      violationsDetected: 'Amakosa yabonetse',
      congratulations: 'Amashimwe! Wujuje ibisabwa kugira ngo ubone impamyabumenyi.',
      visitCertificate: 'Sura mu gice cy\'impamyabumenyi mu menu kugira ngo uyikuremo.',
      certificateNotEarned: 'Impamyabumenyi ntiyaboneka. Ibisabwa:',
      score: 'Amanota ≥ 70%',
      maxTabSwitches: 'Byibuze guhindura tab inshuro 2',
      noViolations: 'Nta makosa',
      retakeQuiz: 'Ongera Ukore Ikizamini',
      attemptsRemaining: 'ibigerageza bisigaye',
      noMoreAttempts: 'Nta bigerageza bisigaye',
      used: 'byakoreshejwe',
      question: 'Ikibazo',
      time: 'Igihe'
    }
  };

  const t = translations[language];

  // Fetch attempt count on component mount
  useEffect(() => {
    const fetchAttemptCount = async () => {
      try {
        const attemptsRes = await fetch('/api/citizen/quiz/attempts');
        const attemptsData = await attemptsRes.json();
        setAttemptCount(attemptsData.attemptCount);
      } catch (error) {
        console.error('Failed to fetch attempt count:', error);
      }
    };
    
    if (session?.user?.id) {
      fetchAttemptCount();
    }
  }, [session]);

  useEffect(() => {
    // Timer countdown
    let timer;
    if (quizStarted && !showResults && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerExpired(true);
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizStarted, showResults, timeLeft]);

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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
    // Check attempt count
    try {
      const attemptsRes = await fetch('/api/citizen/quiz/attempts');
      const attemptsData = await attemptsRes.json();
      
      if (attemptsData.attemptCount >= maxAttempts) {
        alert(`You have reached the maximum of ${maxAttempts} quiz attempts.`);
        return;
      }
      
      setAttemptCount(attemptsData.attemptCount);
    } catch (error) {
      console.error('Failed to check attempts:', error);
    }

    const cameraReady = await setupCamera();
    if (!cameraReady) return;

    try {
      const res = await fetch('/api/citizen/quiz');
      const data = await res.json();
      setQuestions(data.questions);
      setQuizStarted(true);
      setTimeLeft(300); // Reset timer to 5 minutes
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
    const timeSpentMinutes = Math.ceil((new Date() - startTimeRef.current) / 60000);
    
    if (timerExpired) {
      // Auto-submit current answers when time expires
      const currentAnswers = [...answers];
      // Fill remaining questions with empty answers
      while (currentAnswers.length < questions.length) {
        currentAnswers.push(null);
      }
      
      const score = currentAnswers.reduce((acc, answer, index) => {
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
          timeSpentMinutes: 5,
          tabSwitches,
          violations: [...violations, 'Time expired - quiz auto-submitted'],
          certificateEligible: eligible,
          timeExpired: true
        })
      });
    } else {
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
          timeSpentMinutes,
          tabSwitches,
          violations,
          certificateEligible: eligible
        })
      });
    }
    
    setShowResults(true);
    
    // Stop camera
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
  };

  const retakeQuiz = async () => {
    // Check remaining attempts before allowing retake
    try {
      const attemptsRes = await fetch('/api/citizen/quiz/attempts');
      const attemptsData = await attemptsRes.json();
      
      if (attemptsData.attemptCount >= maxAttempts) {
        alert(`You have reached the maximum of ${maxAttempts} quiz attempts.`);
        return;
      }
      
      setAttemptCount(attemptsData.attemptCount);
    } catch (error) {
      console.error('Failed to check attempts:', error);
    }
    
    setIsSetupComplete(false);
    setQuizStarted(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setTabSwitches(0);
    setViolations([]);
    setCertificateEligible(false);
    setTimeLeft(300);
    setTimerExpired(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  if (!session) {
    return <div className={styles.accessDenied}>{t.accessDenied}</div>;
  }

  if (!isSetupComplete) {
    const remainingAttempts = maxAttempts - attemptCount;
    
    return (
      <div className={styles.setupContainer}>
        <div className={styles.setupCard}>
          <h1>{t.title}</h1>
          
          {attemptCount > 0 && (
            <div className={styles.attemptInfo}>
              <AlertTriangle size={20} />
              <span>{t.attemptsUsed}: {attemptCount}/{maxAttempts} | {t.remaining}: {remainingAttempts}</span>
            </div>
          )}
          
          <div className={styles.requirements}>
            <h3>{t.requirements}</h3>
            <div className={styles.requirement}>
              <Camera size={20} />
              <span>{t.webcamAccess}</span>
            </div>
            <div className={styles.requirement}>
              <Mic size={20} />
              <span>{t.microphoneAccess}</span>
            </div>
            <div className={styles.requirement}>
              <Eye size={20} />
              <span>{t.stayOnTab}</span>
            </div>
            <div className={styles.requirement}>
              <Award size={20} />
              <span>{t.scoreRequirement}</span>
            </div>
            <div className={styles.requirement}>
              <AlertTriangle size={20} />
              <span>{t.maxAttempts} {maxAttempts} {t.attemptsAllowed}</span>
            </div>
          </div>
          <button onClick={startQuiz} className={styles.startButton}>
            {t.startQuiz}
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
          <h1>{t.quizCompleted}</h1>
          <div className={styles.scoreDisplay}>
            <span className={styles.score}>{score}/{questions.length}</span>
            <span className={styles.percentage}>{percentage.toFixed(1)}%</span>
          </div>
          
          <div className={styles.violations}>
            <p>{t.tabSwitches}: {tabSwitches}/2</p>
            {violations.length > 0 && (
              <div className={styles.violationList}>
                <AlertTriangle size={16} />
                <span>{t.violationsDetected}</span>
              </div>
            )}
          </div>

          {certificateEligible ? (
            <div className={styles.certificate}>
              <Award size={24} />
              <p>{t.congratulations}</p>
              <p>{t.visitCertificate}</p>
            </div>
          ) : (
            <div className={styles.noCertificate}>
              <p>{t.certificateNotEarned}</p>
              <ul>
                <li>{t.score} {percentage >= 70 ? '✓' : '✗'}</li>
                <li>{t.maxTabSwitches} {tabSwitches <= 2 ? '✓' : '✗'}</li>
                <li>{t.noViolations} {violations.length === 0 ? '✓' : '✗'}</li>
              </ul>
            </div>
          )}
          
          {attemptCount < maxAttempts ? (
            <button onClick={retakeQuiz} className={styles.retakeButton}>
              {t.retakeQuiz} ({maxAttempts - attemptCount} {t.attemptsRemaining})
            </button>
          ) : (
            <div className={styles.noMoreAttempts}>
              <AlertTriangle size={20} />
              <span>{t.noMoreAttempts} ({attemptCount}/{maxAttempts} {t.used})</span>
            </div>
          )}
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
          <span>{t.tabSwitches}: {tabSwitches}/2</span>
          <span>{t.question}: {currentQuestion + 1}/{questions.length}</span>
          <div className={`${styles.timer} ${timeLeft <= 60 ? styles.timerWarning : ''}`}>
            {t.time}: {formatTime(timeLeft)}
          </div>
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