import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		alias: {
			$c: path.resolve(__dirname, 'src/c')
		}
	},
	ssr: {
		// noExternal: ['sqlite3'],
	},
});
