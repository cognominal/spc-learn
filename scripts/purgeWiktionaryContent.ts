import sqlite3 from 'sqlite3';
import path from 'path';
import { dumpDbToYAML } from './dumpDatabase';

/**
 * Purges all Wiktionary content from the database while preserving word indices.
 * This forces the application to fetch and process Wiktionary content again using the new pipeline.
 */
async function purgeWiktionaryContent() {
    // Open the database
    const dbPath = path.resolve(process.cwd(), 'words.db');
    console.log(`Using database at: ${dbPath}`);
    const db = new sqlite3.Database(dbPath);

    console.log('Purging Wiktionary content from the database...');

    try {
        // Update all words to set wiktionary content to null
        await new Promise<void>((resolve, reject) => {
            db.run('UPDATE words SET wiktionary = NULL', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log('Successfully purged Wiktionary content from the database.');
        console.log('The next time you click on a word, it will fetch and process the Wiktionary content again.');

        // Count how many words are in the database
        const row = await new Promise<{ count: number }>((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM words', (err, row: { count: number }) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        console.log(`Database contains ${row.count} words with preserved indices.`);

        // Create a new database dump
        console.log('Creating a new database dump...');
        await dumpDbToYAML(false);

    } catch (error) {
        console.error('Error during database operations:', error);
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

// Run the purge function
purgeWiktionaryContent().catch(console.error);
