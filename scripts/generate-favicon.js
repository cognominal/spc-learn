/**
 * Generate Favicon Script
 * ======================
 *
 * This script converts the favicon.png file in the static directory
 * to a favicon.ico file with multiple sizes.
 *
 * Usage:
 * node scripts/generate-favicon.js
 */

import fs from 'fs';
import path from 'path';
import pngToIco from 'png-to-ico';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateFavicon() {
  try {
    console.log('Converting favicon.png to favicon.ico...');

    // Navigate up from the scripts directory to the project root
    const projectRoot = path.resolve(__dirname, '..');
    const pngPath = path.join(projectRoot, 'static', 'favicon.png');
    const icoPath = path.join(projectRoot, 'static', 'favicon.ico');

    // Check if the PNG file exists
    if (!fs.existsSync(pngPath)) {
      console.error('Error: favicon.png not found in the static directory');
      process.exit(1);
    }

    // Convert PNG to ICO with multiple sizes
    const buffer = await pngToIco([pngPath]);

    // Write the ICO file
    fs.writeFileSync(icoPath, buffer);

    console.log('Successfully created favicon.ico in the static directory');
  } catch (error) {
    console.error('Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon();
