import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'words.db');

async function migrate() {
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });

  // 1. Add lang column if it doesn't exist
  try {
    await db.exec('ALTER TABLE words ADD COLUMN lang TEXT');
  } catch (e) {
    // Ignore error if column already exists
  }

  // 2. Set lang = 'en' for all existing rows
  await db.exec("UPDATE words SET lang = 'en' WHERE lang IS NULL");

  // 3. Create new table with composite primary key
  await db.exec(`
    CREATE TABLE IF NOT EXISTS words_new (
      word TEXT,
      lang TEXT,
      indices TEXT,
      wiktionary TEXT,
      PRIMARY KEY (word, lang)
    )
  `);

  // 4. Copy data to new table
  await db.exec(`
    INSERT OR IGNORE INTO words_new (word, lang, indices, wiktionary)
    SELECT word, lang, indices, wiktionary FROM words
  `);

  // 5. Drop old table and rename new one
  await db.exec('DROP TABLE words');
  await db.exec('ALTER TABLE words_new RENAME TO words');

  await db.close();
  console.log('Migration complete!');
}

migrate().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});