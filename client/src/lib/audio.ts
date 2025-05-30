// Format time in seconds to mm:ss format
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Format duration in seconds to text (e.g., "15 min")
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0 min';
  
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

// Get random height for waveform bars (for visual effect)
export function getRandomWaveformHeight(): number {
  return Math.max(5, Math.floor(Math.random() * 30));
}

// Create array of waveform bar heights
export function generateWaveform(barCount: number = 40): number[] {
  return Array.from({ length: barCount }, () => getRandomWaveformHeight());
}
