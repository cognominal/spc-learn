import { JSDOM } from 'jsdom';

// Due to CORS restrictions for security purpose, we cannot access the content 
// of an iframe loaded  from a foreign domain.
// we can sucessfully load the page in the iframe but can't programmatically
//  access the content of the iframe.
// Also for the same reasons we can't fetch it from a svelte 5 component, so we must  

// so we manually get such pages, replace the referenced style link by the content 
// of the style sheet and remove all script tags.
// This should work for not too fancy pages.

import { isAbsoluteUrl } from '$lib/utils';

export async function getAndProcessPageHTML(urlString: string): Promise<{ content?: string; error?: string }> {
    const Dolog = true

    function log(msg: string) {
        if (Dolog) {
            console.log(msg);
        }
    }


    let url: URL;

    try {
        url = new URL(urlString);
    } catch (err) {
        return { error: `Invalid URL: ${urlString}` };
    }
    try {
        const response = await fetch(urlString);
        if (!response.ok) {
            const error = `Failed to fetch page at url ${urlString}: ${response.status} ${response.statusText}`;
            log(error);
            return { error };
        }
        let htmlText: string;
        try {
            htmlText = await response.text();
        } catch (err) {
            return { error: `Failed to read response text: ${err instanceof Error ? err.message : String(err)}` };
        }
        log(`Fetched page ${response.status} ${response.statusText}`);

        // Use JSDOM for server-side DOM manipulation
        const dom = new JSDOM(htmlText, { url: urlString });
        const doc = dom.window.document;
        let
            links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
        log(`Found ${links.length} stylesheets`);
        for (const link of links) {
            const href = link.getAttribute('href');
            if (href) {
                log(`fetching stylesheet ${href}`);
                // Resolve relative URLs if needed
                const styleUrl = new URL(href, urlString).toString();
                try {
                    const styleResp = await fetch(styleUrl);
                    if (!styleResp.ok) {
                        continue; // skip this stylesheet if fetch fails
                    }
                    const css = await styleResp.text();
                    // Create a <style> element and insert the CSS
                    const styleEl = doc.createElement('style');
                    styleEl.textContent = css;
                    link.replaceWith(styleEl);
                } catch (err) {
                    // skip this stylesheet if fetch fails
                    continue;
                }
            }
        }
        links = Array.from(doc.querySelectorAll('img'));
        for (const link of links) {
            const src = link.getAttribute('src');
            if (src && !isAbsoluteUrl(src)) {
                // Set src to absolute URL based on the base url
                link.setAttribute('src', new URL(src, url).toString());
            }
        }
        // Remove all external <script> tags
        const scripts = Array.from(doc.querySelectorAll('script[src]'));
        for (const script of scripts) {
            script.remove();
        }
        // Add a red h1 at the start of the body
        const h1 = doc.createElement('h1');
        h1.textContent = 'processed document';
        h1.style.color = 'red';
        doc.body.insertBefore(h1, doc.body.firstChild);

        log(`return content`);

        return { content: dom.serialize() };
    } catch (err) {
        log(`Error fetching or processing page: ${err instanceof Error ? err.message : String(err)}`);
        return { error: `Failed to fetch or process page at url ${urlString}: ${err instanceof Error ? err.message : String(err)}` };
    }
}