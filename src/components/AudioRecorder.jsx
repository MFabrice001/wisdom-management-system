'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Play, Pause, Trash2, AlertCircle } from 'lucide-react';
import styles from './AudioRecorder.module.css';

export default function AudioRecorder({ onAudioReady, initialAudioUrl }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(initialAudioUrl || null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Initial audio URL
    if (initialAudioUrl) {
      setAudioUrl(initialAudioUrl);
    }
    
    return cleanup;
  }, [initialAudioUrl, cleanup]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Notify parent component
        if (onAudioReady) {
          onAudioReady(url, blob);
        }

        // Stop all tracks
        cleanup();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDelete = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    if (onAudioReady) {
      onAudioReady(null, null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.recorderContainer}>
      <div className={styles.header}>
        <Mic size={20} className={styles.micIcon} />
        <span className={styles.title}>Voice Recording</span>
        <span className={styles.hint}>(For blind elders - just speak your wisdom)</span>
      </div>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {!audioUrl ? (
        <div className={styles.recordingArea}>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`${styles.recordButton} ${isRecording ? styles.recording : ''}`}
          >
            {isRecording ? (
              <>
                <Square size={24} />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic size={24} />
                <span>Start Recording</span>
              </>
            )}
          </button>
          
          {isRecording && (
            <div className={styles.recordingStatus}>
              <span className={styles.recordingDot}></span>
              <span>Recording... {formatTime(recordingTime)}</span>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.playbackArea}>
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
          />
          
          <button onClick={togglePlayback} className={styles.playButton}>
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            <span>{isPlaying ? 'Pause' : 'Play Recording'}</span>
          </button>
          
          <span className={styles.duration}>
            Duration: {formatTime(recordingTime)}
          </span>
          
          <button onClick={handleDelete} className={styles.deleteButton}>
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      )}

      <p className={styles.helpText}>
        {isRecording 
          ? 'Speak clearly and share your wisdom. Click Stop when done.' 
          : audioUrl 
            ? 'Your recording is ready! You can listen to it or record again.'
            : 'Click Start Recording to begin recording your wisdom with your voice.'
        }
      </p>
    </div>
  );
}
