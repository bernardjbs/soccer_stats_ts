import playwright from 'playwright';
import { Match, OverallStats, HomeStats, AwayStats } from '../ts/types';

import { strToDateTime, results } from '../utils/helpers.js';

const match = async (matchId: string) => {
  const browser = await playwright.chromium.launch({
    headless: false // setting this to true will not run the UI
  });

  const page = await browser.newPage();
  await page.goto(`https://www.flashscore.com/match/${matchId}/#/h2h/overall`); //Germany

  const matchStart: Date = strToDateTime(await page.locator('.duelParticipant__startTime').innerText(), '.', ':');
  console.log(`match starts at: ${matchStart}`);
  const homeTeam: string = await page.locator('.duelParticipant__home').locator('div').locator('div').nth(2).innerText();
  const awayTeam: string = await page.locator('.duelParticipant__away').locator('div').locator('div').nth(1).innerText();

  let hotStat: string = '';

  try {
    await page.locator('a[href="#/match-summary"]').click();
    const previewBlocks = page.locator('.previewOpenBlock').locator('div');
    await page.locator('.previewShowMore').click({ timeout: 3000 });
    hotStat = await previewBlocks.nth(5).innerText();
  } catch (err) {
    hotStat = 'Hot Stats is not available for this match';
    console.log('Hot Stats is not available for this match');
  }

  const context = await browser.newContext();
  const overallPage = await context.newPage();
  const homePage = await context.newPage();
  const awayPage = await context.newPage();

  const matchH2H = async (tab: string) => {
    let stats: any;
    if (tab === 'overall') {
      await overallPage.goto(`https://www.flashscore.com/match/${matchId}/#/h2h/${tab}`);
      const Row1_Matches = overallPage.locator("//div[contains(@class, 'h2h__section')][1]").locator("//div[contains(@class, 'h2h__row')]");
      const Row2_Matches = overallPage.locator("//div[contains(@class, 'h2h__section')][2]").locator("//div[contains(@class, 'h2h__row')]");
      const Row3_Matches = overallPage.locator("//div[contains(@class, 'h2h__section')][3]").locator("//div[contains(@class, 'h2h__row')]");

      stats = {
        overallHome_lastMatches: await results(Row1_Matches, overallPage, 3),
        overallAway_lastMatches: await results(Row2_Matches, overallPage, 3),
        overallH2H: await results(Row3_Matches, overallPage, 3)
      };
    } else if (tab === 'home') {
      await homePage.goto(`https://www.flashscore.com/match/${matchId}/#/h2h/${tab}`);
      const Row1_Matches = homePage.locator("//div[contains(@class, 'h2h__section')][1]").locator("//div[contains(@class, 'h2h__row')]");
      const Row2_Matches = homePage.locator("//div[contains(@class, 'h2h__section')][2]").locator("//div[contains(@class, 'h2h__row')]");
      stats = {
        lastMatchesHome: await results(Row1_Matches, homePage, 2),
        lastMatchesH2H: await results(Row2_Matches, homePage, 2)
      };
    } else {
      await awayPage.goto(`https://www.flashscore.com/match/${matchId}/#/h2h/${tab}`);
      const Row1_Matches = awayPage.locator("//div[contains(@class, 'h2h__section')][1]").locator("//div[contains(@class, 'h2h__row')]");
      const Row2_Matches = awayPage.locator("//div[contains(@class, 'h2h__section')][2]").locator("//div[contains(@class, 'h2h__row')]");
      stats = {
        lastMatchesAway: await results(Row1_Matches, awayPage, 2),
        lastMatchesH2H: await results(Row2_Matches, awayPage, 2)
      };
    }
    return stats;
  };
  const overallStats: OverallStats = await matchH2H('overall');
  const homeStats: HomeStats = await matchH2H('home');
  const awayStats: AwayStats = await matchH2H('away');

  await overallPage.close();

  let match: Match = {
    matchId: matchId,
    matchStart: matchStart,
    homeTeam: homeTeam,
    awayTeam: awayTeam,
    hotStat: hotStat,
    overallStats: overallStats,
    homeStats: homeStats,
    awayStats: awayStats
  };
};

match('hzaY6DEa');
