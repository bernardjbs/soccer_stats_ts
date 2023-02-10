import { emptyResultMatches, updateMatchResult } from './scrapeController.js';
import { Match } from '../ts/types';
import playwright, { chromium } from 'playwright';
import { delay } from './helpers.js';

import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import { MatchStatsInterface } from '../ts/interfaces.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, '../../../.env')
});

// Get matches with no results
const matches = await emptyResultMatches();

const updateResult = async (matchId: String) => {
  console.log(`Saving result for match: ${matchId}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  // await page.goto('https://www.flashscore.com/');

  await page.goto(`https://www.flashscore.com/match/${matchId}/#/match-summary/match-summary`);
  await delay(1000);

  const matchStatus = await page.evaluate(() => {
    return document.querySelector('.fixedScore__status')?.textContent;
  });

  if (matchStatus === 'Finished') {
    await page.locator('a[href="#/match-summary/match-statistics"]').click();
    await delay(2000);

    const scores = page.locator('.detailScore__wrapper');
    const homeScore = await scores.locator('span').nth(0).innerText();
    const awayScore = await scores.locator('span').nth(2).innerText();

    const statRows = page.locator('.stat__row');
    const statsCount = await statRows.count();

    const statsCategory = statRows.locator('.stat__categoryName');
    const statsHome = statRows.locator('.stat__homeValue');
    const statsAway = statRows.locator('.stat__awayValue');

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
    }

    await updateMatchResult(matchId, resultObj);
  }
  page.close();
};

let matchIds: string[] = []

matches.map((match: Match) => {
  matchIds.push(match.matchId)
});

// The count for number of matche results to be updated at one run
let count = 1;

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
    () => updateResults(matchIds.slice(1), interval), // wrap in an arrow function to defer evaluation
    interval
  );
};

updateResults(matchIds);