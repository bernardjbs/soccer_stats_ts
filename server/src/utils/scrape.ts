import playwright from 'playwright';
import { MatchStatsInterface } from '../ts/interfaces';
import { MongoClient } from 'mongodb';
import colors from 'colors.ts';
import { random } from '../utils/helpers.js';
import { Match, OverallStats, HomeStats, AwayStats } from '../ts/types';
import { saveMatch } from './scrapeController.js';
import { myLeagues } from './myLeagues.js';

import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, '../../../.env')
});

export const delay = (time: number) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

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

  const matchCompetition = await page.locator('.tournamentHeader__country').innerText();
  console.log(`match competition: ${matchCompetition}`);
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

  const overallStats: OverallStats = await matchH2H(matchId, 'overall', overallPage);
  await overallPage.close();

  const homeStats: HomeStats = await matchH2H(matchId, 'home', homePage);
  await homePage.close();

  const awayStats: AwayStats = await matchH2H(matchId, 'away', awayPage);
  await awayPage.close();

  let match: Match = {
    matchId: matchId,
    matchCompetition: matchCompetition,
    matchStart: matchStart,
    homeTeam: homeTeam,
    awayTeam: awayTeam,
    hotStat: hotStat,
    overallStats: overallStats,
    homeStats: homeStats,
    awayStats: awayStats
  };
  saveMatch(match);
  await browser.close();
};

export const strToDateTime = (str: string, dateSeparator: string, timeSeparator: string) => {
  const [dateComponents, timeComponents] = str.split(' ');
  const [day, month, year] = dateComponents.split(dateSeparator);
  if (timeSeparator == '') {
    return new Date(+year, parseInt(month) - 1, +day);
  } else {
    const [hours, minutes] = timeComponents.split(timeSeparator);
    return new Date(+year, parseInt(month) - 1, +day, +hours, +minutes);
  }
};

// wldIdx is used to get the row number for either Overall, Home team and Away team stats
export const results = async (matches: playwright.Locator, page: playwright.Page, wldIdx: number) => {
  const matchRow3 = page.locator(`//div[contains(@class, 'h2h__section')][${wldIdx}]`).locator("//div[contains(@class, 'h2h__row')]");
  let tempH2Harr = [];
  let outcome;
  const count = await matches.count();
  for (let i = 0; i < count; i++) {
    const match = matches.nth(i);
    await delay(1000);

    const competition = await match.locator('.h2h__event').getAttribute('title');
    const homeTeam = await match.locator('.h2h__homeParticipant').innerText();
    const awayTeam = await match.locator('.h2h__awayParticipant').innerText();
    const homeTeamScore = await match.locator('.h2h__result').locator('span').nth(0).innerText();
    const awayTeamScore = await match.locator('.h2h__result').locator('span').nth(1).innerText();
    console.log('Processing Head to Heads... ');

    if (matches.toString() !== matchRow3.toString()) {
      outcome = await match.locator('.wld').innerText();
    }

    const [matchSummary] = await Promise.all([page.waitForEvent('popup'), await match.click()]);

    await matchSummary.waitForLoadState();

    // Exit loop if there is no stats available
    const statsElCount = await matchSummary.locator('a[href="#/match-summary/match-statistics"]').count();
    if (statsElCount < 1) {
      await matchSummary.close();
      continue;
    }

    await matchSummary.locator('a[href="#/match-summary/match-statistics"]').click();
    await delay(1000);
    const date = await matchSummary.locator('.duelParticipant__startTime').innerText();

    const statsCategory = matchSummary.locator('.stat__categoryName');
    const statsHome = matchSummary.locator('.stat__homeValue');
    const statsAway = matchSummary.locator('.stat__awayValue');
    const statsCount = await statsCategory.count();

    let matchStats: MatchStatsInterface[] = [];
    for (let i = 0; i < statsCount; i++) {
      let tempStat: MatchStatsInterface = {
        categoryStat: await statsCategory.nth(i).innerText(),
        homeStat: await statsHome.nth(i).innerText(),
        awayStat: await statsAway.nth(i).innerText()
      };
      matchStats.push(tempStat);
    }

    const tempH2Hobj = {
      date: strToDateTime(date, '.', ''),
      competition: competition,
      homeTeam: homeTeam,
      awayTeam: awayTeam,
      homeTeamScore: Number(homeTeamScore),
      awayTeamScore: Number(awayTeamScore),
      outcome: outcome,
      matchStats: matchStats
    };
    // tempH2Harr.push(JSON.stringify(tempH2Hobj));
    tempH2Harr.push(tempH2Hobj);
    await matchSummary.close();
  }
  return tempH2Harr;
};

