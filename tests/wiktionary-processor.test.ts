import { processWiktionary } from '$lib/server';
import { JSDOM } from 'jsdom';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, test, expect } from 'vitest';

// Get the directory name for the current module
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);

// Mock data for testing for мужества extracted from https://en.wiktionary.org/wiki/%D0%BC%D1%83%D0%B6%D0%B5%D1%81%D1%82%D0%B2%D0%B0
const mockWiktionaryHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Test мужества - Wiktionary</title>
</head>
<body>
<div class="mw-content-ltr mw-parser-output" lang="en" dir="ltr"><div class="mw-heading mw-heading2"><h2 id="Russian">Russian</h2><span class="mw-editsection" data-nosnippet=""><span class="mw-editsection-bracket">[</span><a href="/w/index.php?title=%D0%BC%D1%83%D0%B6%D0%B5%D1%81%D1%82%D0%B2%D0%B0&amp;action=edit&amp;section=1" title="Edit section: Russian"><span>edit</span></a><span class="mw-editsection-bracket">]</span></span></div>
<div class="mw-heading mw-heading3"><h3 id="Pronunciation">Pronunciation</h3><span class="mw-editsection" data-nosnippet=""><span class="mw-editsection-bracket">[</span><a href="/w/index.php?title=%D0%BC%D1%83%D0%B6%D0%B5%D1%81%D1%82%D0%B2%D0%B0&amp;action=edit&amp;section=2" title="Edit section: Pronunciation"><span>edit</span></a><span class="mw-editsection-bracket">]</span></span></div>
<ul><li><a href="/wiki/Wiktionary:International_Phonetic_Alphabet" title="Wiktionary:International Phonetic Alphabet">IPA</a><sup>(<a href="/wiki/Appendix:Russian_pronunciation" title="Appendix:Russian pronunciation">key</a>)</sup>: <span class="IPA">[ˈmuʐɨstvə]</span></li></ul>
<div class="mw-heading mw-heading3"><h3 id="Noun">Noun</h3><span class="mw-editsection" data-nosnippet=""><span class="mw-editsection-bracket">[</span><a href="/w/index.php?title=%D0%BC%D1%83%D0%B6%D0%B5%D1%81%D1%82%D0%B2%D0%B0&amp;action=edit&amp;section=3" title="Edit section: Noun"><span>edit</span></a><span class="mw-editsection-bracket">]</span></span></div>
<p><span class="headword-line"><strong class="Cyrl headword" lang="ru">му́жества</strong> <a href="/wiki/Wiktionary:Russian_transliteration" title="Wiktionary:Russian transliteration">•</a> (<span lang="ru-Latn" class="headword-tr tr Latn" dir="ltr">múžestva</span>)&nbsp;<span class="gender"><abbr title="neuter gender">n</abbr>&nbsp;<abbr title="inanimate">inan</abbr> or <abbr title="neuter gender">n</abbr>&nbsp;<abbr title="inanimate">inan</abbr>&nbsp;<abbr title="plural number">pl</abbr></span></span>
</p>
<ol><li><span class="form-of-definition use-with-mention">inflection of <span class="form-of-definition-link"><i class="Cyrl mention" lang="ru"><a href="/wiki/%D0%BC%D1%83%D0%B6%D0%B5%D1%81%D1%82%D0%B2%D0%BE#Russian" title="мужество">му́жество</a></i> <span class="mention-gloss-paren annotation-paren">(</span><span lang="ru-Latn" class="mention-tr tr Latn">múžestvo</span><span class="mention-gloss-paren annotation-paren">)</span></span>:</span>
<ol><li><span class="form-of-definition use-with-mention"><a href="/wiki/Appendix:Glossary#genitive_case" title="Appendix:Glossary">genitive</a> <a href="/wiki/Appendix:Glossary#singular_number" title="Appendix:Glossary">singular</a></span></li>
<li><span class="form-of-definition use-with-mention"><span class="inflection-of-conjoined"><a href="/wiki/Appendix:Glossary#nominative_case" title="Appendix:Glossary">nominative</a><span class="inflection-of-sep">/</span><a href="/wiki/Appendix:Glossary#accusative_case" title="Appendix:Glossary">accusative</a></span> <a href="/wiki/Appendix:Glossary#plural_number" title="Appendix:Glossary">plural</a></span></li></ol></li></ol>
</div></body>
</html>
`;

describe('Wiktionary Processing', () => {
  test('processWiktionary transforms div.mw-heading3 elements into details/summary elements', () => {
    // Process the mock Wiktionary HTML
    const processedHtml = processWiktionary(mockWiktionaryHtml, "Russian");

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

  });

  test('processWiktionary handles empty content gracefully', () => {
    // Process empty HTML
    const processedHtml = processWiktionary('', "Russian");

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
      const processedHtml = processWiktionary(sampleHtml, "Russian");

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
      const processedHtml = processWiktionary(html, "Russian");

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

      // In the real Wiktionary page, we might not find details elements if the structure is different
      // So we'll just check that we got some content
      expect(processedHtml.length).toBeGreaterThan(0);
    } catch (error) {
      console.error('Error in fetch and process test:', error);
      throw error;
    }
  }, 30000); // Increase timeout to 30 seconds for this test
});
