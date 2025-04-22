import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { svelteInspector } from '@sveltejs/vite-plugin-svelte-inspector';


export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), svelteInspector({ toggleButton: true })],
	resolve: {
		alias: {
			$c: path.resolve(__dirname, 'src/lib/c')
		}
	},
	ssr: {
		// noExternal: ['sqlite3'],
	},
});
