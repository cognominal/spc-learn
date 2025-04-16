/**
 * HTML Processing Script
 * ====================
 *
 * This script processes raw HTML content containing Russian text, identifies Russian words,
 * wraps them in interactive spans, and wraps English words in separate spans.
 *
 * Unlike processContent.ts, this script does NOT interact with the database at all.
 * It's designed for quick HTML processing without any database operations.
 *
 * The script performs the following operations:
 * 1. Reads raw HTML content from 'static/raw-file-from-grok.html'
 * 2. Processes the content to identify and wrap Russian words in interactive spans
 * 3. Processes the content to identify and wrap English words in interactive spans
 * 4. Saves the processed HTML to 'static/grok-processed-file.html'
 *
 * Usage:
 * pnpm process-html
 */

import fs from 'fs/promises';
import path from 'path';
import { JSDOM } from 'jsdom';

// Set to store common Russian words
let commonWords: Set<string> = new Set();

/**
 * Loads common Russian words from the 1000words.txt file
 *
 * @returns A promise that resolves when the words are loaded
 */
async function loadCommonWords(): Promise<void> {
    try {
        const filePath = path.join(process.cwd(), '1000words.txt');
        const fileContent = await fs.readFile(filePath, 'utf-8');

        // Split the comma-separated content into individual words
        const words = fileContent.split(', ')
            .map(word => word.trim().toLowerCase())
            .filter(word => word.length > 0);

        // Add words to the set
        words.forEach(word => commonWords.add(word));

        console.log(`Loaded ${commonWords.size} common Russian words`);
    } catch (error) {
        console.error('Error loading common words:', error);
        // Initialize with an empty set if there's an error
        commonWords = new Set();
    }
}

/**
 * Main function that orchestrates the HTML processing workflow
 *
 * This function:
 * 1. Loads common Russian words from 1000words.txt
 * 2. Reads the raw HTML content from the file system
 * 3. Processes the content to identify and wrap Russian words
 * 4. Processes the content to identify and wrap English words
 * 5. Reads the CSS file from generative-assets/main-txt.css
 * 6. Extracts just the body content from the processed HTML
 * 7. Creates a complete HTML document with proper structure
 * 8. Saves the processed content to a new file
 *
 * @returns A promise that resolves when processing is complete
 */
