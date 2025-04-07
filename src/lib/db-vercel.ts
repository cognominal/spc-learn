/**
 * Database Module for Word Storage and Retrieval (Vercel-compatible version)
 * =============================================
 *
 * This module provides a read-only SQLite database interface for Vercel deployment.
 * It uses better-sqlite3 in read-only mode and loads the database from the static directory.
 */

import Database from 'better-sqlite3';
import { parse } from 'yaml';
import fs from 'fs';
import path from 'path';

interface WordData {
    word: string;
    indices: number[];
    wiktionary: string | null;
}

// In-memory database for Vercel
let db: Database.Database | null = null;

// Initialize the database from the YAML dump
function initializeDatabase() {
    if (db) return; // Already initialized

    try {
        // Create an in-memory database
        db = new Database(':memory:');
        
        console.log('Creating in-memory database for Vercel deployment');
        
        // Create the table
        db.exec(`
            CREATE TABLE IF NOT EXISTS words (
                word TEXT PRIMARY KEY,
                indices TEXT,
                wiktionary TEXT
            )
        `);
        
        // Load data from the YAML dump in the static directory
        const yamlDumpPath = path.join(process.cwd(), 'static', 'words-dump.yaml');
        console.log(`Loading database from YAML dump: ${yamlDumpPath}`);
        
        if (fs.existsSync(yamlDumpPath)) {
            const yamlData = fs.readFileSync(yamlDumpPath, 'utf-8');
            const words: WordData[] = parse(yamlData) as WordData[];
            
            console.log(`Found ${words.length} words in the YAML dump`);
            
            // Begin a transaction for faster inserts
            const insertStmt = db.prepare('INSERT INTO words (word, indices, wiktionary) VALUES (?, ?, ?)');
            const insertMany = db.transaction((words: WordData[]) => {
                for (const word of words) {
                    insertStmt.run(word.word, JSON.stringify(word.indices), word.wiktionary);
                }
            });
            
            // Insert all words
            insertMany(words);
            console.log(`Successfully loaded ${words.length} words into the in-memory database`);
        } else {
            console.error('YAML dump file not found in static directory');
        }
    } catch (error) {
        console.error('Error initializing in-memory database:', error);
        throw error;
    }
}

// Initialize the database on module load
initializeDatabase();

export async function storeWordData(word: string, indices: number[], wiktionary: string | null): Promise<void> {
    // In Vercel's read-only environment, we can't store new data
    // This is a no-op function that logs a warning
    console.warn(`Attempted to store word '${word}' in read-only database environment`);
    return Promise.resolve();
}

export async function getWordData(word: string): Promise<WordData | undefined> {
    if (!db) initializeDatabase();
    
    // Normalize the word to ensure consistent lookup
    const normalizedWord = word.toLowerCase().trim();
    
    try {
        const stmt = db!.prepare('SELECT word, indices, wiktionary FROM words WHERE word = ?');
        const row = stmt.get(normalizedWord) as { word: string, indices: string, wiktionary: string | null } | undefined;
        
        if (!row) return undefined;
        
        return {
            word: row.word,
            indices: JSON.parse(row.indices),
            wiktionary: row.wiktionary
        };
    } catch (error) {
        console.error(`Error getting word '${normalizedWord}':`, error);
        return undefined;
    }
}

export async function getAllWords(): Promise<WordData[]> {
    if (!db) initializeDatabase();
    
    try {
        const stmt = db!.prepare('SELECT word, indices, wiktionary FROM words');
        const rows = stmt.all() as Array<{ word: string, indices: string, wiktionary: string | null }>;
        
        return rows.map(row => ({
            word: row.word,
            indices: JSON.parse(row.indices),
            wiktionary: row.wiktionary
        }));
    } catch (error) {
        console.error('Error getting all words:', error);
        return [];
    }
}

export async function checkDatabase(): Promise<void> {
    if (!db) initializeDatabase();
    
    try {
        const stmt = db!.prepare('SELECT COUNT(*) as count FROM words');
        const result = stmt.get() as { count: number };
        console.log(`Database check: Found ${result.count} words in the in-memory database`);
    } catch (error) {
        console.error('Database check failed:', error);
    }
}

export function closeDatabase(): Promise<void> {
    if (db) {
        try {
            db.close();
            db = null;
            console.log('In-memory database closed');
        } catch (error) {
            console.error('Error closing in-memory database:', error);
        }
    }
    return Promise.resolve();
}
