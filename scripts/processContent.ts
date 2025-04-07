/**
 * Content Processing Script
 * =======================
 *
 * This script processes raw HTML content containing Russian text, identifies Russian words,
 * wraps them in interactive spans, and optionally fetches their definitions from Wiktionary.
 *
 * The script performs the following operations:
 * 1. Reads raw HTML content from 'static/raw-file-from-grok.html'
 * 2. Processes the content to identify and wrap Russian words in interactive spans
 * 3. Optionally fetches definitions for each Russian word from Wiktionary
 * 4. Stores the words and their definitions in a SQLite database
 * 5. Saves the processed HTML to 'static/grok-processed-file.html'
 * 6. Creates a YAML dump of the database for backup and version control
 *
 * Command-line options:
 * --no-fetch: Skip fetching definitions from Wiktionary (much faster)
 * --no-db: Skip all database operations (fastest, only processes HTML)
 *
 * Usage examples:
 * pnpm process-content                  # Process content and fetch definitions
 * pnpm process-content -- --no-fetch    # Process content without fetching definitions
 * pnpm process-content -- --no-db       # Process content without any database operations
 *
 * The script uses the following modules:
 * - processor.ts: Contains the main logic for processing HTML content
 * - db.ts: Handles database operations for storing and retrieving word data
 */

import fs from 'fs/promises';
import path from 'path';
import { processContent } from '$lib/processor';
import { closeDatabase, checkDatabase } from '$lib/db';
import { dumpDbToYAML } from './dumpDatabase';

/**
 * Main function that orchestrates the content processing workflow
 *
 * This function:
 * 1. Checks command-line arguments for processing options
 * 2. Verifies the database connection is working (unless --no-db is specified)
 * 3. Reads the raw HTML content from the file system
 * 4. Processes the content to identify and wrap Russian words
 * 5. Extracts just the body content from the processed HTML
 * 6. Saves the processed content to a new file
 * 7. Creates a YAML dump of the database for backup and version control (unless --no-db is specified)
 * 8. Ensures the database connection is properly closed (unless --no-db is specified)
 *
 * @returns {Promise<void>} A promise that resolves when processing is complete
 */
async function main() {
    // Check command-line flags
    const shouldFetchDefinitions = !process.argv.includes('--no-fetch');
    const skipDatabase = process.argv.includes('--no-db');

    // If --no-db is provided, we'll skip all database operations
    // This includes fetching definitions, since that requires the database
    const effectiveFetchDefinitions = skipDatabase ? false : shouldFetchDefinitions;

    try {
        // Only check database if we're not skipping database operations
        if (!skipDatabase) {
            // Verify database connection and structure
            await checkDatabase();
        }

        // Step 1: Read the raw HTML content from the source file
        console.log('Reading HTML content...');
        const htmlContent = await fs.readFile(
            path.join(process.cwd(), 'static', 'raw-file-from-grok.html'),
            'utf-8'
        );

        // Step 2: Process the content to identify and wrap Russian words
        // If effectiveFetchDefinitions is true, also fetch definitions from Wiktionary
        if (skipDatabase) {
            console.log('Processing content without database operations...');
        } else {
            console.log(`Processing content${effectiveFetchDefinitions ? ' and fetching Wiktionary definitions' : ' without fetching definitions'}...`);
        }

        const { html, words } = await processContent(htmlContent, effectiveFetchDefinitions, skipDatabase);

        // Step 3: Extract just the body content from the processed HTML
        // This removes the <html>, <head>, and <body> tags, keeping only the content
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const processedHtml = bodyMatch ? bodyMatch[1] : html;

        // Log the number of unique Russian words found in the content
        console.log(`Processed ${words.length} unique Russian words`);

        // Step 4: Save the processed content to the output file
        // This file will contain the HTML with Russian words wrapped in interactive spans
        await fs.writeFile(
            path.join(process.cwd(), 'static', 'grok-processed-file.html'),
            processedHtml,
            'utf-8'
        );

        console.log('Content processed and saved successfully');
    } catch (e) {
        // Handle any errors that occur during processing
        // Convert the error to a string message for consistent error reporting
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('Error processing content:', errorMessage);

        // Exit with a non-zero status code to indicate failure
        process.exit(1);
    } finally {
        // Skip database operations if --no-db flag is provided
        if (!skipDatabase) {
            // Create a YAML dump of the database before closing the connection
            // This ensures the dump is always up-to-date after processing content
            try {
                console.log('Creating database dump...');
                // Pass false to prevent dumpDbToYAML from closing the connection
                // We'll close it ourselves in the next step
                await dumpDbToYAML(false);
                console.log('Database dump created successfully');
            } catch (error) {
                console.error('Error creating database dump:', error);
            }

            // Ensure the database connection is properly closed, even if an error occurred
            // This prevents resource leaks and database corruption
            try {
                await closeDatabase();
            } catch (error) {
                console.error('Error closing database:', error);
            }
        }
    }
}

// Execute the main function
// Any unhandled promise rejections will be logged to the console
main();
