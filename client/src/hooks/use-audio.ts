import { useContext } from 'react';
import { AudioContext, AudioContextType } from '@/context/audio-context';

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
