import sqlite3 from 'sqlite3';
import { promisify } from 'util';

interface WordData {
    word: string;
    indices: number[];
    wiktionary: string | null;
}

import path from 'path';

// Open database with sqlite3 using an absolute path
const dbPath = path.resolve(process.cwd(), 'words.db');
console.log(`Using database at: ${dbPath}`);
const db = new sqlite3.Database(dbPath);

// Helper function to run SQL as a promise
const runAsync = promisify(db.run.bind(db));
const getAsync = promisify(db.get.bind(db));
const allAsync = promisify(db.all.bind(db));
const execAsync = promisify(db.exec.bind(db));

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');
db.run('PRAGMA journal_mode = WAL');

// Create table if it doesn't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS words (
        word TEXT PRIMARY KEY,
        indices TEXT,
        wiktionary TEXT
    )
`, (err) => {
    if (err) {
        console.error('Error creating table:', err);
    } else {
        console.log('Table created or already exists');
    }
});

export async function storeWordData(word: string, indices: number[], wiktionary: string | null): Promise<void> {
    // Normalize the word to ensure consistent storage
    const normalizedWord = word.toLowerCase().trim();

    console.log(`Storing word in database: '${normalizedWord}'`);
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT OR REPLACE INTO words (word, indices, wiktionary) VALUES (?, ?, ?)',
            [normalizedWord, JSON.stringify(indices), wiktionary],
            (err) => {
                if (err) {
                    console.error('Error storing word:', err);
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
}

export async function getWordData(word: string): Promise<WordData | undefined> {
    // Normalize the word to ensure consistent lookup
    const normalizedWord = word.toLowerCase().trim();

    // Debug log to track lookups
    console.log(`Looking up word in database: '${normalizedWord}'`);

    return new Promise((resolve, reject) => {
        db.get(
            'SELECT word, indices, wiktionary FROM words WHERE word = ?',
            [normalizedWord],
            (err, row) => {
                if (err) {
                    console.error('Error getting word:', err);
                    reject(err);
                    return;
                }

                if (!row) {
                    console.log(`Word '${normalizedWord}' not found in database`);
                    resolve(undefined);
                    return;
                }

                console.log(`Found word '${normalizedWord}' in database`);
                resolve({
                    word: row.word,
                    indices: JSON.parse(row.indices),
                    wiktionary: row.wiktionary
                });
            }
        );
    });
}

export async function getAllWords(): Promise<WordData[]> {
    return new Promise((resolve, reject) => {
        db.all('SELECT word, indices, wiktionary FROM words', (err, rows) => {
            if (err) {
                console.error('Error getting all words:', err);
                reject(err);
                return;
            }

            resolve(rows.map(row => ({
                word: row.word,
                indices: JSON.parse(row.indices),
                wiktionary: row.wiktionary
            })));
        });
    });
}

// Function to check if the database is working correctly
export async function checkDatabase(): Promise<void> {
    try {
        // Check if we can execute a simple query
        const countPromise = new Promise<{ count: number }>((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM words', (err, row) => {
                if (err) reject(err);
                else resolve(row as { count: number });
            });
        });

        const count = await countPromise;
        console.log(`Database check: Found ${count.count} words in the database`);

        // Try to insert and retrieve a test word
        const testWord = 'test_word_' + Date.now();
        await storeWordData(testWord, [0], 'Test definition');
        const retrieved = await getWordData(testWord);

        if (retrieved && retrieved.word === testWord) {
            console.log('Database check: Successfully inserted and retrieved a test word');
        } else {
            console.error('Database check: Failed to retrieve the test word');
        }
    } catch (error) {
        console.error('Database check failed:', error);
    }
}

// Run the database check when the module is loaded
checkDatabase();

// Clean up when the application exits
process.on('exit', () => db.close());
