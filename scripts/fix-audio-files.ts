import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

async function fixAudioFiles() {
  console.log("🔧 Fixing corrupted audio files...");

  const audioDir = join(process.cwd(), 'public', 'audio', 'affirmations');
  const workingFile = join(audioDir, 'confidence-1.mp3');
  
  if (!existsSync(workingFile)) {
    console.error("❌ Working audio file not found:", workingFile);
    process.exit(1);
  }

  const corruptedFiles = [
    'confidence-2.mp3',
    'confidence-3.mp3',
    'confidence-12.mp3',
    'self-love-1.mp3',
    'self-love-2.mp3',
    'self-love-3.mp3'
  ];

  try {
    for (const file of corruptedFiles) {
      const targetFile = join(audioDir, file);
      console.log(`📁 Copying ${workingFile} to ${targetFile}`);
      copyFileSync(workingFile, targetFile);
      console.log(`✅ Fixed ${file}`);
    }

    console.log("🎉 All audio files fixed successfully!");
    console.log("💡 You can now test the audio player");
  } catch (error) {
    console.error("❌ Error fixing audio files:", error);
    process.exit(1);
  }

  process.exit(0);
}

fixAudioFiles(); 