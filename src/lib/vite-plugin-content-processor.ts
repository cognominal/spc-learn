import type { Plugin } from 'vite';
import { processContent, getWordDataFromDbOrNull } from '$lib/server';
import path from 'path';
import fs from 'fs/promises';

const CONCURRENT_WORKERS = 4;

async function processWords(words: string[]) {
    const chunks = Array.from(
        { length: Math.ceil(words.length / CONCURRENT_WORKERS) },
        (_, i) => words.slice(i * CONCURRENT_WORKERS, (i + 1) * CONCURRENT_WORKERS)
    );

    for (const chunk of chunks) {
        const workers = chunk.map(word => {
            const worker = new Worker(
                new URL('./workers/wiktionaryWorker.ts', import.meta.url),
                { type: 'module' }
            );

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
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    }
}

export function contentProcessor(): Plugin {
    let processed = false;

    return {
        name: 'content-processor',
        async buildStart() {
            if (processed) return;

            try {
                console.log('📚 Starting content processing...');
                const htmlContent = await fs.readFile(
                    path.join(process.cwd(), 'static', 'raw-file-from-grok.html'),
                    'utf-8'
                );

                const { html, words } = await processContent(htmlContent, false);
                const newWords = words.filter(word => !getWordDataFromDbOrNull(word));

                if (newWords.length > 0) {
                    console.log(`🔍 Processing ${newWords.length} new words...`);
                    await processWords(newWords);
                }

                const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
                const processedHtml = bodyMatch ? bodyMatch[1] : html;

                await fs.writeFile(
                    path.join(process.cwd(), 'static', 'grok-processed-file.html'),
                    processedHtml,
                    'utf-8'
                );

                console.log('✅ Content processed successfully');
                processed = true;
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : String(e);
                console.error('❌ Error processing content:', errorMessage);
                throw e;
            }
        }
    };
}