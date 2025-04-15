import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getWordData, storeWordData, fetchWiktionaryContent } from '$lib/server';
import fs from 'fs/promises';
import path from 'path';

export const load: PageServerLoad = async () => {
    console.log('Loading page...');
    try {
        const processedHtml = await fs.readFile(
            path.join(process.cwd(), 'static', 'grok-processed-file.html'),
            'utf-8'
        );

        return {
            processedHtml,
            words: [] // You might want to store and load the words list separately
        };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('Error in load function:', errorMessage);
        throw error(500, `Error loading processed content: ${errorMessage}`);
    }
};

export const actions: Actions = {
    getDefinition: async ({ request }) => {
        try {
            const data = await request.formData();
            const word = data.get('word')?.toString();

            if (!word) {
                throw error(400, 'Word is required');
            }

            // Check if the word exists in the database
            let wordData = getWordData(word);

            // If the word doesn't exist in the database or has no Wiktionary content
            if (!wordData || !wordData.wiktionary) {
                console.log(`Word '${word}' not found in database. Fetching from Wiktionary...`);

                // Fetch and process the definition from Wiktionary
                // The fetchWiktionaryContent function now includes the processing step
                const processedContent = await fetchWiktionaryContent(word);

                // Log to verify processing is happening
                console.log(`Processed content length: ${processedContent?.length || 0}`);
                console.log(`Processed content contains details tags: ${processedContent?.includes('<details') || false}`);

                // Store the processed word data in the database
                // If wordData exists but has no Wiktionary content, preserve its indices
                const indices = wordData ? wordData.indices : [];
                await storeWordData(word, processedContent, indices);

                // Update wordData with the new processed Wiktionary content
                wordData = {
                    word,
                    indices,
                    wiktionary: processedContent
                };

                console.log(`Stored definition for '${word}' in database.`);
            }

            return {
                data: wordData.wiktionary || 'Definition not found'
            };
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error('Error in getDefinition action:', errorMessage);
            throw error(500, `Error fetching definition: ${errorMessage}`);
        }
    }
}