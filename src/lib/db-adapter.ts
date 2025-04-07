/**
 * Database Adapter Module
 * ======================
 *
 * This module dynamically selects the appropriate database implementation
 * based on the environment (development or Vercel production).
 */

import { dev } from '$app/environment';

// Import types from the regular database module
import type { WordData } from './db';

// Dynamically import the appropriate database module
let dbModule: {
  storeWordData: (word: string, indices: number[], wiktionary: string | null) => Promise<void>;
  getWordData: (word: string) => Promise<WordData | undefined>;
  getAllWords: () => Promise<WordData[]>;
  checkDatabase: () => Promise<void>;
  closeDatabase: () => Promise<void>;
};

// In development, use the regular database
if (dev) {
  console.log('Using development database (SQLite file-based)');
  dbModule = await import('./db');
} else {
  // In production (Vercel), use the in-memory database
  console.log('Using production database (in-memory for Vercel)');
  dbModule = await import('./db-vercel');
}

// Export the functions from the selected module
export const {
  storeWordData,
  getWordData,
  getAllWords,
  checkDatabase,
  closeDatabase
} = dbModule;
