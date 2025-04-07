/**
 * Add Common Words Script
 * ======================
 *
 * This script reads a list of common Russian words from a text file (1000words.txt)
 * and adds them to the database by fetching their definitions from Wiktionary.
 *
 * The script performs the following operations:
 * 1. Reads the list of common Russian words from the file
 * 2. For each word, checks if it already exists in the database
 * 3. If not, fetches its definition from Wiktionary
 * 4. Stores the word and its definition in the database
 * 5. Creates a YAML dump of the database when finished
 *
 * Usage:
 * pnpm add-common-words
 */

import fs from 'fs/promises';
import path from 'path';
import { getWordData, storeWordData, closeDatabase, checkDatabase } from '$lib/db';
import { fetchWiktionaryContent } from '$lib/processor';
import { dumpDbToYAML } from './dumpDatabase';

/**
 * Adds a delay between API requests to avoid overwhelming the Wiktionary API
 *
 * @param ms - The number of milliseconds to delay
 * @returns A promise that resolves after the specified delay
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function that orchestrates the process of adding common words to the database
 *
 * This function:
 * 1. Reads the list of common Russian words from the file
 * 2. For each word, checks if it already exists in the database
 * 3. If not, fetches its definition from Wiktionary
 * 4. Stores the word and its definition in the database
 * 5. Creates a YAML dump of the database when finished
 *
 * @returns A promise that resolves when all words have been processed
 */
async function main(): Promise<void> {
    try {
        // Verify database connection and structure
        await checkDatabase();

        // Step 1: Read the list of common Russian words from the file
        console.log('Reading common words from file...');
        const filePath = path.join(process.cwd(), '1000words.txt');
        const fileContent = await fs.readFile(filePath, 'utf-8');

        // Split the comma-separated content into individual words
        const words = fileContent.split(', ')
            .map(word => word.trim())
            .filter(word => word.length > 0);

        // Remove duplicates by converting to Set and back to array
        const uniqueWords = Array.from(new Set(words));

        console.log(`Found ${uniqueWords.length} unique words in the file`);

        // Step 2: Process each word
        let addedCount = 0;
        let existingCount = 0;
        let errorCount = 0;

        for (let i = 0; i < uniqueWords.length; i++) {
            const word = uniqueWords[i];

            // Log progress
            console.log(`Processing word ${i + 1}/${uniqueWords.length}: ${word}`);

            try {
                // Check if the word already exists in the database
                const existingWordData = await getWordData(word);

                if (existingWordData && existingWordData.wiktionary) {
                    // Word already exists with Wiktionary content
                    console.log(`Word '${word}' already in database, skipping fetch.`);
                    existingCount++;
                } else {
                    // Word doesn't exist or has no Wiktionary content, fetch it
                    console.log(`Fetching definition for word '${word}'...`);
                    const wiktionaryContent = await fetchWiktionaryContent(word);

                    // Store the word with empty indices (since it's not from a specific text)
                    await storeWordData(word, [], wiktionaryContent);

                    if (wiktionaryContent) {
                        console.log(`Added word '${word}' to database.`);
                        addedCount++;

                        // Add a delay to avoid overwhelming the Wiktionary API
                        await delay(1000);
                    } else {
                        console.log(`No Wiktionary content found for word '${word}'.`);
                        errorCount++;
                    }
                }
            } catch (error) {
                console.error(`Error processing word '${word}':`, error);
                errorCount++;
            }
        }

        // Step 3: Create a YAML dump of the database
        console.log('Creating database dump...');
        await dumpDbToYAML(false);

        // Step 4: Print summary
        console.log('\nSummary:');
        console.log(`Total unique words processed: ${uniqueWords.length}`);
        console.log(`Words already in database: ${existingCount}`);
        console.log(`Words added to database: ${addedCount}`);
        console.log(`Words with errors: ${errorCount}`);

        console.log('\nProcess completed successfully.');
    } catch (error) {
        console.error('Error adding common words:', error);
        process.exit(1);
    } finally {
        // Ensure the database connection is properly closed
        try {
            await closeDatabase();
        } catch (error) {
            console.error('Error closing database:', error);
        }
    }
}

// Execute the main function
main().catch(console.error);
