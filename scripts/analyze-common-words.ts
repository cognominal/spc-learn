/**
 * Analyze Common Words Script
 * =========================
 * 
 * This script analyzes the 1000words.txt file to count words and identify duplicates.
 * 
 * Usage:
 * pnpm analyze-common-words
 */

import fs from 'fs/promises';
import path from 'path';

async function main(): Promise<void> {
    try {
        // Read the file
        const filePath = path.join(process.cwd(), '1000words.txt');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        
        // Split the comma-separated content into individual words
        const words = fileContent.split(', ')
            .map(word => word.trim().toLowerCase())
            .filter(word => word.length > 0);
        
        // Count total words
        console.log(`Total words in file: ${words.length}`);
        
        // Count unique words
        const uniqueWords = new Set(words);
        console.log(`Unique words: ${uniqueWords.size}`);
        console.log(`Duplicate words: ${words.length - uniqueWords.size}`);
        
        // Find the most frequent words
        const wordCounts: Record<string, number> = {};
        words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
        
        // Sort words by frequency
        const sortedWords = Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .filter(([_, count]) => count > 1);
        
        // Print the top 20 most frequent words
        console.log('\nTop 20 most frequent words:');
        sortedWords.slice(0, 20).forEach(([word, count]) => {
            console.log(`${word}: ${count} occurrences`);
        });
        
        // Print statistics on duplicates
        const duplicateCounts: Record<number, number> = {};
        sortedWords.forEach(([_, count]) => {
            duplicateCounts[count] = (duplicateCounts[count] || 0) + 1;
        });
        
        console.log('\nDuplicate statistics:');
        Object.entries(duplicateCounts)
            .sort((a, b) => Number(b[0]) - Number(a[0]))
            .forEach(([count, words]) => {
                console.log(`${words} words appear ${count} times`);
            });
        
    } catch (error) {
        console.error('Error analyzing common words:', error);
    }
}

main().catch(console.error);
