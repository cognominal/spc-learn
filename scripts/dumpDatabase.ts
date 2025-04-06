/**
 * Database Dump Script
 * ==================
 *
 * This script exports the contents of the SQLite database to a YAML file.
 * The YAML file serves as a backup and can be committed to version control,
 * allowing the database to be restored on a new installation or after deletion.
 *
 * YAML is used instead of JSON because it's more human-readable and easier to diff,
 * making it better for version control.
 *
 * Usage:
 * pnpm db:dump
 *
 * Output:
 * - words-dump.yaml: Contains all words, their indices, and Wiktionary content
 */

import sqlite3 from 'sqlite3';
import fs from 'fs/promises';
import path from 'path';
import { stringify } from 'yaml';

async function dumpDatabase() {
    const dbPath = path.resolve(process.cwd(), 'words.db');
    console.log(`Dumping database from: ${dbPath}`);

    const db = new sqlite3.Database(dbPath);

    try {
        // Get all words from the database
        const rows = await new Promise<any[]>((resolve, reject) => {
            db.all('SELECT word, indices, wiktionary FROM words', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        console.log(`Found ${rows.length} words in the database`);

        // Convert indices from JSON string to array for better readability
        const processedRows = rows.map(row => ({
            word: row.word,
            indices: JSON.parse(row.indices),
            wiktionary: row.wiktionary
        }));

        // Write to YAML file
        const outputPath = path.resolve(process.cwd(), 'words-dump.yaml');
        await fs.writeFile(
            outputPath,
            stringify(processedRows),
            'utf-8'
        );

        console.log(`Database dumped to: ${outputPath}`);
    } catch (error) {
        console.error('Error dumping database:', error);
    } finally {
        db.close();
    }
}

dumpDatabase().catch(console.error);
