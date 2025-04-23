import playwright from 'playwright';
import { processEnv } from './processEnv.js';

let matchPreviewLinks: string[] = [];

const scrapeStats = async () => {
  const browser = await playwright.chromium.launch({
    headless: false // setting this to true will not run the UI
  });

  const page = await browser.newPage();
  await page.goto(`${processEnv().SCRAPE_SOURCE_02}`, { waitUntil: 'domcontentloaded' });

  const tomorrowElement = page.getByText('Tomorrow', { exact: true });
  await tomorrowElement.click();


  const previewSelector = 'a.Match-module_previewBtn__mYHIm[href*="/preview/"]';

  // Get all preview buttons
  const previewButtons = await page.$$(previewSelector);

  // Click the first preview button if available
  if (previewButtons.length > 0) {
    const link = await previewButtons[0].getAttribute('href');

    if (link) {
      matchPreviewLinks.push(link);
    }
  }

  // If we have preview buttons, go to each one and scrape the stats
  for (const link of matchPreviewLinks) {
    await page.goto(`${processEnv().SCRAPE_SOURCE_02}${link}`, { waitUntil: 'domcontentloaded' });
    console.log(`Navigated to: ${processEnv().SCRAPE_SOURCE_02}${link}`);
    // Wait for the match header to be visible
    await page.waitForSelector('#match-header', { state: 'visible' });
    console.log('Match header is visible');
    const headToHead = page.getByText('Head to Head', { exact: true });
    await headToHead.click();
    console.log('Head to Head clicked');
    
    await page.waitForSelector('text=Team Statistics', { state: 'visible' });
    console.log('Team Statistics is visible');

    
    const teamStatistics = page.getByText('Team Statistics', { exact: true });
    await teamStatistics.click();
    console.log('Team Statistics clicked');

    // Wait for text Situational Statistics
    await page.waitForSelector('text=Situational Statistics', { state: 'visible' });
    console.log('Situational Statistics is visible');

    // Get stats for Home and Away
    const situationalStats = await getSituationStats(page);

  await page.waitForTimeout(2500);

  // close the page
  await page.close();
  console.log('Page closed');

  // close the browser
  await browser.close();
  console.log('Browser closed');
  console.log('Scraping completed');
  }
};

async function getSituationStats(page: playwright.Page) {
  const homeLink = page.locator('#ws-goals-filter').locator('.home-team-filter').getByText('Home', { exact: true }).nth(0);
  const awayLink = page.locator('#ws-goals-filter').locator('.away-team-filter').getByText('Away', { exact: true }).nth(0);

  await homeLink.waitFor({ state: 'visible' });
  await awayLink.waitFor({ state: 'visible' });

  await homeLink.click();
  console.log('Home Link clicked');
  await awayLink.click();
  console.log('Away Link clicked');

  const stats = await page.$$eval('#ws-goals-info .stat', (statElements) => {
    return statElements.map((stat) => {
      const values = stat.querySelectorAll('.stat-value span');
      const label = stat.querySelector('.stat-label')?.textContent?.trim();

      return {
        home: values[0]?.textContent?.trim() || null,
        label,
        away: values[1]?.textContent?.trim() || null
      };
    });
  });

  return stats;
}

scrapeStats();
