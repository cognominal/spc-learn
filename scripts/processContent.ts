import fs from 'fs/promises';
import path from 'path';
import { processContent } from '$lib/processor';
import { closeDatabase, checkDatabase } from '$lib/db';

async function main() {
    // Check if --no-fetch flag is provided
    const shouldFetchDefinitions = !process.argv.includes('--no-fetch');

    try {
        // Run database check at the beginning
        await checkDatabase();
        console.log('Reading HTML content...');
        const htmlContent = await fs.readFile(
            path.join(process.cwd(), 'static', 'raw-file-from-grok.html'),
            'utf-8'
        );

        console.log(`Processing content${shouldFetchDefinitions ? ' and fetching Wiktionary definitions' : ' without fetching definitions'}...`);
        const { html, words } = await processContent(htmlContent, shouldFetchDefinitions);

        // Ensure we're only returning the body content
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const processedHtml = bodyMatch ? bodyMatch[1] : html;

        console.log(`Processed ${words.length} unique Russian words`);

        // Save the processed content
        await fs.writeFile(
            path.join(process.cwd(), 'static', 'grok-processed-file.html'),
            processedHtml,
            'utf-8'
        );

        console.log('Content processed and saved successfully');
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('Error processing content:', errorMessage);
        process.exit(1);
    } finally {
        // Make sure to close the database connection
        try {
            await closeDatabase();
        } catch (error) {
            console.error('Error closing database:', error);
        }
    }
}

main();
