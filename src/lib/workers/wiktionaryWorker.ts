import { fetchWiktionaryContent, getWordData, storeWordData } from '$lib/server';

self.onmessage = async (e: MessageEvent) => {
    const { word, indices } = e.data;

    try {
        // Check if word exists in database
        const existingData = getWordData(word);
        if (existingData?.wiktionary) {
            self.postMessage({
                type: 'success',
                word,
                content: existingData.wiktionary
            });
            return;
        }

        // Fetch and process new word
        const wiktionaryContent = await fetchWiktionaryContent(word);
        if (wiktionaryContent) {
            // Store in database
            storeWordData(word, wiktionaryContent, indices || []);

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