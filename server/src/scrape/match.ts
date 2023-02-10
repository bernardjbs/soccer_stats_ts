import { getMatchIds, buildStats } from '../utils/scrape.js';

// const matchIds = await getMatchIds('today');
const matchIds = await getMatchIds('nextDay');

await buildStats(matchIds);

// await buildStats([
//   '8dr39Uqo',
//   'fRiVT1Fk',
//   'Oz9kBMGg',
//   'b7rwpwM7',
//   'Gb3HYcW9',
//   'AiNQTJjN',
//   'pERW1nvE',
//   'xWlS4nIq',
// ]);
