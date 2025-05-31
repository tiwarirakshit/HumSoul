import { cn } from "@/lib/utils";

interface WaveformProps {
  heights: number[];
  progress: number;
  className?: string;
}

export function Waveform({ heights, progress, className }: WaveformProps) {
  // Calculate which bars should be highlighted based on progress
  const progressIndex = Math.floor((heights.length * progress) / 100);
  
  return (
    <div className={cn("audio-waveform h-10 flex items-center justify-center", className)}>
      {heights.map((height, index) => (
        <div
          key={index}
          className={cn(
            "waveform-bar mx-[1px] rounded-[1px]",
            index <= progressIndex 
              ? "bg-primary dark:bg-primary" 
              : "bg-gray-300 dark:bg-gray-700"
          )}
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
}
