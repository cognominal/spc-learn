/**
 * Database Module for Word Storage and Retrieval
 * =============================================
 *
 * This module provides a SQLite database interface for storing and retrieving
 * Russian words, their occurrences (indices), and their Wiktionary definitions.
 *
 * Key Features:
 * - Automatic database initialization and table creation
 * - Automatic restoration from YAML dump if database is empty
 * - Asynchronous API for database operations
 * - Word normalization (lowercase, trimmed)
 *
 * Database Schema:
 * - words table:
 *   - word: TEXT PRIMARY KEY - The Russian word (normalized)
 *   - indices: TEXT - JSON string of indices where the word appears in the text
 *   - wiktionary: TEXT - HTML content from Wiktionary for the word
 *
 * Persistence Strategy:
 * - The database file (words.db) is excluded from git
 * - A YAML dump (words-dump.yaml) is included in git
 * - On startup, if the database is empty, it's automatically restored from the YAML dump
 * - The db:dump script can be used to update the YAML dump when needed
 */

import sqlite3 from 'sqlite3';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { parse } from 'yaml';

export interface WordData {
    word: string;
    indices: number[];
    wiktionary: string | null;
}

import path from 'path';

// Open database with sqlite3 using an absolute path
const dbPath = path.resolve(process.cwd(), 'words.db');
const yamlDumpPath = path.resolve(process.cwd(), 'words-dump.yaml');
console.log(`Using database at: ${dbPath}`);
const db = new sqlite3.Database(dbPath);

// Note: We're using callbacks directly instead of promisified versions
// because we need to handle type casting properly

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
`, async (err) => {
    if (err) {
        console.error('Error creating table:', err);
    } else {
        console.log('Table created or already exists');

        // Check if the database is empty
        db.get('SELECT COUNT(*) as count FROM words', async (err, row: { count: number }) => {
            if (err) {
                console.error('Error checking if database is empty:', err);
                return;
            }

            const count = row.count;
            console.log(`Database contains ${count} words`);

            // If the database is empty and the YAML dump exists, restore from it
            if (count === 0 && existsSync(yamlDumpPath)) {
                console.log(`Database is empty. Restoring from ${yamlDumpPath}...`);
                try {
                    // Read the YAML file
                    const yamlData = await fs.readFile(yamlDumpPath, 'utf-8');
                    const words: WordData[] = parse(yamlData) as WordData[];

                    console.log(`Found ${words.length} words in the YAML dump`);

                    // Insert all words
                    const insertPromises = words.map(word => {
                        return new Promise<void>((resolve, reject) => {
                            db.run(
                                'INSERT INTO words (word, indices, wiktionary) VALUES (?, ?, ?)',
                                [word.word, JSON.stringify(word.indices), word.wiktionary],
                                (err) => {
                                    if (err) {
                                        console.error(`Error inserting word '${word.word}':`, err);
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                }
                            );
                        });
                    });

                    await Promise.all(insertPromises);
                    console.log(`Successfully restored ${words.length} words to the database`);
                } catch (error) {
                    console.error('Error restoring database from JSON dump:', error);
                }
            }
        });
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
    // console.log(`Looking up word in database: '${normalizedWord}'`);

    return new Promise((resolve, reject) => {
        db.get(
            'SELECT word, indices, wiktionary FROM words WHERE word = ?',
            [normalizedWord],
            (err, row: { word: string, indices: string, wiktionary: string | null } | undefined) => {
                if (err) {
                    console.error('Error getting word:', err);
                    reject(err);
                    return;
                }

                if (!row) {
                    // console.log(`Word '${normalizedWord}' not found in database`);
                    resolve(undefined);
                    return;
                }

                // console.log(`Found word '${normalizedWord}' in database`);
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
        db.all('SELECT word, indices, wiktionary FROM words', (err, rows: Array<{ word: string, indices: string, wiktionary: string | null }>) => {
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

// Run the database check when explicitly called, not on module load
// This allows proper control of when the check happens

// Clean up when the application exits
// Use a flag to prevent multiple close attempts
let dbClosed = false;

// Function to safely close the database
export function closeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (dbClosed) {
            resolve();
            return;
        }

        dbClosed = true;
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
                reject(err);
            } else {
                console.log('Database closed successfully');
                resolve();
            }
        });
    });
}

// Register cleanup handlers
process.on('exit', () => {
    if (!dbClosed) {
        console.log('Process exiting, closing database synchronously');
        // On exit we can only do synchronous operations
        try {
            db.close();
        } catch (e) {
            console.error('Error during synchronous database close:', e);
        }
    }
});

// Handle other termination signals
process.on('SIGINT', async () => {
    console.log('SIGINT received, closing database');
    await closeDatabase();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing database');
    await closeDatabase();
    process.exit(0);
});
