import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  Volume1,
  VolumeX
} from "lucide-react";
import { formatTime } from "@/lib/audio";
import { useAudio } from "@/hooks/use-audio";
import AudioProgress from "./audio-progress";
import { Music } from "lucide-react";

interface AudioPlayerProps {
  showWaveform?: boolean;
  minified?: boolean;
}

export function AudioPlayer({ showWaveform = false, minified = false }: AudioPlayerProps) {
  const {
    isPlaying,
    currentTime,
    duration,
    progress,
    volume,
    backgroundMusicVolume,
    togglePlay,
    seek,
    next,
    previous,
    setVolume,
    setBackgroundMusicVolume
  } = useAudio();

  const [showVolumeControl, setShowVolumeControl] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") {
        next();
      } else if (e.code === "ArrowLeft") {
        previous();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePlay, next, previous]);

  // Handle seek when slider is moved
  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    seek(newTime);
  };

  // Handle seek for HTML range input
  const handleRangeSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const newTime = (value / 100) * duration;
    seek(newTime);
  };

  // Handle volume control
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  // Handle background music volume control
  const handleBackgroundVolumeChange = (value: number[]) => {
    setBackgroundMusicVolume(value[0] / 100);
  };

  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-5 w-5" />;
    if (volume < 0.5) return <Volume1 className="h-5 w-5" />;
    return <Volume2 className="h-5 w-5" />;
  };

  // --- Spotify-like fixed bottom bar ---
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-white/90 dark:bg-dark-lighter/90 shadow-2xl border-t border-gray-200 dark:border-gray-800 backdrop-blur-lg">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-2 gap-2">
        {/* Song Info (placeholder) */}
        <div className="flex items-center gap-3 min-w-[180px] w-full md:w-auto mb-2 md:mb-0">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded shadow-inner flex items-center justify-center">
            {/* Album Art Placeholder */}
            <Music className="h-7 w-7 text-gray-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-base text-gray-900 dark:text-white truncate max-w-[120px]">Song Title</span>
            <span className="text-xs text-gray-500 dark:text-gray-300 truncate max-w-[120px]">Artist Name</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800" onClick={previous}>
              <SkipBack className="h-6 w-6" />
            </Button>
            <Button variant="default" size="icon" className="h-14 w-14 rounded-full shadow-lg" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800" onClick={next}>
              <SkipForward className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex items-center w-full gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-300 min-w-[40px]">{formatTime(currentTime)}</span>
            <Slider
              value={[progress]}
              max={100}
              step={1}
              onValueChange={handleSeek}
              className="w-full max-w-xs"
            />
            <span className="text-xs text-gray-500 dark:text-gray-300 min-w-[40px]">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & More */}
        <div className="flex flex-col items-end min-w-[120px] w-full md:w-auto mt-2 md:mt-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setShowVolumeControl(!showVolumeControl)}>
              <VolumeIcon />
            </Button>
            {showVolumeControl && (
              <div className="absolute bottom-16 right-4 p-3 bg-white dark:bg-dark-lighter rounded-lg shadow-lg z-50 min-w-[150px]">
                <div className="mb-3">
                  <div className="text-xs font-medium mb-1">Volume</div>
                  <div className="flex items-center gap-2">
                    <VolumeIcon />
                    <Slider
                      value={[volume * 100]}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium mb-1">Background Music</div>
                  <div className="flex items-center gap-2">
                    <Volume1 className="h-4 w-4" />
                    <Slider
                      value={[backgroundMusicVolume * 100]}
                      max={100}
                      step={1}
                      onValueChange={handleBackgroundVolumeChange}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}