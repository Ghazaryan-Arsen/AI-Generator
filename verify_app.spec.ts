import { test, expect } from '@playwright/test';

test('AI Image Generator E2E', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/AI Image Generator/);
  
  const promptInput = page.locator('textarea');
  await promptInput.fill('A futuristic city at sunset');
  
  const generateBtn = page.getByRole('button', { name: /Generate Image/i });
  await generateBtn.click();
  
  // Wait for image or error
  await page.waitForTimeout(5000); 
  
  await page.screenshot({ path: 'final_verification.png', fullPage: true });
});
