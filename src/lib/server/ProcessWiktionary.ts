import { JSDOM } from 'jsdom';

/**
 * Processes a Wiktionary HTML content by transforming elements with class mw-heading3 and their associated content
 * into details/summary elements for better organization and interactivity.
 *
 * This function is designed to run on the server side and uses JSDOM.
 *
 * @param htmlContent - The raw HTML content from Wiktionary
 * @param section - The section to keep (e.g., "Russian"). Only this section and its content will be kept.
 * @returns The processed HTML content with details/summary elements
 */
export function processWiktionary(htmlContent: string, section: string = 'Russian'): string {
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
          // console.log(`Added node: ${currentNode.nodeName}`);

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
    console.log(`Falling back to searching for h2 with text content '${section}'`);
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
      console.log(`Section '${section}' not found in the HTML content`);
    }
  }

  // create details/summary sections
  // Find all elements with class mw-heading3
  const headingElements = document.querySelectorAll('.mw-heading3');
  console.log(`Found ${headingElements.length} elements with class mw-heading3`);

  headingElements.forEach((headingElement) => {
    // Create a details element
    const details = document.createElement('details');
    details.setAttribute('class', 'wiktionary-section mb-4 border border-gray-200 rounded-md');

    // Check if the second child of the heading element is an ol
    let nextSibling = headingElement.nextSibling;
    let foundOl = false;

    // Skip text nodes and find the first element sibling
    while (nextSibling && nextSibling.nodeType !== 1) {
      nextSibling = nextSibling.nextSibling;
    }

    // If we found an element, check if it's an ol
    if (nextSibling && nextSibling.nodeType === 1) {
      // Now find the next element sibling (which would be the second element child)
      let secondElement = nextSibling.nextSibling;

      // Skip text nodes again
      while (secondElement && secondElement.nodeType !== 1) {
        secondElement = secondElement.nextSibling;
      }

      // Check if the second element is an ol
      if (secondElement && secondElement.nodeType === 1 && (secondElement as Element).tagName === 'OL') {
        foundOl = true;
      }
    }

    // Set the details element to open if the second child is an ol
    if (foundOl) {
      details.setAttribute('open', '');
      console.log('Found ol as second child, setting details to open');
    }

    // Create a summary element
    const summary = document.createElement('summary');
    summary.setAttribute('class', 'wiktionary-section-title p-2 bg-gray-50 hover:bg-gray-100 cursor-pointer font-medium');

    // Remove all elements with class 'mw-editsection' from the heading
    const editSections = headingElement.querySelectorAll('.mw-editsection');
    editSections.forEach((el) => el.remove());

    // Replace h3 with span in the heading
    const h3 = headingElement.querySelector('h3');
    if (h3) {
      const span = document.createElement('span');
      // Copy text content
      span.textContent = h3.textContent;
      // Copy classes and id
      if (h3.getAttribute('id')) {
        span.setAttribute('id', h3.getAttribute('id')!);
      }
      if (h3.getAttribute('class')) {
        span.setAttribute('class', h3.getAttribute('class')!);
      }
      h3.parentNode?.replaceChild(span, h3);
    }

    // Get the original content of the heading element (now without mw-editsection and h3)
    const originalContent = headingElement.innerHTML;

    // Put the heading content directly inside the summary
    summary.innerHTML = originalContent;


    // Add the summary to the details
    details.appendChild(summary);

    // Collect all following siblings until the next element with class mw-heading3
    let currentNode = headingElement.nextSibling;
    const contentNodes = [];

    while (currentNode) {
      // Stop when we reach another element with class mw-heading3
      if (currentNode.nodeType === 1 &&
        (currentNode as Element).classList &&
        (currentNode as Element).classList.contains('mw-heading3')) {
        break;
      }

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

    // Replace the heading element with the details element
    headingElement.parentNode?.replaceChild(details, headingElement);

    // Remove the original content nodes
    contentNodes.forEach((node) => {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    });
  });

  // Get the processed HTML
  const processedHtml = dom.serialize();

  // Log a sample of the processed HTML
  console.log(`Processed HTML sample (first 200 chars): ${processedHtml.substring(0, 200)}`);
  console.log(`Processed HTML contains details tags: ${processedHtml.includes('<details')}`);

  // Return the processed HTML
  return processedHtml;
}
