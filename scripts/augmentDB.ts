/**
 * Database Augmentation Script
 * ===========================
 *
 * This script scans through all words in the database and extracts additional
 * Russian words from their definitions. If a definition contains a pattern like
 * "of поколе́ние" (English word followed by a Russian word), it extracts the
 * Russian word and adds it to the database if it's not already there.
 *
 * Usage:
 * pnpm augment-db
 */

import { getAllWords, getWordData, storeWordData, closeDatabase } from '$lib/db';

// Regular expression to find Russian words in definitions
// This pattern looks for Cyrillic words, which may include stress marks and other diacritics
// We're using a more flexible pattern to catch more potential Russian words
const russianWordPattern = /([а-яёА-ЯЁ][а-яёА-ЯЁ\u0301\-]*[а-яёА-ЯЁ\u0301])/g;

// Alternative pattern that might catch more words
// const russianWordPattern = /[а-яёА-ЯЁ][а-яёА-ЯЁ\u0301\-]*/g;

async function augmentDatabase() {
    try {
        console.log('Starting database augmentation...');

        // Get all words from the database
        const allWords = await getAllWords();
        console.log(`Found ${allWords.length} words in the database`);

        // Keep track of new words added
        const newWords: Set<string> = new Set();

        // Process each word's definition
        let processedCount = 0;
        let wordsWithDefinitions = 0;
        let wordsWithMatches = 0;
        let totalMatches = 0;

        for (const wordData of allWords) {
            processedCount++;

            // Log progress every 50 words
            if (processedCount % 50 === 0) {
                console.log(`Processed ${processedCount}/${allWords.length} words...`);
            }

            if (!wordData.wiktionary) continue;
            wordsWithDefinitions++;

            // Find all Russian words in the definition
            const matches = Array.from(wordData.wiktionary.matchAll(russianWordPattern)) as RegExpMatchArray[];
            totalMatches += matches.length;

            if (matches.length > 0) {
                wordsWithMatches++;
                console.log(`Found ${matches.length} potential Russian words in definition for "${wordData.word}"`);

                // Debug: Show a sample of the definition if matches are found
                if (processedCount <= 5) {
                    const definitionSample = wordData.wiktionary.substring(0, 150) + '...';
                    console.log(`Definition sample: ${definitionSample}`);
                    console.log(`Matches found: ${matches.map(m => m[1]).join(', ')}`);
                }
            }

            for (const match of matches) {
                const russianWord = match[1].toLowerCase();

                // Skip very short words (likely not actual words)
                if (russianWord.length < 2) {
                    console.log(`Skipping short word: ${russianWord}`);
                    continue;
                }

                // Skip the word itself
                if (russianWord === wordData.word.toLowerCase()) {
                    console.log(`Skipping the word itself: ${russianWord}`);
                    continue;
                }

                // Check if the word already exists in the database
                const existingWord = await getWordData(russianWord);

                if (!existingWord) {
                    // Add the new word to the database with empty indices
                    await storeWordData(russianWord, [], null);
                    newWords.add(russianWord);
                    console.log(`Added new word: ${russianWord}`);
                } else {
                    console.log(`Word already exists in database: ${russianWord}`);
                }
            }
        }

        // Print summary statistics
        console.log('\nAugmentation Summary:');
        console.log(`Total words in database: ${allWords.length}`);
        console.log(`Words with definitions: ${wordsWithDefinitions}`);
        console.log(`Words with matches: ${wordsWithMatches}`);
        console.log(`Total matches found: ${totalMatches}`);
        console.log(`New words added: ${newWords.size}`);

        if (newWords.size > 0) {
            console.log('\nNew words added:');
            console.log(Array.from(newWords).join(', '));
        } else {
            console.log('\nNo new words were added to the database.');
        }

    } catch (error) {
        console.error('Error augmenting database:', error);
    } finally {
        // Make sure to close the database connection
        try {
            await closeDatabase();
            console.log('Database connection closed');
        } catch (error) {
            console.error('Error closing database:', error);
        }
    }
}

// Run the augmentation
augmentDatabase().catch(console.error);
