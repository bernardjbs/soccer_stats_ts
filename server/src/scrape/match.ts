import { getMatchIds, buildStats } from '@utils/scrape.js';
import { executeCommand } from '@utils/executeCommand.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
// const matchIds = await getMatchIds('today');
const matchIds = await getMatchIds('nextDay');
await buildStats(matchIds);

const scrapeDirectory = path.resolve(__dirname);
const saveResultsCwd = path.resolve(scrapeDirectory, '..', 'utils');
const saveResultsCmd = 'node saveResults.js';

const analyseCwd = path.resolve(scrapeDirectory, '/', 'analyse');
const analyseCmd = 'node index.js';

await executeCommand(saveResultsCmd, saveResultsCwd);

await executeCommand(analyseCmd, analyseCwd);
// await buildStats(['vLGa1vir']);
