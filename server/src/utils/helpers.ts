import playwright from 'playwright';
import { MatchStatsInterface } from '../ts/interfaces';

function delay(time: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

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

    const date = await match.locator('.h2h__date').innerText();
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
    if (statsElCount < 1) break;

    await matchSummary.locator('a[href="#/match-summary/match-statistics"]').click();
    await delay(1000);
    const statsCategory = matchSummary.locator('.stat__categoryName');
    const statsHome = matchSummary.locator('.stat__homeValue');
    const statsAway = matchSummary.locator('.stat__awayValue');
    const statsCount = await statsCategory.count();
    const above = matchSummary.locator('div:right-of(.stat_categoryName)');

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
// export default { strToDateTime, results };
