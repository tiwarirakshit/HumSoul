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
  
  // Handle volume control
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };
  
  // Handle background music volume control
  const handleBackgroundVolumeChange = (value: number[]) => {
    setBackgroundMusicVolume(value[0] / 100);
  };
  
  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.5) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  if (minified) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-dark dark:text-light hover:bg-light dark:hover:bg-dark-lighter"
          onClick={previous}
        >
          <SkipBack className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="primary" 
          size="icon" 
          className="h-10 w-10 rounded-full"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-dark dark:text-light hover:bg-light dark:hover:bg-dark-lighter"
          onClick={next}
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showWaveform ? (
        <AudioProgress progress={progress} />
      ) : (
        <div className="relative pt-2">
          <Slider 
            value={[progress]} 
            max={100} 
            step={0.1}
            onValueChange={handleSeek} 
            className="mt-2" 
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-dark dark:text-light hover:bg-light dark:hover:bg-dark-lighter"
          >
            <Shuffle className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-dark dark:text-light hover:bg-light dark:hover:bg-dark-lighter"
            onClick={previous}
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="primary" 
            size="icon" 
            className="h-10 w-10 rounded-full"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-dark dark:text-light hover:bg-light dark:hover:bg-dark-lighter"
            onClick={next}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-dark dark:text-light hover:bg-light dark:hover:bg-dark-lighter"
          >
            <Repeat className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-dark dark:text-light hover:bg-light dark:hover:bg-dark-lighter"
            onClick={() => setShowVolumeControl(!showVolumeControl)}
          >
            <VolumeIcon />
          </Button>
          
          {showVolumeControl && (
            <div className="absolute bottom-full right-0 p-3 bg-white dark:bg-dark-lighter rounded-lg shadow-lg z-10 min-w-[150px]">
              <div className="mb-3">
                <div className="text-xs font-medium mb-1">Affirmation Volume</div>
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
  );
}
