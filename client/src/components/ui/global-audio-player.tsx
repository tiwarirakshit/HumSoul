import { createContext, useContext, useState, ReactNode } from 'react';
import { SimpleAudioPlayer } from './simple-audio-player';

interface GlobalAudioPlayerContextType {
  playSong: (audioUrl: string, songTitle?: string, artistName?: string, albumName?: string) => void;
  stopSong: () => void;
  currentSong: {
    audioUrl: string;
    songTitle: string;
    artistName: string;
    albumName: string;
  } | null;
}

const GlobalAudioPlayerContext = createContext<GlobalAudioPlayerContextType | null>(null);

export function useGlobalAudioPlayer() {
  const context = useContext(GlobalAudioPlayerContext);
  if (!context) {
    throw new Error('useGlobalAudioPlayer must be used within a GlobalAudioPlayerProvider');
  }
  return context;
}

interface GlobalAudioPlayerProviderProps {
  children: ReactNode;
}

export function GlobalAudioPlayerProvider({ children }: GlobalAudioPlayerProviderProps) {
  const [currentSong, setCurrentSong] = useState<{
    audioUrl: string;
    songTitle: string;
    artistName: string;
    albumName: string;
  } | null>(null);

  const playSong = (audioUrl: string, songTitle = "Song Title", artistName = "Artist Name", albumName = "Album Name") => {
    console.log("🎵 Global player: Playing song", { audioUrl, songTitle, artistName, albumName });
    setCurrentSong({
      audioUrl,
      songTitle,
      artistName,
      albumName
    });
  };

  const stopSong = () => {
    setCurrentSong(null);
  };

  return (
    <GlobalAudioPlayerContext.Provider value={{
      playSong,
      stopSong,
      currentSong
    }}>
      {children}
      {currentSong && (
        <SimpleAudioPlayer
          audioUrl={currentSong.audioUrl}
          songTitle={currentSong.songTitle}
          artistName={currentSong.artistName}
          albumName={currentSong.albumName}
        />
      )}
    </GlobalAudioPlayerContext.Provider>
  );
} 