/**
 * Clear Database Script
 * ====================
 *
 * This script completely clears the database by dropping and recreating the words table.
 * Use with caution as this will delete all word data in the database.
 */

import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import prompts from 'prompts';

// Get the directory name for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Clears the database by dropping and recreating the words table
 */
async function clearDatabase() {
  console.log('\n⚠️  WARNING: This will completely clear the database and delete all word data! ⚠️\n');

  // Ask for confirmation
  const response = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Are you sure you want to clear the database? This action cannot be undone.',
    initial: false
  });

  // Exit if the user cancelled or didn't confirm
  if (!response.value) {
    console.log('\nDatabase clearing cancelled. No changes were made.\n');
    return;
  }

  // Open the database
  const dbPath = path.resolve(process.cwd(), 'words.db');
  console.log(`\nUsing database at: ${dbPath}`);
  const db = new sqlite3.Database(dbPath);

  try {
    console.log('Clearing database...');

    // Drop the words table if it exists
    await new Promise<void>((resolve, reject) => {
      db.run('DROP TABLE IF EXISTS words', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Words table dropped.');

    // Recreate the words table
    await new Promise<void>((resolve, reject) => {
      db.run(`
        CREATE TABLE words (
          word TEXT PRIMARY KEY,
          indices TEXT,
          wiktionary TEXT
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Words table recreated.');
    console.log('Database has been cleared successfully.');

  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed.');
      }
    });
  }
}

// Run the function if this script is executed directly
if (import.meta.url.endsWith(process.argv[1])) {
  clearDatabase().catch(console.error);
}

// Export the function for use in other scripts
export { clearDatabase };
