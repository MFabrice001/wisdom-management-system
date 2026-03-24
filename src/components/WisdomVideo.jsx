'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import styles from './WisdomVideo.module.css';

export default function WisdomVideo({ videoUrl, videoThumbnail, title }) {
  // ALWAYS declare ALL hooks at the top level before any conditional returns
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setCurrentTime(video.currentTime);
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      if (video.duration) {
        setDuration(video.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    video.currentTime = percentage * video.duration;
  };

  const skip = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime += seconds;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  // The conditional return MUST go here, after all hooks!
  if (!videoUrl) {
    return null;
  }

  return (
    <div className={styles.videoContainer}>
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          src={videoUrl}
          poster={videoThumbnail}
          className={styles.video}
          onClick={togglePlay}
          playsInline
        />
        
        {/* Play/Pause overlay */}
        {!isPlaying && (
          <button className={styles.playOverlay} onClick={togglePlay}>
            <div className={styles.playButton}>
              <Play size={48} fill="white" />
            </div>
          </button>
        )}

        {/* Controls */}
        <div className={styles.controls}>
          {/* Progress bar */}
          <div className={styles.progressContainer} onClick={handleSeek}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className={styles.controlsRow}>
            <div className={styles.leftControls}>
              <button onClick={togglePlay} className={styles.controlButton}>
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              <button onClick={() => skip(-10)} className={styles.controlButton}>
                <SkipBack size={20} />
              </button>
              
              <button onClick={() => skip(10)} className={styles.controlButton}>
                <SkipForward size={20} />
              </button>

              <button onClick={toggleMute} className={styles.controlButton}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              <span className={styles.time}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className={styles.rightControls}>
              <button onClick={handleFullscreen} className={styles.controlButton}>
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {title && <p className={styles.videoTitle}>{title}</p>}
    </div>
  );
}