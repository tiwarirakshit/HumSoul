import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Howl } from 'howler';

export function AudioTest() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Howl | null>(null);

  const testAudio = () => {
    console.log("🧪 Testing audio...");
    
    if (sound) {
      sound.stop();
      sound.unload();
    }

    const testSound = new Howl({
      src: ['/audio/affirmations/confidence-1.mp3'],
      html5: true,
      volume: 0.7,
      onload: () => {
        console.log("✅ Test audio loaded successfully");
        setSound(testSound);
      },
      onloaderror: (id, error) => {
        console.error("❌ Test audio failed to load:", error);
      },
      onplayerror: (id, error) => {
        console.error("❌ Test audio failed to play:", error);
      },
      onend: () => {
        console.log("🏁 Test audio ended");
        setIsPlaying(false);
      }
    });

    testSound.load();
  };

  const togglePlay = () => {
    if (!sound) {
      testAudio();
      return;
    }

    if (isPlaying) {
      sound.pause();
      setIsPlaying(false);
    } else {
      sound.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-background">
      <h3 className="text-lg font-semibold mb-4">Audio Test</h3>
      <div className="flex gap-2">
        <Button onClick={togglePlay} variant="outline">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? 'Pause' : 'Play'} Test Audio
        </Button>
        <Button onClick={testAudio} variant="outline">
          <Volume2 className="h-4 w-4" />
          Load Test Audio
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Check browser console for audio debugging info
      </p>
    </div>
  );
} 