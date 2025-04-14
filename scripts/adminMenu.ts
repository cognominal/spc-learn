/**
 * Admin Menu Script
 * ================
 * 
 * This script provides a centralized menu for executing various admin scripts.
 * It uses the 'prompts' package to display an interactive menu in the terminal.
 * 
 * This helps declutter the package.json file by consolidating multiple admin scripts
 * into a single entry point.
 * 
 * Usage:
 * npm run admin
 */

import prompts from 'prompts';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the admin scripts
const adminScripts = [
  {
    title: 'Process Content',
    value: 'processContent.ts',
    description: 'Process HTML content containing Russian text'
  },
  {
    title: 'Process HTML',
    value: 'processHtml.ts',
    description: 'Process HTML files'
  },
  {
    title: 'Analyze Words',
    value: 'analyzeWords.ts',
    description: 'Analyze Russian words in the database'
  },
  {
    title: 'Analyze Common Words',
    value: 'analyze-common-words.ts',
    description: 'Analyze common Russian words'
  },
  {
    title: 'Dump Database',
    value: 'dumpDatabase.ts',
    description: 'Export the database to a YAML file'
  },
  {
    title: 'Restore Database',
    value: 'restoreDatabase.ts',
    description: 'Restore the database from a YAML file'
  },
  {
    title: 'Purge Wiktionary Content',
    value: 'purgeWiktionaryContent.ts',
    description: 'Purge Wiktionary content from the database'
  },
  {
    title: 'Augment Database',
    value: 'augmentDB.ts',
    description: 'Augment the database with additional data'
  },
  {
    title: 'Add Common Words',
    value: 'add-common-words.ts',
    description: 'Add common Russian words to the database'
  },
  {
    title: 'Prepare for Vercel',
    value: 'prepare-for-vercel.js',
    description: 'Prepare the project for deployment to Vercel'
  }
];

/**
 * Runs a script with the given arguments
 * 
 * @param scriptPath - The path to the script to run
 * @param args - The arguments to pass to the script
 * @returns A promise that resolves when the script completes
 */
function runScript(scriptPath: string, args: string[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    // Determine if we should use tsx or node based on the file extension
    const isTypeScript = scriptPath.endsWith('.ts');
    const command = isTypeScript ? 'tsx' : 'node';
    const commandArgs = isTypeScript ? ['--tsconfig', 'tsconfig.json', scriptPath, ...args] : [scriptPath, ...args];
    
    console.log(`Running: ${command} ${commandArgs.join(' ')}`);
    
    const child = spawn(command, commandArgs, {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Asks the user if they want to run another script
 * 
 * @returns A promise that resolves to true if the user wants to run another script
 */
async function askForAnother(): Promise<boolean> {
  const response = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Do you want to run another script?',
    initial: true
  });
  
  return response.value;
}

/**
 * Asks the user for script arguments
 * 
 * @returns A promise that resolves to an array of arguments
 */
async function askForArguments(): Promise<string[]> {
  const response = await prompts({
    type: 'text',
    name: 'value',
    message: 'Enter script arguments (space-separated, or press Enter for none):',
    initial: ''
  });
  
  return response.value ? response.value.split(' ') : [];
}

/**
 * Main function that displays the menu and runs the selected script
 */
async function main() {
  console.log('=== Admin Scripts Menu ===\n');
  
  let runAnother = true;
  
  while (runAnother) {
    const response = await prompts({
      type: 'select',
      name: 'value',
      message: 'Select a script to run:',
      choices: adminScripts,
      initial: 0
    });
    
    // Exit if the user cancelled (e.g., by pressing Ctrl+C)
    if (response.value === undefined) {
      console.log('\nExiting admin menu.');
      return;
    }
    
    const selectedScript = response.value;
    const scriptPath = path.join(__dirname, selectedScript);
    
    // Ask for arguments
    const args = await askForArguments();
    
    try {
      // Run the selected script
      await runScript(scriptPath, args);
      console.log(`\n✅ Script ${selectedScript} completed successfully.\n`);
    } catch (error) {
      console.error(`\n❌ Error running script ${selectedScript}:`, error);
    }
    
    // Ask if the user wants to run another script
    runAnother = await askForAnother();
  }
  
  console.log('\nExiting admin menu. Goodbye!');
}

// Run the main function
main().catch(console.error);
