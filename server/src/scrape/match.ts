import { getMatchIds, buildStats} from '@utils/scrape.js';
import { executeCommand } from '@utils/executeCommand.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path variables for saveResult and analyse
const scrapeDirectory = path.resolve(__dirname);
const saveResultsCwd = path.resolve(scrapeDirectory, '..', 'utils');
const saveResultsCmd = 'node saveResults.js';

const analyseCwd = path.resolve(scrapeDirectory, 'analyse');
const analyseCmd = 'node index.js';

/**
 * SCRAPE
 */
// const matchIds = await getMatchIds('today');
// const matchIds = await getMatchIds('nextDay');
// await buildStats(matchIds);
await buildStats(['2LMzZvkE']);

/**
 * SAVE RESULTS
 */
await executeCommand(saveResultsCmd, saveResultsCwd);

/**
 * ANALYSE MATCHES
 */
await executeCommand(analyseCmd, analyseCwd);

process.exit();