async function main(): Promise<void> {
    try {
        // Step 1: Load common Russian words
        console.log('Loading common Russian words...');
        await loadCommonWords();

        // Step 2: Read the raw HTML content from the source file
        console.log('Reading HTML content...');
        const htmlContent = await fs.readFile(
            path.join(process.cwd(), 'static', 'raw-file-from-grok.html'),
            'utf-8'
        );

        console.log('Processing content without database operations...');

        // Create a DOM from the HTML content
        const dom = new JSDOM(htmlContent);
        const doc = dom.window.document;

        // Step 2: Process English words
        console.log('Wrapping English words...');
        wrapEnglishWords(doc);

        // Step 3: Process Russian words
        console.log('Wrapping Russian words...');
        wrapRussianWords(doc);

        // Step 4: Read the CSS file
        console.log('Reading CSS file...');
        let cssContent = '';
        try {
            cssContent = await fs.readFile(
                path.join(process.cwd(), 'generative-assets', 'main-txt.css'),
                'utf-8'
            );
            console.log('CSS file read successfully');
        } catch (error) {
            console.warn('Could not read CSS file:', error);
            cssContent = '/* CSS file could not be loaded */';
        }

        // Step 5: Extract just the body content from the processed HTML
        const serialized = dom.serialize();
        const bodyRegex = /<body[^>]*>([\s\S]*)<\/body>/i;
        const bodyMatch = serialized.match(bodyRegex);
        const bodyContent = bodyMatch ? bodyMatch[1] : serialized;


        // Step 6: Create a complete HTML document with proper structure
        const processedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Words</title>
    <style>
${cssContent}
    </style>
</head>
<body>
${bodyContent}
</body>
</html>`;

        // Step 7: Save the processed content to the output file
        await fs.writeFile(
            path.join(process.cwd(), 'static', 'grok-processed-file.html'),
            processedHtml,
            'utf-8'
        );

        console.log('Content processed and saved successfully');
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('Error processing content:', errorMessage);
        process.exit(1);
    }
}

/**
 * Wraps individual English words in special span elements for styling and interaction
 *
 * This function finds all text following "English:" labels and wraps each individual
 * English word in a span with a data attribute for targeting with CSS and JavaScript.
 *
 * @param doc - The Document object to operate on
 */
function wrapEnglishWords(doc: Document): void {
    // Find all <strong> elements with 'English:' text
    const englishLabels = Array.from(doc.querySelectorAll('strong')).filter(
        strong => strong.textContent?.trim() === 'English:'
    );

    console.log(`Found ${englishLabels.length} English labels to process`);

    // Process each English label
    englishLabels.forEach(strong => {
        // Get the text node that follows the <strong> element
        let currentNode = strong.nextSibling;
        let englishText = '';

        // Collect all text until the next element or end of parent
        while (currentNode && currentNode.nodeType === 3) { // Text node
            englishText += currentNode.textContent;
            const nextNode = currentNode.nextSibling;
            currentNode.remove(); // Remove the text node as we process it
            currentNode = nextNode;
        }

        // Create a document fragment to hold the processed content
        const fragment = doc.createDocumentFragment();

        // Add the original strong element
        fragment.appendChild(strong.cloneNode(true));

        // Split the English text into words and wrap each word
        const words = englishText.trim().split(/\s+/);
        let wordCount = 0;

        // Process each word
        words.forEach((word, index) => {
            // Skip empty words
            if (!word) return;

            // Create a span for the word
            const wordSpan = doc.createElement('span');
            wordSpan.setAttribute('data-lang', 'en-word');
            wordSpan.textContent = word;

            // Add the word span to the fragment
            fragment.appendChild(wordSpan);
            wordCount++;

            // Add a space after each word (except the last one)
            if (index < words.length - 1) {
                fragment.appendChild(doc.createTextNode(' '));
            }
        });

        // Replace the original <strong> with the fragment
        strong.parentNode!.insertBefore(fragment, strong);
        strong.remove();

        // console.log(`Wrapped ${wordCount} English words`);
    });
}

/**
 * Recursively identifies and wraps Russian words in DOM nodes
 *
 * This function:
 * 1. Identifies text nodes containing Russian words
 * 2. Wraps each Russian word in a span with appropriate classes and data attributes
 * 3. Recursively processes child nodes
 *
 * @param node - The DOM node to process
 * @param doc - The Document object containing the node
 */
function wrapRussianWords(node: Node): void {
    const doc = node.ownerDocument!;

    if (node.nodeType === 3) { // Text node
        const text = node.textContent || '';
        const russianPattern = /[а-яёА-ЯЁ]+/g;
        let match: RegExpExecArray | null;

        // Check if the text contains any Russian words
        if (russianPattern.test(text)) {
            // Reset the regex to start from the beginning
            russianPattern.lastIndex = 0;

            const fragment = doc.createDocumentFragment();
            let lastIndex = 0;

            // Process each Russian word
            while ((match = russianPattern.exec(text)) !== null) {
                const word = match[0];
                const index = match.index;
                const lowerCaseWord = word.toLowerCase();

                // Add text before the Russian word
                if (index > lastIndex) {
                    fragment.appendChild(
                        doc.createTextNode(text.substring(lastIndex, index))
                    );
                }

                // Create a span for the Russian word
                const span = doc.createElement('span');
                span.setAttribute('data-lang', 'ru');
                span.setAttribute('data-word', lowerCaseWord);
                span.textContent = word;

                // Check if this is a common word and add the attribute if it is
                if (commonWords.has(lowerCaseWord)) {
                    span.setAttribute('data-common', 'true');
                }

                // Add the span to the fragment
                fragment.appendChild(span);

                lastIndex = index + word.length;
            }

            // Add any remaining text
            if (lastIndex < text.length) {
                fragment.appendChild(
                    doc.createTextNode(text.slice(lastIndex))
                );
            }

            // Replace the original text node with the fragment
            node.parentNode?.replaceChild(fragment, node);
        }
    } else {
        // Recursively process child nodes
        Array.from(node.childNodes).forEach(childNode => {
            wrapRussianWords(childNode);
        });
    }
}

// Execute the main function
main().catch(console.error);
