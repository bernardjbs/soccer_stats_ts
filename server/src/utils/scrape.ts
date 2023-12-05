import { TeamFormRankInterface } from '@ts/interfaces';
import playwright from 'playwright';
import { MatchStatsInterface, H2hInterface } from '@ts/interfaces';
import util, { types } from 'util';
import Colors from 'colors.ts';
import { random, delay, strToDateTime } from './helpers.js';
import { MatchType } from '@ts/types';
import { saveMatch, matchExists } from './scrapeController.js';
import { myLeagues } from './myLeagues.js';
import { processEnv } from '@utils/processEnv.js';
import { count, table } from 'console';
import { type } from 'os';
Colors.enable();

const match = async (matchId: string) => {
  const browser = await playwright.chromium.launch({
    headless: false // setting this to true will not run the UI
  });

  const page = await browser.newPage();
  await page.goto(`${processEnv().SCRAPE_SOURCE_01}/match/${matchId}/#/match-summary`);

  const matchStart: Date = strToDateTime(await page.locator('.duelParticipant__startTime').innerText(), '.', ':');
  const homeTeam: string = await page.locator('.duelParticipant__home').innerText();
  const awayTeam: string = await page.locator('.duelParticipant__away').innerText();
  const competition: string = await page.locator('.tournamentHeader__country').innerText();
  console.log(`\n${competition} - ${homeTeam} vs ${awayTeam} *** match starts at: ${matchStart}`.red.bg_green);

  let hotStat: string = '';

  try {
    const previewBlocks = page.locator('.previewOpenBlock').locator('div');
    await page.locator('.previewShowMore').click({ timeout: 3000 });
    hotStat = await previewBlocks.nth(5).innerText();
    console.log(`Hot stat: ${hotStat}`);
  } catch (err) {
    hotStat = 'Hot Stats is not available for this match';
    console.log('Hot Stats is not available for this match');
  }

  //******* FORM STATS ******/
  const standingsCount = await page.locator('a[href="#/standings"]').count();
  let homeForm: TeamFormRankInterface = {
    homeTeamRank: 0,
    awayTeamRank: 0
  };

  let awayForm: TeamFormRankInterface = {
    homeTeamRank: 0,
    awayTeamRank: 0
  };

  let formStats: any = {
    homeForm: {},
    awayForm: {}
  };

  if (standingsCount > 0) {
    await page.locator('a[href="#/standings"]').click();
    const formButton = page.locator('a[href="#/standings/form"]');
    if ((await formButton.count()) > 0) {
      await page.locator('a[href="#/standings/form"]').click();
      await page.locator('a[href="#/standings/form/home"]').click();
      const standingHomeFormTeams = page.locator('div[class="ui-table__body"]').locator('div[class="ui-table__row table__row--selected "]');
      const homeFormTeam1 = await standingHomeFormTeams.locator('div[class="tableCellParticipant__block"]').nth(0).innerText();
      const homeFormTeam1Rank = (await standingHomeFormTeams.locator('div[class="tableCellRank"]').nth(0).innerText()).replace('.', '');
      const homeFormTeam2Rank = (await standingHomeFormTeams.locator('div[class="tableCellRank"]').nth(1).innerText()).replace('.', '');

      if (homeTeam === homeFormTeam1) {
        homeForm = {
          homeTeamRank: parseInt(homeFormTeam1Rank),
          awayTeamRank: parseInt(homeFormTeam2Rank)
        };
      } else {
        homeForm = {
          homeTeamRank: parseInt(homeFormTeam2Rank),
          awayTeamRank: parseInt(homeFormTeam1Rank)
        };
      }

      await page.locator('a[href="#/standings/form/away"]').click();
      const standingAwayFormTeams = page.locator('div[class="ui-table__body"]').locator('div[class="ui-table__row table__row--selected "]');
      const awayFormTeam1 = await standingAwayFormTeams.locator('div[class="tableCellParticipant__block"]').nth(0).innerText();
      const awayFormTeam1Rank = (await standingAwayFormTeams.locator('div[class="tableCellRank"]').nth(0).innerText()).replace('.', '');
      const awayFormTeam2Rank = (await standingAwayFormTeams.locator('div[class="tableCellRank"]').nth(1).innerText()).replace('.', '');

      if (homeTeam === awayFormTeam1) {
        awayForm = {
          homeTeamRank: parseInt(awayFormTeam1Rank),
          awayTeamRank: parseInt(awayFormTeam2Rank)
        };
      } else {
        awayForm = {
          homeTeamRank: parseInt(awayFormTeam2Rank),
          awayTeamRank: parseInt(awayFormTeam1Rank)
        };
      }
    }
  }

  formStats = {
    homeForm,
    awayForm
  };

  //******* OVERALL MATCHES ******/
  // Go to H2H Section - Default is on Overall Matches
  await page.locator('a[href="#/h2h"]').click();
  const overallHomeElems = page.locator('.h2h').locator('.h2h__section').nth(0);
  const overallAwayElems = page.locator('.h2h').locator('.h2h__section').nth(1);
  const overallH2hElems = page.locator('.h2h').locator('.h2h__section').nth(2);

  // Wait for locator to load before proceeding
  await overallHomeElems.waitFor();

  // Get previous stats for overall HOME matches
  const overallHomeStats = await getStats(overallHomeElems, page, 'Overall last matches for Home');
  await overallAwayElems.waitFor();

  // Get previous stats for overall AWAY matches
  const overallAwayStats = await getStats(overallAwayElems, page, 'Overall last matches for Away');
  await overallH2hElems.waitFor();

  // Get previous stats for overall H2H matches
  const overallH2hStats = await getStats(overallH2hElems, page, 'Overall last matches for Head to Head');

  //******* HOME MATCHES ******/
  // Go to Home Matches
  await page.locator('a[href="#/h2h/home"]').click();
  const homeElems = page.locator('.h2h').locator('.h2h__section').nth(0);

  // Wait for locator to load before proceeding
  await homeElems.waitFor();

  // Get previous stats for HOME matches
  const homeStats = await getStats(homeElems, page, 'Home team last matches');

  //******* AWAY MATCHES ******/
  // Go to Away Matches
  await page.locator('a[href="#/h2h/away"]').click();
  const awayElems = page.locator('.h2h').locator('.h2h__section').nth(0);

  // Wait for locator to load before proceeding
  await awayElems.waitFor();

  // Get previous stats for AWAY matches
  const awayStats = await getStats(awayElems, page, 'Away team last matches');

  //******* DIRECT HEAD TO HEAD MATCHES ******/
  const directH2hElems = page.locator('.h2h').locator('.h2h__section').nth(1);
  const directH2hStats = await getStats(directH2hElems, page, 'Direct Head to Head');

  // Build the match Object
  let match: MatchType = {
    matchId: matchId,
    matchStart: matchStart,
    competition: competition,
    homeTeam: homeTeam,
    awayTeam: awayTeam,
    hotStat: hotStat,
    overallHomeStats: overallHomeStats,
    overallAwayStats: overallAwayStats,
    overallH2hStats: overallH2hStats,
    homeStats: homeStats,
    awayStats: awayStats,
    directH2hStats: directH2hStats,
    formStats: formStats,
    result: []
  };
  // console.log(util.inspect(match, { colors: true, depth: 4 }));
  console.log('Save to Database');
  await saveMatch(match);
  await browser.close();
};

