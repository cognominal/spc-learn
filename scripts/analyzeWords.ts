import sqlite3 from 'sqlite3';
import { promisify } from 'util';

interface WordData {
    word: string;
    indices: number[];
}

async function analyzeWords() {
    const db = new sqlite3.Database('words.db');
    const allAsync = promisify(db.all.bind(db));

    try {
        // Get all words and their indices from the database
        const rows = await new Promise<any[]>((resolve, reject) => {
            db.all('SELECT word, indices FROM words', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Convert indices from JSON string to array and count them
        const wordCounts: WordData[] = rows.map(row => ({
            word: row.word,
            indices: JSON.parse(row.indices)
        }));

        // Your analysis logic here...

    } finally {
        db.close();
    }
}

analyzeWords().catch(console.error);
