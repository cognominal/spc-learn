// I could do all of that client size
// but that could make testing easier ?

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAndProcessPageHTML } from '$lib/server';

export const GET: RequestHandler = async ({ params, request }) => {
    try {
        // Get the URL from the X-URL header
        const url = request.headers.get('x-url');
        if (!url) {
            return new Response('Missing X-URL header', {
                status: 400,
                headers: {
                    'Content-Type': 'text/plain',
                },
            });
        }
        console.log("/api/getpage: fetching " + url);

        let { content, error: err } = await getAndProcessPageHTML(url);

        if (err) {
            return new Response(err, {
                status: 500,
                headers: {
                    'Content-Type': 'text/json',
                },
            });
        }
        return new Response(content, {
            headers: {
                'Content-Type': 'text/html',
            },
        });
    } catch (e) {
        console.error('Error fetching Wiktionary content:', e);
        throw error(500, 'Failed to fetch Wiktionary content');
    }
};
