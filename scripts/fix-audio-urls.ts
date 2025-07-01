import { db } from '../server/db';
import { affirmations } from '../shared/schema';
import { backgroundMusics } from '../shared/schema';
import { eq, sql } from 'drizzle-orm';

async function fixAudioUrls() {
  // Update affirmations
  await db.execute(
    sql`UPDATE ${affirmations} SET audio_url = REPLACE(audio_url, '/api/audio/', '/audio/') WHERE audio_url LIKE '/api/audio/%'`
  );
  // Update background musics
  await db.execute(
    sql`UPDATE ${backgroundMusics} SET audio_url = REPLACE(audio_url, '/api/audio/', '/audio/') WHERE audio_url LIKE '/api/audio/%'`
  );
  console.log('✅ Fixed audio_url fields in affirmations and background_musics tables.');
}

fixAudioUrls().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }); 