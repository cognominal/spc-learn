/**
 * Database Restore Script
 * ====================
 *
 * This script imports data from a YAML file into the SQLite database.
 * It's used to restore the database from the YAML dump that's committed to version control.
 *
 * The script will:
 * 1. Create the database and table if they don't exist
 * 2. Clear any existing data in the table
 * 3. Import all words from the YAML file
 *
 * Usage:
 * pnpm db:restore
 *
 * Input:
 * - words-dump.yaml: The YAML file containing the database dump
 */

import sqlite3 from 'sqlite3';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'yaml';

interface WordData {
    word: string;
    indices: number[];
    wiktionary: string | null;
}

async function restoreDatabase() {
    const yamlPath = path.resolve(process.cwd(), 'words-dump.yaml');
    const dbPath = path.resolve(process.cwd(), 'words.db');

    console.log(`Restoring database from: ${yamlPath}`);
    console.log(`To database at: ${dbPath}`);

    try {
        // Read the YAML file
        const yamlData = await fs.readFile(yamlPath, 'utf-8');
        const words: WordData[] = parse(yamlData) as WordData[];

        console.log(`Found ${words.length} words in the YAML file`);

        // Open the database
        const db = new sqlite3.Database(dbPath);

        // Enable foreign keys and WAL mode
        db.run('PRAGMA foreign_keys = ON');
        db.run('PRAGMA journal_mode = WAL');

        // Create table if it doesn't exist
        await new Promise<void>((resolve, reject) => {
            db.exec(`
                CREATE TABLE IF NOT EXISTS words (
                    word TEXT PRIMARY KEY,
                    indices TEXT,
                    wiktionary TEXT
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Clear existing data if any
        await new Promise<void>((resolve, reject) => {
            db.run('DELETE FROM words', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

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

        // Close the database
        db.close();
    } catch (error) {
        console.error('Error restoring database:', error);
    }
}

restoreDatabase().catch(console.error);