export const matchH2H = async (matchId: string, tab: string, page: playwright.Page) => {
  let stats: any;
  if (tab === 'overall') {
    await page.goto(`https://www.flashscore.com/match/${matchId}/#/h2h/${tab}`);
    const Row1_Matches = page.locator("//div[contains(@class, 'h2h__section')][1]").locator("//div[contains(@class, 'h2h__row')]");
    const Row2_Matches = page.locator("//div[contains(@class, 'h2h__section')][2]").locator("//div[contains(@class, 'h2h__row')]");
    const Row3_Matches = page.locator("//div[contains(@class, 'h2h__section')][3]").locator("//div[contains(@class, 'h2h__row')]");

    stats = {
      overallHome_lastMatches: await results(Row1_Matches, page, 3),
      overallAway_lastMatches: await results(Row2_Matches, page, 3),
      overallH2H: await results(Row3_Matches, page, 3)
    };
  } else if (tab === 'home') {
    await page.goto(`https://www.flashscore.com/match/${matchId}/#/h2h/${tab}`);
    const Row1_Matches = page.locator("//div[contains(@class, 'h2h__section')][1]").locator("//div[contains(@class, 'h2h__row')]");
    const Row2_Matches = page.locator("//div[contains(@class, 'h2h__section')][2]").locator("//div[contains(@class, 'h2h__row')]");
    stats = {
      lastMatchesHome: await results(Row1_Matches, page, 2),
      lastMatchesH2H: await results(Row2_Matches, page, 2)
    };
  } else {
    await page.goto(`https://www.flashscore.com/match/${matchId}/#/h2h/${tab}`);
    const Row1_Matches = page.locator("//div[contains(@class, 'h2h__section')][1]").locator("//div[contains(@class, 'h2h__row')]");
    const Row2_Matches = page.locator("//div[contains(@class, 'h2h__section')][2]").locator("//div[contains(@class, 'h2h__row')]");
    stats = {
      lastMatchesAway: await results(Row1_Matches, page, 2),
      lastMatchesH2H: await results(Row2_Matches, page, 2)
    };
  }
  return stats;
};



const setFavMatches = async (eventHeader: playwright.Locator) => {
  const eventHeader_count = await eventHeader.count();

  for (let i = 0; i < eventHeader_count; i++) {
    let star;

    star = eventHeader.nth(i).locator('div').nth(0);
    if ((await eventHeader.nth(i).locator('div').nth(2).locator('span').nth(0).count()) == 1) {
      const country = await eventHeader.nth(i).locator('div').nth(2).locator('span').nth(0).innerHTML();
      const competition = await eventHeader.nth(i).locator('div').nth(2).locator('span').nth(1).innerHTML();
      for (let idx = 0; idx < myLeagues.length; idx++) {
        if (country === myLeagues[idx].country && competition === myLeagues[idx].competition) {
          await star.click();
          const toggleText = eventHeader.nth(i).locator('div').nth(0).locator('span').nth(2);
          const x = eventHeader.nth(i).locator('div').nth(0).locator('svg').nth(1);
          if ((await toggleText.innerHTML()) === 'Remove this league from My Leagues!') {
            await x.click();
          } else if ((await toggleText.innerHTML()) === 'Add this league to My Leagues!') {
            await toggleText.click();
          }
        }
      }
    }
  }
};

export const getMatchIds = async (day: string) => {
  const browser = await playwright.chromium.launch({
    headless: false // setting this to true will not run the UI
  });

  const page = await browser.newPage();
  await page.goto('https://www.flashscore.com');

  if (day === 'nextDay') {
    await page.locator('#live-table').locator('div').nth(0).locator('div[title="Next day"]').click();
  }

  const sportNameDivs = page.locator('.sportName').locator('div');
  const SNDivsCount = await sportNameDivs.count();
  delay(5000);

  console.log(`sportDivCount: ${SNDivsCount}`.red);
  let matchIds = [];
  const eventHeader = page.locator("xpath=//div[contains(@class, 'event__header')] ");

  // Set my matches to favourites
  await setFavMatches(eventHeader);

  // Loop through sportDivs and get ids from favourites
  let star_class;
  for (let i = 0; i < SNDivsCount; i++) {
    const idElem = await sportNameDivs.nth(i).getAttribute('id');
    // const star_class = await eventHeader.locator('div').nth(0).locator('span').locator('svg').getAttribute('class')
    const starCount = await sportNameDivs.nth(i).locator('div').nth(0).locator('span').locator('svg').count();
    if (starCount > 0) {
      star_class = await sportNameDivs.nth(i).locator('div').nth(0).locator('span').locator('svg').getAttribute('class');
      console.log(star_class);
    }

    if (star_class === 'star-ico eventStar eventStar--active' && idElem) {
      console.log(idElem);
      matchIds.push(idElem.substring(4));
      // console.log('add match id')
    } else if (star_class === 'star-ico eventStar ') {
      break;
      console.log('break');
    }
  }

  console.log(matchIds);
  browser.close();
  return matchIds;
};

export const buildStats = async (matchIds: string[], interval: number = random(1000, 3000)) => {
  if (matchIds.length == 0) {
    // stop when there's no more items to process
    console.log('ALL DONE');
    process.exit();
    return;
  }
  // await dosomething();
  await match(matchIds[0]);

  setTimeout(
    () => buildStats(matchIds.slice(1), interval), // wrap in an arrow function to defer evaluation
    interval
  );
};
