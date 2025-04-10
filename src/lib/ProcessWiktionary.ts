import { JSDOM } from 'jsdom';

/**
 * Processes a Wiktionary HTML content by transforming h3 elements and their associated content
 * into details/summary elements for better organization and interactivity.
 *
 * This function is designed to run on the server side and uses JSDOM.
 *
 * @param htmlContent - The raw HTML content from Wiktionary
 * @returns The processed HTML content with details/summary elements
 */
export function processWiktionary(htmlContent: string): string {
  // Log a sample of the HTML content
  console.log(`HTML content sample (first 200 chars): ${htmlContent.substring(0, 200)}`);

  // Create a DOM from the HTML content
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;

  // Find all h3 elements
  const h3Elements = document.querySelectorAll('h3');
  console.log(`Found ${h3Elements.length} h3 elements in the content`);

  // If no h3 elements are found, try to find elements with class 'mw-headline'
  if (h3Elements.length === 0) {
    const headlineElements = document.querySelectorAll('.mw-headline');
    console.log(`Found ${headlineElements.length} mw-headline elements instead`);

    // Check if these elements are inside h3 tags
    headlineElements.forEach(headline => {
      const parent = headline.parentElement;
      if (parent && parent.tagName === 'H3') {
        console.log(`Found h3 with mw-headline: ${headline.textContent}`);
      }
    });
  }

  // Process each h3 element
  if (h3Elements.length > 0) {
    h3Elements.forEach((h3) => {
      // Create a details element
      const details = document.createElement('details');
      details.setAttribute('class', 'wiktionary-section mb-4 border border-gray-200 rounded-md');

      // Create a summary element with the h3 content
      const summary = document.createElement('summary');
      summary.setAttribute('class', 'wiktionary-section-title p-2 bg-gray-50 hover:bg-gray-100 cursor-pointer font-medium');

      // Copy the content of the h3 to the summary
      summary.innerHTML = h3.innerHTML;

      // Add the summary to the details
      details.appendChild(summary);

      // Collect all following siblings until the next h3 or the end
      let currentNode = h3.nextSibling;
      const contentNodes = [];

      while (currentNode && currentNode.nodeName !== 'H3') {
        contentNodes.push(currentNode);
        currentNode = currentNode.nextSibling;
      }

      // Create a div to hold the content
      const contentDiv = document.createElement('div');
      contentDiv.setAttribute('class', 'wiktionary-section-content p-3');

      // Append all content nodes to the content div
      contentNodes.forEach((node) => {
        contentDiv.appendChild(node.cloneNode(true));
      });

      // Add the content div to the details
      details.appendChild(contentDiv);

      // Replace the h3 with the details element
      h3.parentNode?.replaceChild(details, h3);

      // Remove the original content nodes
      contentNodes.forEach((node) => {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      });
    });
  } else {
    // Alternative approach: find all sections by looking for mw-headline elements
    const headlineElements = document.querySelectorAll('.mw-headline');
    headlineElements.forEach(headline => {
      const parent = headline.parentElement;
      if (parent && parent.tagName === 'H3') {
        // Create a details element
        const details = document.createElement('details');
        details.setAttribute('class', 'wiktionary-section mb-4 border border-gray-200 rounded-md');

        // Create a summary element with the h3 content
        const summary = document.createElement('summary');
        summary.setAttribute('class', 'wiktionary-section-title p-2 bg-gray-50 hover:bg-gray-100 cursor-pointer font-medium');

        // Copy the content of the headline to the summary
        summary.textContent = headline.textContent || '';

        // Add the summary to the details
        details.appendChild(summary);

        // Collect all following siblings until the next h3 or the end
        let currentNode = parent.nextSibling;
        const contentNodes = [];

        while (currentNode &&
          !(currentNode.nodeType === 1 &&
            (currentNode as Element).tagName === 'H3')) {
          contentNodes.push(currentNode);
          currentNode = currentNode.nextSibling;
        }

        // Create a div to hold the content
        const contentDiv = document.createElement('div');
        contentDiv.setAttribute('class', 'wiktionary-section-content p-3');

        // Append all content nodes to the content div
        contentNodes.forEach((node) => {
          contentDiv.appendChild(node.cloneNode(true));
        });

        // Add the content div to the details
        details.appendChild(contentDiv);

        // Replace the h3 with the details element
        parent.parentNode?.replaceChild(details, parent);

        // Remove the original content nodes
        contentNodes.forEach((node) => {
          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
        });
      }
    });
  }

  // Open the first details element by default
  const firstDetails = document.querySelector('details');
  if (firstDetails) {
    firstDetails.setAttribute('open', '');
  }

  // Get the processed HTML
  const processedHtml = dom.serialize();

  // Log a sample of the processed HTML
  console.log(`Processed HTML sample (first 200 chars): ${processedHtml.substring(0, 200)}`);
  console.log(`Processed HTML contains details tags: ${processedHtml.includes('<details')}`);

  // Return the processed HTML
  return processedHtml;
}
