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
 * - Database is stored in a SQLite file in the data directory
 * - Database is dumped to a YAML file for version control and backup
 * - Database can be restored from the YAML dump if needed
 */

import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';

// Database file path
const DB_PATH = path.join(process.cwd(), 'data', 'words.db');
const YAML_PATH = path.join(process.cwd(), 'data', 'words.yaml');

// Database connection
let db: Database<sqlite3.Database> | null = null;

/**
 * Initializes the database connection and creates tables if they don't exist
 *
 * @returns A promise that resolves when the database is initialized
 */
async function initializeDatabase() {
    if (db) return db;

    try {
        // Ensure the data directory exists
        await fs.mkdir(path.dirname(DB_PATH), { recursive: true });

        // Open the database connection
        db = await open({
            filename: DB_PATH,
            driver: sqlite3.Database
        });

        // Create the words table if it doesn't exist
        await db.exec(`
            CREATE TABLE IF NOT EXISTS words (
                word TEXT PRIMARY KEY,
                indices TEXT,
                wiktionary TEXT
            )
        `);

        // Check if the database is empty
        const count = await db.get('SELECT COUNT(*) as count FROM words');

        if (count.count === 0) {
            // Try to restore from YAML if the database is empty
            try {
                await restoreFromYAML();
            } catch (error) {
                console.log('No YAML backup found or error restoring from YAML. Starting with empty database.');
            }
        }

        return db;
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

/**
 * Normalizes a word by converting to lowercase and trimming whitespace
 *
 * @param word - The word to normalize
 * @returns The normalized word
 */
function normalizeWord(word: string): string {
    return word.toLowerCase().trim();
}

/**
 * Stores word data in the database
 *
 * @param word - The word to store
 * @param wiktionary - The Wiktionary HTML content for the word
 * @param indices - Optional array of indices where the word appears
 * @returns A promise that resolves when the word is stored
 */


export type WordData = {
    word: string;
    indices: number[];
    processedWiktionaryPage: string;
}

export async function storeWordDataIndB(wd: WordData): Promise<void> {
    try {
        // Ensure database is initialized
        db = await initializeDatabase();

        // Normalize the word
        const normalizedWord = normalizeWord(wd.word);

        // Check if the word already exists
        const existingWord = await db.get('SELECT * FROM words WHERE word = ?', normalizedWord);

        if (existingWord) {
            // Merge indices if the word exists
            const existingIndices = JSON.parse(existingWord.indices || '[]');
            const mergedIndices = [...new Set([...existingIndices, ...wd.indices])];

            // Update the existing word
            await db.run(
                'UPDATE words SET indices = ?, wiktionary = ? WHERE word = ?',
                JSON.stringify(mergedIndices),
                wd.processedWiktionaryPage || existingWord.wiktionary,
                normalizedWord
            );
        } else {
            // Insert a new word
            await db.run(
                'INSERT INTO words (word, indices, wiktionary) VALUES (?, ?, ?)',
                normalizedWord,
                JSON.stringify(wd.indices),
                wd.processedWiktionaryPage
            );
        }
    } catch (error) {
        console.error(`Error storing word data for "${wd.word}":`, error);
        throw error;
    }
}

export async function getWordDataFromDbOrNull(word: string): Promise<WordData | null> {
    try {
        // Ensure database is initialized
        db = await initializeDatabase();

        // Normalize the word
        const normalizedWord = normalizeWord(word);

        // Get the word data
        const wordData = await db.get('SELECT * FROM words WHERE word = ?', normalizedWord);

        if (!wordData) {
            return null;
        }

        // Parse the indices
        const indices = JSON.parse(wordData.indices || '[]');

        return {
            word: wordData.word,
            indices,
            processedWiktionaryPage: wordData.wiktionary
        };
    } catch (error) {
        console.error(`Error getting word data for "${word}":`, error);
        return null;
    }
}

export async function dumpDatabaseToYAML(): Promise<void> {
    try {
        // Ensure database is initialized
        db = await initializeDatabase();

        // Get all words from the database
        const words = await db.all('SELECT * FROM words');

        // Convert to a more YAML-friendly format
        const data = words.map((word: WordData) => ({
            word: word.word,
            indices: word.indices || '[]',
            wiktionary: word.processedWiktionaryPage
        }));

        // Convert to YAML
        const yamlData = yaml.stringify(data);

        // Write to file
        await fs.writeFile(YAML_PATH, yamlData, 'utf8');

        console.log(`Database dumped to ${YAML_PATH}`);
    } catch (error) {
        console.error('Error dumping database to YAML:', error);
        throw error;
    }
}

export async function restoreFromYAML(): Promise<void> {
    try {
        // Check if the YAML file exists
        try {
            await fs.access(YAML_PATH);
        } catch (error) {
            console.log(`YAML file not found at ${YAML_PATH}`);
            return;
        }

        // Ensure database is initialized
        db = await initializeDatabase();

        // Read the YAML file
        const yamlData = await fs.readFile(YAML_PATH, 'utf8');

        // Parse the YAML
        const data = yaml.parse(yamlData) as Array<{
            word: string;
            indices: number[];
            wiktionary: string;
        }>;

        // Begin a transaction
        await db.exec('BEGIN TRANSACTION');

        // Clear the existing data
        await db.exec('DELETE FROM words');

        // Insert the data
        for (const item of data) {
            await db.run(
                'INSERT INTO words (word, indices, wiktionary) VALUES (?, ?, ?)',
                item.word,
                JSON.stringify(item.indices),
                item.wiktionary
            );
        }

        // Commit the transaction
        await db.exec('COMMIT');

        console.log(`Database restored from ${YAML_PATH}`);
    } catch (error) {
        // Rollback the transaction if there was an error
        if (db) {
            await db.exec('ROLLBACK');
        }

        console.error('Error restoring database from YAML:', error);
        throw error;
    }
}

export async function closeDatabase(): Promise<void> {
    db = await initializeDatabase();
    if (db) {
        await db.close();
        db = null;
    }
}

/**
 * Checks if the database is initialized
 *
 * @returns True if the database is initialized, false otherwise
 */
export function checkDatabase(): boolean {
    return db !== null;
}

// Initialize the database when the module is imported
initializeDatabase().catch(error => {
    console.error('Error initializing database:', error);
});
