/**
 * Content Processing Module
 * =======================
 *
 * This module provides functionality for processing HTML content containing Russian text.
 * It identifies Russian words, wraps them in interactive spans, and fetches their definitions
 * from Wiktionary when needed.
 *
 * Key Features:
 * - Identifies Russian words in HTML content using Cyrillic character detection
 * - Wraps Russian words in <span> elements with appropriate classes and data attributes
 * - Fetches and stores Wiktionary definitions for Russian words
 * - Processes English translations and wraps them in appropriate elements
 * - Maintains a database of words and their definitions for efficient retrieval
 *
 * Main Functions:
 * - findRussianWords: Extracts Russian words from text using regex
 * - fetchWiktionaryContent: Retrieves definitions from Wiktionary for a given word
 * - processContent: Main function that processes HTML content, identifies words,
 *   and optionally fetches definitions
 *
 * The module uses JSDOM for HTML parsing and manipulation, allowing it to work in
 * both browser and Node.js environments.
 */

import { JSDOM } from 'jsdom';
import { storeWordData, getWordData } from './db';

/**
 * Finds all Russian words in a given text string
 *
 * @param text - The text to search for Russian words
 * @returns A promise that resolves to an array of Russian words found in the text
 */
export async function findRussianWords(text: string): Promise<string[]> {
    // Regular expression to match Cyrillic characters (Russian alphabet)
    const russianPattern = /[а-яёА-ЯЁ]+/g;
    const matches = text.match(russianPattern) || [];
    return matches;
}

/**
 * Removes all elements matching a CSS selector from a document
 *
 * @param doc - The Document object to operate on
 * @param selector - CSS selector for elements to remove
 */
function rmBySel(doc: Document, selector: string): void {
    doc.querySelectorAll(selector).forEach(el => el.remove());
}

/**
 * Fetches and extracts the Russian section of a word's definition from Wiktionary
 *
 * @param word - The Russian word to look up
 * @returns A promise that resolves to the HTML content of the Russian section, or null if not found
 */
export async function fetchWiktionaryContent(word: string): Promise<string | null> {
    try {
        // Fetch the Wiktionary page for the word
        const response = await fetch(
            `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`
        );
        if (!response.ok) return null;

        const html = await response.text();
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        // Clean up the HTML by removing edit sections and SVG elements
        rmBySel(doc, '.mw-editsection');
        rmBySel(doc, 'svg');

        // Find the Russian section of the page
        const russianSection = doc.querySelector("#Russian");
        if (!russianSection) return null;

        // Extract all content from the Russian section until the next language section
        let content = "";
        let currentElement: HTMLElement | null = russianSection.parentElement;
        while ((currentElement = currentElement?.nextElementSibling as HTMLElement | null)) {
            // Stop when we reach the next language section (H2 heading)
            if (currentElement.tagName === "H2") break;
            content += currentElement.outerHTML;
        }

        return content;
    } catch (error) {
        console.error(`Error fetching Wiktionary content for ${word}:`, error);
        return null;
    }
}

/**
 * Creates a promise that resolves after a specified delay
 * Used to prevent overwhelming external APIs with too many requests
 *
 * @param ms - The delay in milliseconds
 * @returns A promise that resolves after the specified delay
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wraps English translations in special span elements for styling and interaction
 *
 * This function finds all list items containing "English:" labels and wraps both
 * the label and the translation text in a span with a data attribute for targeting
 * with CSS and JavaScript.
 *
 * @param doc - The Document object to operate on
 */
function wrapEnglishSentences(doc: Document): void {
    console.log("wrap en");
    // Find all <li> elements
    const listItems = doc.querySelectorAll('li');

    // Loop through each <li> to find the matching <strong>
    listItems.forEach(li => {
        const strong = li.querySelector('strong');
        if (strong && strong.textContent!.trim() === 'English:') {
            const nextSibling = strong.nextElementSibling;
            if (nextSibling) {
                // Create a new span element with a data attribute for targeting
                const span = doc.createElement('span');
                span.setAttribute('data-lang', 'en-sent');

                // Move both the <strong> and its next sibling into the span
                // We clone the nodes to avoid DOM manipulation issues
                span.appendChild(strong.cloneNode(true));
                span.appendChild(nextSibling.cloneNode(true));

                // Replace the original <strong> with the new span
                strong.parentNode!.insertBefore(span, strong);

                // Remove the original <strong> and next sibling
                strong.remove();
                nextSibling.remove();
            }
        }
    });
}

