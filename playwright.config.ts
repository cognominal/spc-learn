import { defineConfig } from '@playwright/test';

export default defineConfig({
	timeout: 30000, // 30 seconds for each test

	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'e2e'
});
