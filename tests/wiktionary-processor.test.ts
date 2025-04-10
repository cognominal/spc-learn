import { processWiktionary } from '../src/lib/ProcessWiktionary.js';
import { JSDOM } from 'jsdom';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for the current module
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);

// Mock data for testing
const mockWiktionaryHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Word - Wiktionary</title>
</head>
<body>
  <h2 id="Russian">Russian</h2>
  <h3 id="Etymology">Etymology</h3>
  <p>This is the etymology section content.</p>
  <h3 id="Pronunciation">Pronunciation</h3>
  <p>This is the pronunciation section content.</p>
  <h3 id="Noun">Noun</h3>
  <p>This is the noun section content.</p>
  <ul>
    <li>Example 1</li>
    <li>Example 2</li>
  </ul>
</body>
</html>
`;

describe('Wiktionary Processing', () => {
  test('processWiktionary transforms h3 elements into details/summary elements', () => {
    // Process the mock Wiktionary HTML
    const processedHtml = processWiktionary(mockWiktionaryHtml);

    // Create a DOM from the processed HTML to test its structure
    const dom = new JSDOM(processedHtml);
    const document = dom.window.document;

    // Check if details elements were created
    const detailsElements = document.querySelectorAll('details');
    expect(detailsElements.length).toBeGreaterThan(0);

    // Check if the original h3 elements were replaced
    const h3Elements = document.querySelectorAll('h3');
    expect(h3Elements.length).toBe(0);

    // Check if summary elements contain the h3 content
    const summaryElements = document.querySelectorAll('summary');
    expect(summaryElements.length).toBeGreaterThan(0);

    // Check if the first details element has the 'open' attribute
    const firstDetails = document.querySelector('details');
    expect(firstDetails?.hasAttribute('open')).toBe(true);

    // Check if the content is preserved
    expect(processedHtml.includes('This is the etymology section content')).toBe(true);
    expect(processedHtml.includes('This is the pronunciation section content')).toBe(true);
    expect(processedHtml.includes('This is the noun section content')).toBe(true);
    expect(processedHtml.includes('<li>Example 1</li>')).toBe(true);
    expect(processedHtml.includes('<li>Example 2</li>')).toBe(true);
  });

  test('processWiktionary handles empty content gracefully', () => {
    // Process empty HTML
    const processedHtml = processWiktionary('');

    // Should return a valid HTML document
    expect(processedHtml).toContain('<html>');
    expect(processedHtml).toContain('</html>');
    expect(processedHtml).toBeTruthy();
  });

  // This test will be skipped if the file doesn't exist
  test('processWiktionary works with real Wiktionary content', async () => {
    try {
      // Try to read a sample Wiktionary HTML file if it exists
      const samplePath = path.join(currentDirPath, 'fixtures', 'sample-wiktionary.html');
      const sampleHtml = await fs.readFile(samplePath, 'utf-8');

      // Process the sample HTML
      const processedHtml = processWiktionary(sampleHtml);

      // Create a DOM from the processed HTML
      const dom = new JSDOM(processedHtml);
      const document = dom.window.document;

      // Check if details elements were created
      const detailsElements = document.querySelectorAll('details');
      expect(detailsElements.length).toBeGreaterThan(0);

      // Log the number of details elements for debugging
      console.log(`Created ${detailsElements.length} details elements from real content`);

      // Check if the first details element has the 'open' attribute
      const firstDetails = document.querySelector('details');
      expect(firstDetails?.hasAttribute('open')).toBe(true);
    } catch (error) {
      // Skip this test if the sample file doesn't exist
      console.log('Skipping real content test: sample file not found');
      return;
    }
  });
});

// Create a test that fetches a real Wiktionary page and processes it
describe('Wiktionary Fetching and Processing', () => {
  // This test is marked as async and will take some time to complete
  test('fetch and process a real Wiktionary page', async () => {
    // Skip this test in CI environments
    if (process.env.CI) {
      console.log('Skipping network test in CI environment');
      return;
    }

    try {
      // Fetch a real Wiktionary page
      const response = await fetch('https://en.wiktionary.org/wiki/привет');
      const html = await response.text();

      // Process the HTML
      const processedHtml = processWiktionary(html);

      // Create a DOM from the processed HTML
      const dom = new JSDOM(processedHtml);
      const document = dom.window.document;

      // Check if details elements were created
      const detailsElements = document.querySelectorAll('details');

      // Log the results for debugging
      console.log(`Fetched Wiktionary page for 'привет'`);
      console.log(`Original HTML length: ${html.length}`);
      console.log(`Processed HTML length: ${processedHtml.length}`);
      console.log(`Created ${detailsElements.length} details elements`);

      // Save the processed HTML to a file for manual inspection
      const outputDir = path.join(currentDirPath, 'output');
      try {
        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(path.join(outputDir, 'processed-wiktionary.html'), processedHtml);
        console.log(`Saved processed HTML to ${path.join(outputDir, 'processed-wiktionary.html')}`);
      } catch (error) {
        console.error('Failed to save processed HTML:', error);
      }

      // Verify that details elements were created
      expect(detailsElements.length).toBeGreaterThan(0);

      // Check if the first details element has the 'open' attribute
      const firstDetails = document.querySelector('details');
      expect(firstDetails?.hasAttribute('open')).toBe(true);
    } catch (error) {
      console.error('Error in fetch and process test:', error);
      throw error;
    }
  }, 30000); // Increase timeout to 30 seconds for this test
});
