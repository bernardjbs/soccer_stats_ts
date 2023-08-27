import { getMatchIds, buildStats } from '../utils/scrape.js';

const matchIds = await getMatchIds('today');
// const matchIds = await getMatchIds('nextDay');

await buildStats(matchIds);

// await buildStats(['vLGa1vir']);
