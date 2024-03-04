import { deleteMatches, emptyResultMatches, updateMatchResult } from './scrapeController.js';
import { MatchType } from '@ts/types.js';
import playwright, { chromium } from 'playwright';
import { delay } from './helpers.js';
import { MatchStatsInterface } from '@ts/interfaces.js';
import { processEnv } from '@utils/processEnv.js';

// Get matches with no results
const matches = await emptyResultMatches();

console.log(`Matches with empty results: ${matches.length}`);
const updateResult = async (matchId: string) => {
  console.log(`Saving result for match: ${matchId}`);

  const browser = await chromium.launch({ headless: false }); //Headless false = With browser
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${processEnv().SCRAPE_SOURCE_01}/match/${matchId}/#/match-summary/match-summary`);
  await delay(1000);

  const matchStatus = await page.evaluate(() => {
    return document.querySelector('.fixedScore__status')?.textContent;
  });

  if (matchStatus === 'Finished') {
    const statsBtnLocator = page.getByRole('link', { name: 'Stats' });

    if ((await statsBtnLocator.count()) == 0) {
      console.log(`Deleting match ${matchId}`);
      deleteMatches([matchId]);
      return 0;
    }

    await statsBtnLocator.click();
    await delay(2000);

    const scores = page.locator('.detailScore__wrapper');
    const homeScore = await scores.locator('span').nth(0).innerText();
    const awayScore = await scores.locator('span').nth(2).innerText();

    const statRows = page.locator('._row_17bol_9');
    const statsCount = await statRows.count();

    const statsCategory = statRows.locator('._category_1ofrm_5');
    const statsHome = statRows.locator('._homeValue_rvaa1_10');
    const statsAway = statRows.locator('._awayValue_rvaa1_14');

    let matchStats: MatchStatsInterface[] = [];

    for (let i = 0; i < statsCount; i++) {
      const category = await statsCategory.nth(i).innerText();

      if (category === 'Yellow Cards' || category === 'Corner Kicks') {
        let tempStat: MatchStatsInterface = {
          categoryStat: await statsCategory.nth(i).innerText(),
          homeStat: parseInt(await statsHome.nth(i).innerText()),
          awayStat: parseInt(await statsAway.nth(i).innerText())
        };
        matchStats.push(tempStat);
      }
    }

    const resultObj = {
      homeScore: homeScore,
      awayScore: awayScore,
      matchStats: matchStats
    };
    await updateMatchResult(matchId, resultObj);
  }
  page.close();
};

let matchIds: string[] = [];

matches.map((match: MatchType) => {
  matchIds.push(match.matchId);
});

// The count for number of matche results to be updated at one run
let count = 50;

// Update a single matchId
// updateResult('4lyB61B6');

const updateResults = async (matchIds: string[], interval: number = 1000) => {
  if (matchIds.length == 0 || count == 0) {
    // stop when there's no more items to process
    console.log('ALL DONE');
    process.exit();
    return;
  }
  count = count - 1;
  await updateResult(matchIds[0]);

  setTimeout(
    () => {
      updateResults(matchIds.slice(1), interval);
    }, // wrap in an arrow function to defer evaluation
    interval
  );
};

updateResults(matchIds);