const getStats = async (matches: playwright.Locator, page: playwright.Page, lastMatchesType: string) => {
  console.log('Getting Stats');
  await delay(10000)
  let statsCollection: H2hInterface[] = [];
  const matchCollection = matches.locator('.rows').locator('.h2h__row');
  const count = await matchCollection.count();
  console.log(`Scraping ${lastMatchesType} (${count})...`);
  let outcome;
  for (let i = 0; i < count; i++) {
    const homeTeam = await matchCollection.nth(i).locator('.h2h__homeParticipant').innerText();
    const awayTeam = await matchCollection.nth(i).locator('.h2h__awayParticipant').innerText();
    const competition = await matchCollection.nth(i).locator('.h2h__event').getAttribute('title');

    const homeTeamScoreCount = matchCollection.nth(i).locator('.h2h__result').locator('span').nth(0).count();
    const awayTeamScoreCount = matchCollection.nth(i).locator('.h2h__result').locator('span').nth(1).count();

    if ((await homeTeamScoreCount) == 0 || (await awayTeamScoreCount) == 0) continue;

    const homeTeamScore = await matchCollection.nth(i).locator('.h2h__result').locator('span').nth(0).innerText();
    const awayTeamScore = await matchCollection.nth(i).locator('.h2h__result').locator('span').nth(1).innerText();

    if ((await matchCollection.nth(i).locator('.wld').count()) > 0) {
      outcome = await matchCollection.nth(i).locator('.wld').innerText();
    } else {
      outcome = 'N/A';
    }

    // Checks the match status - Postponed || Match to finish
    const matchPostponed = await page.evaluate(() => {
      return document.querySelector('.fixedScore__status')?.textContent;
    });

    if (matchPostponed == 'Postponed' || matchPostponed == '') {
      continue;
    }

    const matchToFinish = await page.evaluate(() => {
      return document.querySelector('.event__stage')?.textContent;
    });

    if (matchToFinish == 'To Finish' || matchToFinish == '') {
      continue;
    }

    const [matchSummary] = await Promise.all([page.waitForEvent('popup'), await matchCollection.nth(i).click()]);
    await matchSummary.waitForLoadState();

    const statsElCount = await matchSummary.locator('a[href="#/match-summary/match-statistics"]').count();
    let matchStats: MatchStatsInterface[] = [];
    if (statsElCount > 0) {
      await matchSummary.locator('a[href="#/match-summary/match-statistics"]').click();
      await delay(1000);
      const statsCategory = matchSummary.locator('.stat__categoryName');
      const statsHome = matchSummary.locator('.stat__homeValue');
      const statsAway = matchSummary.locator('.stat__awayValue');
      const statsCount = await statsCategory.count();
      for (let i = 0; i < statsCount; i++) {
        let tempStat: MatchStatsInterface = {
          categoryStat: await statsCategory.nth(i).innerText(),
          homeStat: parseInt(await statsHome.nth(i).innerText()),
          awayStat: parseInt(await statsAway.nth(i).innerText())
        };
        matchStats.push(tempStat);
      }
    }

    const date = await matchSummary.locator('.duelParticipant__startTime').innerText();

    const tempH2Hobj: H2hInterface = {
      date: strToDateTime(date, '.', ':'),
      competition: competition,
      homeTeam: homeTeam,
      awayTeam: awayTeam,
      homeTeamScore: Number(homeTeamScore),
      awayTeamScore: Number(awayTeamScore),
      outcome: outcome,
      matchStats: matchStats
    };

    statsCollection.push(tempH2Hobj);
    await matchSummary.close();
  }
  // console.log(util.inspect(statsCollection, { colors: true, depth: 4 }));

  return statsCollection;
};

