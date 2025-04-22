import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
    try {
        const url = `https://en.wiktionary.org/wiki/${encodeURIComponent(params.word)}`
        console.log("fetching " + url);
        const response = await fetch(url
        );

        if (!response.ok) {
            throw error(response.status, 'Failed to fetch from Wiktionary');
        }

        const html = await response.text();
        console.log("fetched " + params.word);

        return new Response(html, {
            headers: {
                'Content-Type': 'text/html',
            },
        });
    } catch (e) {
        console.error('Error fetching Wiktionary content:', e);
        throw error(500, 'Failed to fetch Wiktionary content');
    }
};
