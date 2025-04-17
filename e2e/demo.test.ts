import { expect, test } from '@playwright/test';

test('home page has expected .break-words', async ({ page }) => {
	await page.goto('/');
	const locators = page.locator('.break-words');
	const count = await locators.count();
	for (let i = 0; i < count; i++) {
		await expect(locators.nth(i)).toBeVisible();
	}
});
