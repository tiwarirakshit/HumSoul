import { useContext } from 'react';
import { AudioContext, AudioContextType } from '@/context/audio-context';
import { useState, useRef, useEffect } from 'react';

/**
 * Custom hook to access the audio context
 * @returns The audio context with player controls and state
 * @throws Error if used outside of AudioProvider
 */
export function useAudio(): AudioContextType {
  const context = useContext(AudioContext);
  
  if (context === null) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  
  return context;
}

// Simple audio player for individual songs
export function useSimpleAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const updateTimeProgress = () => {
    if (audioRef.current && isPlaying) {
      const currentSoundTime = audioRef.current.currentTime;
      setCurrentTime(currentSoundTime);
      if (duration > 0) {
        setProgress((currentSoundTime / duration) * 100);
      }
      timerRef.current = window.setTimeout(updateTimeProgress, 100);
    }
  };

  const loadSong = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(audioUrl);
    audioRef.current.volume = volume;
    
    audioRef.current.addEventListener('loadedmetadata', () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
        setCurrentTime(0);
        setProgress(0);
      }
    });

    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
    });

    audioRef.current.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    });

    setCurrentSong(audioUrl);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
    setProgress((time / duration) * 100);
  };

  const setVolumeLevel = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Start or stop timer based on isPlaying
  useEffect(() => {
    if (isPlaying) {
      updateTimeProgress();
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [isPlaying]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    progress,
    volume,
    currentSong,
    loadSong,
    togglePlay,
    seek,
    setVolume: setVolumeLevel,
    // Dummy functions for compatibility
    next: () => {},
    previous: () => {},
    backgroundMusicVolume: 0.3,
    setBackgroundMusicVolume: () => {},
  };
}
