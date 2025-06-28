import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize2,
  Minimize2,
  Heart,
  List,
  Music
} from "lucide-react";
import { formatTime } from "@/lib/audio";
import { useSimpleAudio } from "@/hooks/use-audio";

interface SimpleAudioPlayerProps {
  audioUrl?: string;
  songTitle?: string;
  artistName?: string;
  albumName?: string;
}

export function SimpleAudioPlayer({ 
  audioUrl, 
  songTitle = "Song Title", 
  artistName = "Artist Name", 
  albumName = "Album Name" 
}: SimpleAudioPlayerProps) {
  const {
    isPlaying,
    currentTime,
    duration,
    progress,
    volume,
    currentSong,
    loadSong,
    togglePlay,
    seek,
    setVolume
  } = useSimpleAudio();

  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load song when audioUrl changes
  useEffect(() => {
    if (audioUrl && audioUrl !== currentSong) {
      console.log("🎵 Loading song:", audioUrl);
      loadSong(audioUrl);
    }
  }, [audioUrl, currentSong, loadSong]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePlay]);

  // Handle seek when slider is moved
  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    seek(newTime);
  };

  // Handle volume control
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-5 w-5" />;
    if (volume < 0.5) return <Volume1 className="h-5 w-5" />;
    return <Volume2 className="h-5 w-5" />;
  };

  // Don't render if no audio URL
  if (!audioUrl) {
    return null;
  }

  return (
    <>
      {/* Main Player Bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white/90 dark:bg-dark-lighter/90 shadow-2xl border-t border-gray-200 dark:border-gray-800 backdrop-blur-lg">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-2 gap-2">
          {/* Song Info */}
          <div className="flex items-center gap-3 min-w-[180px] w-full md:w-auto mb-2 md:mb-0">
            <div 
              className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded shadow-inner flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {/* Album Art Placeholder */}
              <Music className="h-7 w-7 text-gray-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base text-gray-900 dark:text-white truncate max-w-[120px]">{songTitle}</span>
              <span className="text-xs text-gray-500 dark:text-gray-300 truncate max-w-[120px]">{artistName}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <Button variant="default" size="icon" className="h-14 w-14 rounded-full shadow-lg" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
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
              <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Player Overlay */}
      {isExpanded && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsExpanded(false)}>
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-dark-lighter rounded-t-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            {/* Expanded Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-inner flex items-center justify-center">
                  <Music className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{songTitle}</h2>
                  <p className="text-gray-500 dark:text-gray-300">{artistName}</p>
                  <p className="text-sm text-gray-400">{albumName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                  <List className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <Slider
                value={[progress]}
                max={100}
                step={1}
                onValueChange={handleSeek}
                className="w-full mb-2"
              />
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-300">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Expanded Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button variant="default" size="icon" className="h-16 w-16 rounded-full shadow-lg" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-10 w-10" /> : <Play className="h-10 w-10" />}
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <VolumeIcon />
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
} 