import sqlite3 from 'sqlite3';
import path from 'path';

interface WordData {
    word: string;
    indices: number[];
    occurrences: number;
    wiktionary: string | null;
}

async function analyzeWords() {
    // Use an absolute path to the database file
    const dbPath = path.resolve(process.cwd(), 'words.db');
    console.log(`Analyzing words from database at: ${dbPath}`);

    const db = new sqlite3.Database(dbPath);

    try {
        // Get all words and their data from the database
        const rows = await new Promise<any[]>((resolve, reject) => {
            db.all('SELECT word, indices, wiktionary FROM words', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Convert indices from JSON string to array and count occurrences
        const wordData: WordData[] = rows.map(row => {
            const indices = JSON.parse(row.indices);
            return {
                word: row.word,
                indices: indices,
                occurrences: indices.length,
                wiktionary: row.wiktionary
            };
        });

        // Sort words by number of occurrences (most frequent first)
        wordData.sort((a, b) => b.occurrences - a.occurrences);

        // Print some statistics
        console.log(`Total unique words in database: ${wordData.length}`);

        const totalOccurrences = wordData.reduce((sum, word) => sum + word.occurrences, 0);
        console.log(`Total word occurrences: ${totalOccurrences}`);

        const wordsWithDefinitions = wordData.filter(word => word.wiktionary !== null).length;
        console.log(`Words with Wiktionary definitions: ${wordsWithDefinitions} (${Math.round(wordsWithDefinitions / wordData.length * 100)}%)`);

        // Print the top 20 most frequent words
        console.log('\nTop 20 most frequent words:');
        console.log('---------------------------');
        wordData.slice(0, 20).forEach((word, index) => {
            console.log(`${index + 1}. ${word.word} - ${word.occurrences} occurrences`);
        });

        // Print some words with only one occurrence
        console.log('\nSample of words with only one occurrence:');
        console.log('---------------------------------------');
        const singleOccurrenceWords = wordData.filter(word => word.occurrences === 1);
        console.log(`Total words with only one occurrence: ${singleOccurrenceWords.length}`);

        // Show a random sample of 10 single-occurrence words
        const sampleSize = Math.min(10, singleOccurrenceWords.length);
        const randomSample = singleOccurrenceWords
            .sort(() => 0.5 - Math.random())
            .slice(0, sampleSize);

        randomSample.forEach(word => {
            console.log(`- ${word.word}`);
        });

        // Word length distribution
        console.log('\nWord length distribution:');
        console.log('-------------------------');
        const lengthDistribution: Record<number, number> = {};

        wordData.forEach(word => {
            const length = word.word.length;
            lengthDistribution[length] = (lengthDistribution[length] || 0) + 1;
        });

        Object.entries(lengthDistribution)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .forEach(([length, count]) => {
                console.log(`${length} characters: ${count} words`);
            });

    } finally {
        db.close();
        console.log('\nDatabase connection closed');
    }
}

analyzeWords().catch(error => {
    console.error('Error analyzing words:', error);
    process.exit(1);
});
