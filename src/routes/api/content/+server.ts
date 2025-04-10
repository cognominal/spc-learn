import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs/promises';
import path from 'path';

export const GET: RequestHandler = async () => {
  try {
    // Read the processed HTML file
    const processedHtml = await fs.readFile(
      path.join(process.cwd(), 'static', 'grok-processed-file.html'),
      'utf-8'
    );

    // Return the content as JSON
    return json({
      processedHtml
    });
  } catch (error) {
    console.error('Error reading processed HTML file:', error);
    return new Response(JSON.stringify({ error: 'Failed to load content' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
