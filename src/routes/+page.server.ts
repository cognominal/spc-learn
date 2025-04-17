import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getWordDataFromDbOrNull, storeWordDataIndB, fetchWiktionaryPageAndProcessIt, type WordData, type ProcessedWiktPage } from '$lib/server';
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
            console.log(`Word '${word}'`);


            if (!word) {
                throw error(400, 'Word is required');
            }

            // Check if the word exists in the database
            let wordData = await getWordDataFromDbOrNull(word);
            // console.log(`Word data: ${JSON.stringify(wordData)}`);


            // If the word doesn't exist in the database or has no Wiktionary content
            if (!wordData) {
                console.log(`Word '${word}' not found in database. Fetching from Wiktionary...`);

                // Fetch and process the definition from Wiktionary
                // The fetchWiktionaryContent function now includes the processing step
                const p: ProcessedWiktPage = await fetchWiktionaryPageAndProcessIt(word);
                console.log(p.status);


                // If wordData exists but has no Wiktionary content, preserve its indices
                wordData = {
                    word,
                    indices: [],
                    processedWiktionaryPage: p.processedWiktionaryPage!
                };
                const indices = wordData ? wordData.indices : [];
                await storeWordDataIndB(wordData);

                console.log(`Stored definition for '${word}' in database.`);
            }

            return wordData
        }
        catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error('Error in getDefinition action:', errorMessage);
            throw error(500, `Error fetching definition: ${errorMessage}`);
        }
    }
}
