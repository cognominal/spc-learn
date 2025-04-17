import { fetchWiktionaryPageAndProcessIt, getWordDataFromDbOrNull, storeWordDataIndB, type WordData } from '$lib/server';

self.onmessage = async (e: MessageEvent) => {
    const { word, indices } = e.data;

    try {
        // Check if word exists in database
        const existingData = await getWordDataFromDbOrNull(word);
        if (existingData?.processedWiktionaryPage) {
            self.postMessage({
                type: 'success',
                word,
                content: existingData.processedWiktionaryPage
            });
            return;
        }

        // Fetch and process new word
        const wiktionaryContent = await fetchWiktionaryPageAndProcessIt(word);
        if (wiktionaryContent) {
            const wd: WordData = {
                word,
                indices: indices || [],
                processedWiktionaryPage: wiktionaryContent.processedWiktionaryPage || ''
            }
            // Store in database
            await storeWordDataIndB(wd);

            self.postMessage({
                type: 'success',
                word,
                content: wiktionaryContent
            });
        } else {
            self.postMessage({
                type: 'error',
                word,
                error: 'No content found'
            });
        }
    } catch (error) {
        self.postMessage({
            type: 'error',
            word,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};