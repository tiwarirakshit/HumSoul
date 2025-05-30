import { useEffect, useRef, useState } from 'react';

export function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = async () => {
    if (!audioRef.current) return;
    
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing background music:', error);
      // If autoplay fails, we'll try to play on user interaction
      document.addEventListener('click', handleFirstInteraction, { once: true });
    }
  };

  const handleFirstInteraction = async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing background music after interaction:', error);
    }
  };

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('/audio/background.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5; // Set volume to 50%

    // Try to play immediately
    playAudio();

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  return {
    isPlaying,
    play: async () => {
      if (audioRef.current) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Error playing background music:', error);
        }
      }
    },
    pause: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    },
    setVolume: (volume: number) => {
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
    }
  };
} 