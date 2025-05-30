import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Waveform } from "./waveform";

interface AudioProgressProps {
  progress: number;
  className?: string;
}

export default function AudioProgress({ progress, className }: AudioProgressProps) {
  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);
  
  // Generate random waveform heights on first render
  useEffect(() => {
    const heights = Array.from({ length: 40 }, () => 
      Math.max(5, Math.floor(Math.random() * 30))
    );
    setWaveformHeights(heights);
  }, []);
  
  // Animate waveform if audio is playing (progress is changing)
  useEffect(() => {
    if (progress > 0) {
      const interval = setInterval(() => {
        setWaveformHeights(prev => 
          prev.map(() => Math.max(5, Math.floor(Math.random() * 30)))
        );
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [progress]);

  return (
    <div className={cn("my-2", className)}>
      <Waveform heights={waveformHeights} progress={progress} />
    </div>
  );
}