/**
 * Main function for processing HTML content with Russian text
 *
 * This function:
 * 1. Parses the HTML using JSDOM
 * 2. Identifies Russian words in the text
 * 3. Wraps Russian words in interactive spans
 * 4. Optionally fetches and stores Wiktionary definitions
 * 5. Returns the processed HTML and a list of unique words
 *
 * @param html - The HTML content to process
 * @param fetchDefinitions - Whether to fetch definitions from Wiktionary (default: false)
 * @returns An object containing the processed HTML and an array of unique words
 */
export async function processContent(html: string, fetchDefinitions: boolean = false) {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const uniqueWords = new Set<string>();
    const wordIndices: Map<string, number[]> = new Map();
    wrapEnglishSentences(doc);

    /**
     * Recursively processes nodes in the DOM to find and wrap Russian words
     *
     * This function:
     * 1. Identifies text nodes containing Russian words
     * 2. Wraps each Russian word in a span with appropriate classes and data attributes
     * 3. Collects information about each word's occurrences
     * 4. Recursively processes child nodes
     *
     * @param node - The DOM node to process
     */
    function processNode(node: Node) {
        if (node.nodeType === 3) { // Text node
            const text = node.textContent || '';
            const russianPattern = /[а-яёА-ЯЁ]+/g;
            let match;

            while ((match = russianPattern.exec(text)) !== null) {
                const word = match[0].toLowerCase();
                uniqueWords.add(word);

                // Store the index for this occurrence
                if (!wordIndices.has(word)) {
                    wordIndices.set(word, []);
                }
                wordIndices.get(word)?.push(match.index);
            }

            // Create spans for visual highlighting
            const words = text.match(russianPattern) || [];
            if (words.length > 0) {
                const fragment = doc.createDocumentFragment();
                let lastIndex = 0;

                words.forEach(word => {
                    const index = text.indexOf(word, lastIndex);

                    if (index > lastIndex) {
                        fragment.appendChild(
                            doc.createTextNode(text.slice(lastIndex, index))
                        );
                    }

                    const wrapper = doc.createElement('span');
                    wrapper.className = 'russian-word';
                    wrapper.setAttribute('data-word', word);
                    wrapper.textContent = word;
                    fragment.appendChild(wrapper);

                    lastIndex = index + word.length;
                });

                if (lastIndex < text.length) {
                    fragment.appendChild(
                        doc.createTextNode(text.slice(lastIndex))
                    );
                }

                node.parentNode?.replaceChild(fragment, node);
            }
        } else {
            Array.from(node.childNodes).forEach(processNode);
        }
    }

    processNode(doc.body);

    /**
     * Optional step: Fetch and store Wiktionary definitions for all found words
     *
     * This section:
     * 1. Checks if each word already exists in the database
     * 2. If not, fetches its definition from Wiktionary
     * 3. Stores the word, its indices, and definition in the database
     * 4. Adds delays between requests to avoid overwhelming the Wiktionary API
     */
    if (fetchDefinitions) {
        // Store all found words in the database with their Wiktionary content
        for (const word of uniqueWords) {
            const indices = wordIndices.get(word) || [];

            // Check if the word already exists in the database
            // Add special logging for the problematic word
            if (word === 'сегодняшней') {
                console.log(`Found the problematic word: '${word}'`);
                console.log(`Word type: ${typeof word}`);
                console.log(`Word length: ${word.length}`);
                console.log(`Word character codes: ${Array.from(word).map(c => c.charCodeAt(0))}`);
            }

            const existingWordData = await getWordData(word);

            if (existingWordData && existingWordData.wiktionary) {
                // Word already exists with Wiktionary content, just update indices if needed
                console.log(`Word '${word}' already in database, skipping fetch.`);

                // Update indices if they've changed
                if (JSON.stringify(existingWordData.indices) !== JSON.stringify(indices)) {
                    await storeWordData(word, indices, existingWordData.wiktionary);
                    console.log(`Updated indices for word '${word}'.`);
                }
            } else {
                // Word doesn't exist or has no Wiktionary content, fetch it
                console.log(`Fetching definition for word '${word}'...`);
                const wiktionaryContent = await fetchWiktionaryContent(word);
                await storeWordData(word, indices, wiktionaryContent);

                // Optional: Add some logging to track progress
                console.log(`Processed word: ${word}`);

                // Add a small delay to avoid overwhelming the Wiktionary API
                // Only delay for words that needed to be fetched
                await delay(1000);
            }
        }
    }

    return {
        html: doc.body.innerHTML,
        words: Array.from(uniqueWords)
    };
}
