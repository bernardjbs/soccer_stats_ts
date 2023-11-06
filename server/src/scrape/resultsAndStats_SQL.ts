import playwright, { chromium } from 'playwright';
import fetch from 'node-fetch';
import { delay } from '@utils/helpers.js';
import { MatchStatsInterface } from '@ts/interfaces.js';
import { saveScore, saveStats } from '@utils/mongoToSql.js';
import { processEnv } from '@utils/processEnv.js';

async function fetchMatchIds() {
  const apiUrl = 'http://soccer.test/api/matches';
  try {
    const response = await fetch(apiUrl);
    const matchIds: string[] = await response.json();
    return matchIds;
  } catch (error) {
    console.log(error);
  }
}

// console.log(matchIds);
const saveResult = async (matchId: string) => {
  console.log(`Saving result for match: ${matchId}`);

  const browser = await chromium.launch({ headless: true }); //Headless false = With browser
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${processEnv().SCRAPE_SOURCE_01}/match/${matchId}/#/match-summary/match-summary`);
  await delay(1000);

  const matchStatus = await page.evaluate(() => {
    return document.querySelector('.fixedScore__status')?.textContent;
  });

  if (matchStatus === 'Finished') {
    const statsBtnLocator = page.locator('a[href="#/match-summary/match-statistics"]');
    if ((await statsBtnLocator.count()) == 0) return 0;

    await statsBtnLocator.click();
    await delay(2000);

    // Get the scores
    const scores = page.locator('.detailScore__wrapper');
    const homeScore = parseInt(await scores.locator('span').nth(0).innerText());
    const awayScore = parseInt(await scores.locator('span').nth(2).innerText());

    console.log(`Home Score: ${homeScore}`);
    console.log(`Away Score: ${awayScore}`);
    console.log('Saving the match score');

    // Save The match score
    saveScore(matchId, homeScore, awayScore)

    // Get the match stats
    const statRows = page.locator('.stat__row');
    const statsCount = await statRows.count();

    const statsCategory = statRows.locator('.stat__categoryName');
    const statsHome = statRows.locator('.stat__homeValue');
    const statsAway = statRows.locator('.stat__awayValue');

    for (let i = 0; i < statsCount; i++) {
      let categoryStat: number = 0;

      const category = await statsCategory.nth(i).innerText();
      if (category === 'Yellow Cards' || category === 'Corner Kicks' || category === 'Expected Goals (xG)') {
        if (category === 'Expected Goals (xG)') {
          categoryStat = 1
        } else if (category === 'Yellow Cards') {
          categoryStat = 2;
        } else if (category === 'Corner Kicks') {
          categoryStat = 3
        }
        
        const home_score = parseInt(await statsHome.nth(i).innerText());
        const away_score = parseInt(await statsAway.nth(i).innerText());

        // Save Results for match
        saveStats(matchId, categoryStat, 'Home', home_score);
        console.log('Saved the home stat: ' + category)
        
        saveStats(matchId, categoryStat, 'Away', away_score);
        console.log('Saved the away stat: ' + category)
      }
    }
  }
};

// The count for number of matche results to be updated at one run
let count = 50;

const saveResults = async (matchIds: string[], interval: number = 1000) => {
  if (matchIds.length == 0 || count == 0) {
    // stop when there's no more items to process
    console.log('ALL DONE');
    process.exit();
    return;
  }
  count = count - 1;
  await saveResult(matchIds[0]);

  setTimeout(
    () => {
      saveResults(matchIds.slice(1), interval);
    }, // wrap in an arrow function to defer evaluation
    interval
  );
};

const matchIds = await fetchMatchIds();

if (matchIds) {
  saveResults(matchIds);
}
