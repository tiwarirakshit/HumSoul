import { useEffect, useRef, useState } from "react";

export function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing background music:", error);
      // If autoplay fails, we'll try to play on user interaction
      document.addEventListener("click", handleFirstInteraction, {
        once: true,
      });
    }
  };

  const handleFirstInteraction = async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing background music after interaction:", error);
    }
  };

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio("/audio/background.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5; // Set volume to 50%

    // Try to play immediately and only for initial 5 seconds
    playAudio();

    // Stop audio after 5 seconds
    setTimeout(() => {
      if (audioRef.current) {
        const audio = audioRef.current;
        let fadeDuration = 5000; // 5 seconds
        let fadeSteps = 50; // Number of steps in fade
        let fadeStepTime = fadeDuration / fadeSteps; // Time per step
        let step = 0;

        const originalVolume = audio.volume;
        const fadeOutInterval = setInterval(() => {
          if (step >= fadeSteps) {
            clearInterval(fadeOutInterval);
            audio.pause();
            audio.volume = originalVolume; // Reset volume
            setIsPlaying(false);
          } else {
            audio.volume = originalVolume * (1 - step / fadeSteps);
            step++;
          }
        }, fadeStepTime);
      }
    }, 5000);

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      document.removeEventListener("click", handleFirstInteraction);
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
          console.error("Error playing background music:", error);
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
    },
  };
}
