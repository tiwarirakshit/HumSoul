import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const affirmations = [
  {
    text: "I am confident and capable in everything I do",
    output: "confidence-1.mp3"
  },
  {
    text: "I trust in my abilities and inner wisdom",
    output: "confidence-2.mp3"
  },
  {
    text: "I radiate confidence, self-respect, and inner harmony",
    output: "confidence-3.mp3"
  },
  {
    text: "I am worthy of love, respect, and happiness",
    output: "self-love-1.mp3"
  },
  {
    text: "I accept myself fully for who I am",
    output: "self-love-2.mp3"
  },
  {
    text: "I am enough, just as I am",
    output: "self-love-3.mp3"
  }
];

async function generateAudio() {
  console.log("🎙️ Generating affirmation audio files...");

  for (const affirmation of affirmations) {
    try {
      const outputPath = path.join('public', 'audio', 'affirmations', affirmation.output);
      
      // Using macOS say command to generate audio
      await execAsync(`say -v Samantha "${affirmation.text}" -o "${outputPath}"`);
      console.log(`✓ Generated ${affirmation.output}`);
    } catch (error) {
      console.error(`Error generating ${affirmation.output}:`, error);
    }
  }

  console.log("✅ Audio generation complete!");
}

generateAudio(); 