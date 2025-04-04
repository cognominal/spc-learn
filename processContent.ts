import fs from 'fs/promises';
import path from 'path';
import { processContent } from '../src/lib/processor';
import { getWordData } from '../src/lib/db';

const CONCURRENT_WORKERS = 4; // Adjust based on your needs

async function processWords(words: string[]) {
    const workerPath = path.join(process.cwd(), 'src', 'lib', 'workers', 'wiktionaryWorker.ts');
    const chunks = Array.from({ length: Math.ceil(words.length / CONCURRENT_WORKERS) }, (_, i) =>
        words.slice(i * CONCURRENT_WORKERS, (i + 1) * CONCURRENT_WORKERS)
    );

    for (const chunk of chunks) {
        const workers = chunk.map(word => {
            const worker = new Worker(workerPath, { type: 'module' });
            worker.postMessage({ word });
            return new Promise((resolve, reject) => {
                worker.onmessage = (e) => {
                    worker.terminate();
                    if (e.data.type === 'error') {
                        reject(new Error(`Failed to process word ${word}: ${e.data.error}`));
                    } else {
                        resolve(e.data);
                    }
                };
                worker.onerror = reject;
            });
        });

        await Promise.all(workers);
        // Add delay to avoid overwhelming Wiktionary
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function main() {
    try {
        console.log('Reading HTML content...');
        const htmlContent = await fs.readFile(
            path.join(process.cwd(), 'static', 't.html'),
            'utf-8'
        );

        console.log('Processing content...');
        const { html, words } = await processContent(htmlContent, false); // Don't fetch definitions here

        // Filter words that aren't in the database
        const newWords = words.filter(word => !getWordData(word));
        
        if (newWords.length > 0) {
            console.log(`Processing ${newWords.length} new words...`);
            await processWords(newWords);
        }

        // Save the processed content
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const processedHtml = bodyMatch ? bodyMatch[1] : html;

        await fs.writeFile(
            path.join(process.cwd(), 'static', 'processed.html'),
            processedHtml,
            'utf-8'
        );

        console.log('Content processed and saved successfully');
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('Error processing content:', errorMessage);
        process.exit(1);
    }
}

main();
