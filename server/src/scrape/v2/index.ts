import { getMatchIds } from '@scrape/v2/getMatchIds.js';

const matchIds = await getMatchIds('nextDay');
console.log(matchIds);
