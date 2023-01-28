import playwright from 'playwright';
import { MatchStatsInterface, H2hInterface } from '../ts/interfaces';
import util from 'util';
import Colors from 'colors.ts';
import { random, delay, strToDateTime } from '../utils/helpers.js';
import { Match } from '../ts/types';
import { saveMatch, matchExists } from './scrapeController.js';
import { myLeagues } from './myLeagues.js';

import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, '../../../.env')
});

Colors.enable();

const match = async (matchId: string) => {
  const browser = await playwright.chromium.launch({
    headless: false // setting this to true will not run the UI
  });

  const page = await browser.newPage();
  await page.goto(`https://www.flashscore.com/match/${matchId}/#/match-summary`);

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
  let match: Match = {
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
    directH2hStats: directH2hStats
  };
  // console.log(util.inspect(match, { colors: true, depth: 4 }));
  console.log('Save to Database');
  saveMatch(match);
  await browser.close();
};

const getStats = async (matches: playwright.Locator, page: playwright.Page, lastMatchesType: string) => {
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
    
    if (await homeTeamScoreCount == 0 || await awayTeamScoreCount == 0) continue;

    const homeTeamScore = await matchCollection.nth(i).locator('.h2h__result').locator('span').nth(0).innerText();
    const awayTeamScore = await matchCollection.nth(i).locator('.h2h__result').locator('span').nth(1).innerText();    


    if ((await matchCollection.nth(i).locator('.wld').count()) > 0) {
      outcome = await matchCollection.nth(i).locator('.wld').innerText();
    } else {
      outcome = 'N/A';
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

const setFavMatches = async (eventHeader: playwright.Locator) => {
  console.log('Selecting Competitions...'.green.bold);
  await delay(2000);
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
    const nextDay = page.locator('.calendarCont').locator('div').nth(0).locator('button[title="Next day"]');
    await nextDay.click();
  }

  const sportNameDivs = page.locator('.sportName').locator('div');
  const SNDivsCount = await sportNameDivs.count();
  delay(5000);

  let matchIds = [];
  const eventHeader = page.locator("xpath=//div[contains(@class, 'event__header')] ");

  // Set my matches to favourites
  await setFavMatches(eventHeader);

  console.log('Collecting match ids...'.green.bold);

  // Loop through sportDivs and get ids from favourites
  let star_class;
  for (let i = 0; i < SNDivsCount; i++) {
    let matchId = await sportNameDivs.nth(i).getAttribute('id');
    const eventScore = sportNameDivs.nth(i).locator('div[class="event__score event__score--home"]');

    const starCount = await sportNameDivs.nth(i).locator('div').nth(0).locator('span').locator('svg').count();

    if (starCount > 0) {
      star_class = await sportNameDivs.nth(i).locator('div').nth(0).locator('span').locator('svg').getAttribute('class');
      const country = await sportNameDivs.nth(i).locator('.event__title--type').innerText();
      const league = await sportNameDivs.nth(i).locator('.event__title--name').innerText();
      const competition = `${country} - ${league}`;
      console.log(`\nSetting Match IDs for competition: ${competition}`.green.bold);
    }

    if (star_class === 'star-ico eventStar eventStar--active' && matchId && ((await eventScore.count()) == 0 || (await eventScore.innerText()) === '-')) {
      // Removing first 4 characters from the id string
      matchId = matchId.substring(4);

      // Check if matchId exists in database
      if (await matchExists(matchId)) {
        console.log(`Match ${matchId} exists in the database, skipping...`.bg_red);
      } else {
        const homeTeam = await sportNameDivs.nth(i).locator('.event__participant--home').innerText();
        const awayTeam = await sportNameDivs.nth(i).locator('.event__participant--away').innerText();
        console.log(`${homeTeam} vs ${awayTeam} (ID: ${matchId})`);
        matchIds.push(matchId);
      }
    } else if (star_class === 'star-ico eventStar ') {
      break;
    }
  }
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
  await match(matchIds[0]);

  setTimeout(
    () => buildStats(matchIds.slice(1), interval), // wrap in an arrow function to defer evaluation
    interval
  );
};
