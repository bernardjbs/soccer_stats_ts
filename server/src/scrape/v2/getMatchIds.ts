import playwright from 'playwright';
import { processEnv } from '@utils/processEnv.js';
import { myLeagues } from '@utils/myLeagues.js';
import { matchExists } from '@utils/scrapeController.js';
import { random, delay, strToDateTime } from '@utils/helpers.js';

import Colors from 'colors.ts';
Colors.enable();

export const getMatchIds = async (day: string) => {
  let matchIds = [];
  console.log('Selecting Competitions...'.green.bold);
  const browser = await playwright.chromium.launch({
    headless: false // setting this to true will not run the UI
  });

  const page = await browser.newPage();

  console.log(`scrape site: ${processEnv().SCRAPE_SOURCE_01}`);
  await page.goto(`${processEnv().SCRAPE_SOURCE_01}`);

  if (day === 'nextDay') {
    await page.locator('.calendar__navigation--tomorrow').click();
    await page.waitForSelector('.wclLeagueHeader');
  }

  const sportNameDivs = page.locator('.sportName.soccer > div');

  // await page.waitForTimeout(100000000)
  const sportNameDivCount = await sportNameDivs.count();

  let getMatchId: Boolean = false;

  for (let i = 0; i < sportNameDivCount; i++) {
    const eventHeaderClass = await sportNameDivs.nth(i).getAttribute('class');
    const eventMatchId = await sportNameDivs.nth(i).getAttribute('id');
    if (eventHeaderClass?.includes('wclLeagueHeader')) {
      const country = await sportNameDivs
        .nth(i)
        .locator('.event__titleBox .wclLeagueHeader__overline')
        .innerText();
      const competition = await sportNameDivs.nth(i).locator('.event__titleBox a').innerText();

      const myLeague = myLeagues.find(
        (league) => league.country === country && league.competition === competition
      );

      if (myLeague) {
        console.log(`\nSetting Match IDs for competition: ${country} ${competition}`.green.bold);
        getMatchId = true;
      } else {
        getMatchId = false;
      }
    }

    if (getMatchId && eventMatchId?.startsWith('g_1_')) {
      const matchId = eventMatchId.substring(4);

      // check if matchId is already in db
      if (await matchExists(matchId)) {
        console.log(`Match ${matchId} exists in the database, skipping...`.bg_red);
      } else {
        const homeTeam = await sportNameDivs.nth(i).locator('.event__participant--home').innerText();
        const awayTeam = await sportNameDivs.nth(i).locator('.event__participant--away').innerText();

        console.log(`${homeTeam} vs ${awayTeam} (ID: ${matchId})`);
        matchIds.push(matchId);
      }
    }
  }
  page.close();
  return matchIds;
};
