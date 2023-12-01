import { deleteMatches } from './scrapeController.js';

const matchIds = ['CACYGDS4'];

await deleteMatches(matchIds);
process.exit();