import playwright from 'playwright';
import { processEnv } from '@utils/processEnv.js';

const browser = await playwright.chromium.launch({
  headless: false // setting this to true will not run the UI
});

const page = await browser.newPage();

// Go to today's match
await page.goto(`${processEnv().SCRAPE_SOURCE_01}/match/${processEnv().MATCH_ID}/#/match-summary`);

// Click on the head to head
const buttonLocator = page.locator('a[href="#/h2h"]');
await buttonLocator.click();

// Wait for head to head section
await page.locator('.h2hSection').waitFor();

// Selector tabs for OVERALL - HOME - AWAY
const ohaTabs = page.locator('.filter__group a');
await ohaTabs.nth(0).waitFor();

const ohaTabsCount = await ohaTabs.count();

console.log(`count: ${ohaTabsCount}`);
/**
 * For each tab and locate h2h sections, click on h2h row match
 * For each h2h sections, click on the h2h row (h2h match)
 */

for (let i = 1; i < ohaTabsCount; i++) {
  // Head to head sections
  const tab = ohaTabs.nth(i);
  await tab.click();
}