export const getMatchIds = async (day: string) => {
  console.log('Selecting Competitions...'.green.bold);
  const browser = await playwright.chromium.launch({
    headless: false // setting this to true will not run the UI
  });

  const page = await browser.newPage();
  console.log(`scrape site: ${processEnv().SCRAPE_SOURCE_01}`);
  await page.goto(`${processEnv().SCRAPE_SOURCE_01}`);
  let divs: any;

  if (day === 'nextDay') {
    const nextDay = page.locator('.calendarCont').locator('div').nth(0).locator('button[title="Next day"]');
    await nextDay.click();
    await page.waitForTimeout(5000)
    divs = await page.$$('div');
  }
  
  divs = await page.$$('div');
  let matchIds: string[] = [];
  let foundObject: boolean = false;
  let eventData = {
    country: '',
    competition: ''
  };

  for (const div of divs) {
    const className = await div.getAttribute('class');
    const id = await div.getAttribute('id');

    if (className === 'event__header' || className === 'event__header top pinned') {
      const country = await div.$('.event__title--type');
      const competition = await div.$('.event__title--name');

      const countryText = await country?.innerText();
      const competitionText = await competition?.innerText();

      eventData = {
        country: countryText !== undefined ? countryText : '',
        competition: competitionText !== undefined ? competitionText : ''
      };

      for (const myLeague of myLeagues) {
        foundObject = false;
        if (eventData.country === myLeague.country && eventData.competition === myLeague.competition) {
          foundObject = true;
          break;
        } else {
          foundObject = false;
        }
      }
    }

    if (foundObject && className === 'event__titleBox') {
      console.log(`\nSetting Match IDs for competition: ${eventData.country} ${eventData.competition}`.green.bold);
    }

    if (foundObject && id && id.startsWith('g_1')) {
      const matchId = id.substring(4);
      // check if matchId is already in db
      if (await matchExists(matchId)) {
        console.log(`Match ${matchId} exists in the database, skipping...`.bg_red);
      } else {
        const home = await div.$('.event__participant--home');
        const away = await div.$('.event__participant--away');

        const homeTeam = await home.innerText();
        const awayTeam = await away.innerText();
        console.log(`${homeTeam} vs ${awayTeam} (ID: ${matchId})`);
        matchIds.push(matchId);
      }
    }
  }
  await browser.close();
  return matchIds;

};

export const buildStats = async (matchIds: string[], interval: number = random(1000, 3000)) => {
  if (matchIds.length === 0) {
    // stop when there's no more items to process
    console.log('ALL DONE');

    // if (exit) process.exit();

    return;
  }

  await match(matchIds[0]);

  /*
      ***** Use setTimeout inside a Promise to ensure asynchronous behavior INSTEAD of: 
      setTimeout(
        () => buildStats(matchIds.slice(1), interval), // wrap in an arrow function to defer evaluation
        interval
      );
   */
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), interval);
  });
  await buildStats(matchIds.slice(1), interval);
};