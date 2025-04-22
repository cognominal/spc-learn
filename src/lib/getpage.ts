// Due to CORS restrictions for security purpose, we cannot access the content of an iframe loaded 
// from a foreign domain.
// so we manually get such pages, replace the referenced style link by the content 
// of the style sheet and remove all script tags.
// This should work for not too fancy pages.

export async function getPageHTML(url: string): Promise<{ content?: string; error?: string }> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return { error: `Failed to fetch URL: ${response.status} ${response.statusText}` };
        }
        let htmlText: string;
        try {
            htmlText = await response.text();
        } catch (err) {
            return { error: `Failed to read response text: ${err instanceof Error ? err.message : String(err)}` };
        }
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
        for (const link of links) {
            const href = link.getAttribute('href');
            if (href) {
                // Resolve relative URLs if needed
                const styleUrl = new URL(href, url).toString();
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
        // Remove all external <script> tags
        const scripts = Array.from(doc.querySelectorAll('script[src]'));
        for (const script of scripts) {
            script.remove();
        }
        return { content: doc.documentElement.outerHTML };
    } catch (err) {
        return { error: `Failed to fetch or process page: ${err instanceof Error ? err.message : String(err)}` };
    }
}