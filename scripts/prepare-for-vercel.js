/**
 * Prepare for Vercel Deployment Script
 * ===================================
 *
 * This script prepares the project for deployment to Vercel by:
 * 1. Dumping the current database to a YAML file
 * 2. Copying the YAML dump to the static directory
 *
 * Usage:
 * node scripts/prepare-for-vercel.js
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Paths
const sourceDumpPath = path.join(projectRoot, 'words-dump.yaml');
const staticDumpPath = path.join(projectRoot, 'static', 'words-dump.yaml');

// First, run the database dump script
console.log('Dumping database to YAML...');
exec('pnpm run db:dump', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error dumping database: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Database dump stderr: ${stderr}`);
  }
  
  console.log(stdout);
  
  // Now copy the dump file to the static directory
  try {
    if (!fs.existsSync(sourceDumpPath)) {
      console.error(`Error: Source dump file not found at ${sourceDumpPath}`);
      process.exit(1);
    }
    
    // Copy the file
    fs.copyFileSync(sourceDumpPath, staticDumpPath);
    console.log(`Successfully copied database dump to ${staticDumpPath}`);
    
    console.log('Project is now ready for Vercel deployment!');
  } catch (err) {
    console.error('Error copying database dump:', err);
    process.exit(1);
  }
});
