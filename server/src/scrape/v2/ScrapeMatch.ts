import playwright from 'playwright';
import { processEnv } from '@utils/processEnv.js';
import { delay } from '@utils/helpers.js';
import { match } from 'assert';

const browser = await playwright.chromium.launch({
  headless: true // setting this to true will not run the UI
});

const page = await browser.newPage();

// Go to today's match
await page.goto(`${processEnv().SCRAPE_SOURCE_01}/match/${processEnv().MATCH_ID}/#/match-summary`);

// Click on the head to head
const buttonLocator = page.locator('a[href="#/h2h"]');
await buttonLocator.click();

// Wait for head to head section
await page.locator('.h2hSection').waitFor();

// Overall tab
const overallTab = page.locator('a[href="#/h2h/overall"]');
const homeTab = page.locator('a[href="#/h2h/home"]');
const awayTab = page.locator('a[href="#/h2h/away"]');

const ohaTabs = [overallTab, homeTab, awayTab];

for (const tab of ohaTabs) {
  await tab.click();

  // Head to head sections for tab
  const tabMatches = page.locator('.h2h__row');

  for (let i = 0; i < (await tabMatches.count()); i++) {
    // Match summary popup (to get match stats)
    const [matchSummary] = await Promise.all([
      page.waitForEvent('popup'),
      await tabMatches.nth(i).click()
    ]);

    await matchSummary.waitForLoadState();

    const statsTab = matchSummary.locator('a[href="#/match-summary/match-statistics"]');

    await statsTab.click();

    const matchStatus = await matchSummary.locator('.fixedScore__status').innerText();

    // Skip if match status is not finished (maybe Postponed or To Finish etc... )
    if (matchStatus != 'FINISHED') continue;

    /**
     * TODO: 
     * fixedHeaderDuel__detailStatus
     * EMPTY - Save match info
     * FINISHED - Save results
     * FINISHED - Save Stats
     */

    // Locate the stat rows and grab the home and away stats for each category
    await matchSummary.locator('._category_lq1k0_16').nth(0).waitFor();
    const statRows = matchSummary.locator('._category_lq1k0_16');

    for (let i = 0; i < (await statRows.count()); i++) {
      const category = statRows.nth(i).locator('._category_rbkfg_5');
      const homeStat = statRows.nth(i).locator('._homeValue_1efsh_10 ');
      const awayStat = statRows.nth(i).locator('._awayValue_1efsh_14');
      console.log(await category.innerText());
      console.log(await homeStat.innerText());
      console.log(await awayStat.innerText());
    }

    await matchSummary.close();
  }
}
