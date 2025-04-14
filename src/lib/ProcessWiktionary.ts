import { JSDOM } from 'jsdom';
import { log } from 'node:console';

/**
 * Processes a Wiktionary HTML content by transforming h3 elements and their associated content
 * into details/summary elements for better organization and interactivity.
 *
 * This function is designed to run on the server side and uses JSDOM.
 *
 * @param htmlContent - The raw HTML content from Wiktionary
 * @param section - The section to keep (e.g., "Russian"). Only this section and its content will be kept.
 * @returns The processed HTML content with details/summary elements
 */
export function processWiktionary(htmlContent: string, section: string = "Russian"): string {
  // Log a sample of the HTML content
  console.log(`HTML content sample (first 200 chars): ${htmlContent.substring(0, 200)}`);

  // Create a DOM from the HTML content
  let dom = new JSDOM(htmlContent);
  let document = dom.window.document;

  // Find an element with an ID matching the section name
  const sectionElement = document.getElementById(section);
  console.log(`Found section element with ID ${section}: ${sectionElement ? 'yes' : 'no'}`);

  if (sectionElement) {
    // Create a new document with only the siblings of the section element's parent
    const newDom = new JSDOM('<!DOCTYPE html><html><head><title>Wiktionary</title></head><body></body></html>');
    const newDocument = newDom.window.document;
    const newBody = newDocument.querySelector('body');

    if (newBody) {
      // Get the parent of the section element
      const parentElement = sectionElement.parentElement;
      console.log(`Parent element: ${parentElement ? parentElement.tagName : 'null'}`);

      if (parentElement) {
        // Get all siblings of the parent element
        let currentNode = parentElement.nextSibling;

        while (currentNode) {
          // Stop when we reach an h2 element
          if (currentNode.nodeType === 1 && (currentNode as Element).tagName === 'H2') {
            break;
          }

          // Add the sibling to the new document
          newBody.appendChild(currentNode.cloneNode(true));
          console.log(`Added node: ${currentNode.nodeName}`);

          // Move to the next sibling
          currentNode = currentNode.nextSibling;
        }
      }

      // Replace the original DOM with the new one containing only the siblings of the parent
      dom = newDom;
      document = newDocument;
    }
  } else {
    // Fallback to the old method if no element with the specified ID is found
    console.log(`Falling back to searching for h2 with text content "${section}"`);
    const sectionHeader = Array.from(document.querySelectorAll('h2')).find(h2 => {
      return h2.textContent?.trim() === section;
    });

    if (sectionHeader) {
      console.log(`Found section header: ${sectionHeader.textContent}`);

      // Create a new document with only the specified section and its siblings
      const newDom = new JSDOM('<!DOCTYPE html><html><head><title>Wiktionary</title></head><body></body></html>');
      const newDocument = newDom.window.document;
      const newBody = newDocument.querySelector('body');

      if (newBody) {
        // Get all siblings that follow the section header until the next h2
        let currentNode = sectionHeader.nextSibling;

        while (currentNode) {
          // Stop when we reach the next h2
          if (currentNode.nodeType === 1 && (currentNode as Element).tagName === 'H2') {
            break;
          }

          // Add the sibling to the new document
          newBody.appendChild(currentNode.cloneNode(true));

          // Move to the next sibling
          currentNode = currentNode.nextSibling;
        }

        // Replace the original DOM with the new one containing only the siblings of the specified section
        dom = newDom;
        document = newDocument;
      }
    } else {
      console.log(`Section "${section}" not found in the HTML content`);
    }
  }

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
    console.log('ALTERNATIVE');

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
