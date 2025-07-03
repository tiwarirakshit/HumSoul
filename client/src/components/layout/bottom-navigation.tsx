import { useLocation, Link } from "wouter";
import { Home, Search, Library, Mic, User, X, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudio } from "@/hooks/use-audio";
import { AudioPlayer } from "@/components/ui/audio-player";
import { formatTime } from "@/lib/audio";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const { currentTrack, currentAffirmation, duration, isPlaying, isMiniPlayerVisible, setMiniPlayerVisible } = useAudio();
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  const itemClasses = "flex flex-col items-center text-xs";
  const iconClasses = "h-6 w-6 mb-1";
  
  // Don't show mini player on audio page or if explicitly hidden
  const showMiniPlayer = currentTrack && location !== '/audio' && isMiniPlayerVisible;

  const handleClose = () => {
    setMiniPlayerVisible(false);
  };
  
  return (
    <>
      {/* Mini Player: fixed above the nav bar, outside nav for visibility */}
      {showMiniPlayer && (
        <div className="fixed w-full left-0 bottom-14 h-28 px-4 py-2 bg-blue-100 dark:bg-blue-900 border-b border-gray-200 dark:border-dark-lighter">
          <div className="flex items-center justify-between mb-2">
            <div 
              className="flex items-center gap-3 flex-1 cursor-pointer"
              onClick={() => setLocation('/audio')}
            >
              <div className="w-10 h-10 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0">
                <i className={`bx bx-${currentTrack.playlist.icon} text-xl text-primary`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-1">{currentAffirmation?.text}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {currentTrack.playlist.title} • {formatTime(duration)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {/* Mini player controls and seekbar */}
          <div className="flex items-center w-full gap-2 mt-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={useAudio().previous}>
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button variant="default" size="icon" className="h-10 w-10 rounded-full shadow" onClick={useAudio().togglePlay}>
              {useAudio().isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={useAudio().next}>
              <SkipForward className="h-5 w-5" />
            </Button>
            {/* <span className="text-xs text-gray-500 dark:text-gray-300 min-w-[40px]">{formatTime(useAudio().currentTime)}</span> */}
            <div className="flex-1">
              <AudioPlayer minified />
            </div>
            {/* <span className="text-xs text-gray-500 dark:text-gray-300 min-w-[40px]">{formatTime(useAudio().duration)}</span> */}
          </div>
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-light border-t border-gray-200 dark:border-dark-lighter z-30 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Navigation Bar: always visible at the bottom */}
        <div className="flex justify-around items-center py-3 px-3 bg-white dark:bg-dark-light z-50 relative">
          <Link href="/">
            <a className={cn(
              itemClasses,
              isActive("/") 
                ? "text-primary dark:text-primary-light" 
                : "text-gray-500 dark:text-gray-400"
            )}>
              <Home className={iconClasses} />
              <span>Home</span>
            </a>
          </Link>
          
          <Link href="/discover">
            <a className={cn(
              itemClasses,
              isActive("/discover") 
                ? "text-primary dark:text-primary-light" 
                : "text-gray-500 dark:text-gray-400"
            )}>
              <Search className={iconClasses} />
              <span>Discover</span>
            </a>
          </Link>
          
          <Link href="/library">
            <a className={cn(
              itemClasses,
              isActive("/library") 
                ? "text-primary dark:text-primary-light" 
                : "text-gray-500 dark:text-gray-400"
            )}>
              <Library className={iconClasses} />
              <span>Library</span>
            </a>
          </Link>
          
          <Link href="/profile">
            <a className={cn(
              itemClasses,
              isActive("/profile") 
                ? "text-primary dark:text-primary-light" 
                : "text-gray-500 dark:text-gray-400"
            )}>
              <User className={iconClasses} />
              <span>Profile</span>
            </a>
          </Link>
        </div>
      </nav>
    </>
  );
}
