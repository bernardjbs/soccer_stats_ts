import { ResultInterface } from '../../ts/interfaces';
import { Match } from '../../ts/types';
import { MongoClient } from 'mongodb';

import { jsonConsole } from '../../utils/helpers.js';
import Colors from 'colors.ts';
Colors.enable();

import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, '../../../../.env')
});

const client = new MongoClient(process.env.MONGODB_URI!);
const DB_NAME = process.env.DB_NAME;
const MATCHES_COLLECTION = process.env.MATCHES_COLLECTION;

const getMatches = async () => {
  const database = client.db(DB_NAME);
  const matchesCollection = database.collection(MATCHES_COLLECTION!);
  const matches = await matchesCollection
    .find({ matchStart: { $gt: new Date() } })
    .sort({ matchStart: 1 })
    .toArray()
    .then((res) => {
      const json = JSON.parse(JSON.stringify(res));
      return json;
    });
  return matches;
};

export const analyseMatches = async () => {
  try {
    const matches: Match[] = await getMatches();
    matches.map((match: Match) => {
      console.log(`\n${match.homeTeam} VS ${match.awayTeam}`.red);
      analyseBTTS(match);
      analyseOver(match);
      analyseUnder(match);
      analyseWinner(match);
    });
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
};

const getTotalAvgGoals = (match: Match) => {
  const calcAvgGoals = (stats: ResultInterface[]): number => {
    const statCount = stats.length;
    let totalGoals = 0;
    stats.map((stat) => {
      totalGoals = totalGoals + (stat.homeTeamScore + stat.awayTeamScore);
    });
    return totalGoals / statCount;
  };
  const homeAvgGoals = calcAvgGoals(match.homeStats);
  const awayAvgGoals = calcAvgGoals(match.awayStats);
  const overallHomeAvgGoals = calcAvgGoals(match.overallHomeStats);
  const overallAwayAvgGoals = calcAvgGoals(match.overallAwayStats);
  const overallH2hAvgGoals = calcAvgGoals(match.overallH2hStats);
  const directH2hAvgGoals = calcAvgGoals(match.directH2hStats);

  let allStatsCount: number = 6;
  if (match.directH2hStats.length < 1) {
    allStatsCount = 5;
  }

  const totalAvgGoals = (homeAvgGoals + awayAvgGoals + overallHomeAvgGoals + overallAwayAvgGoals + overallH2hAvgGoals + directH2hAvgGoals) / allStatsCount;
  return totalAvgGoals;
};

// Function to calculate head to head winners
const calcH2hWinner = (stats: ResultInterface[]) => {
  let homeWinCount = 0;
  let awayWinCount = 0;
  stats.map((stat) => {
    if (stat.homeTeamScore > stat.awayTeamScore) {
      homeWinCount = homeWinCount + 1;
    } else if (stat.homeTeamScore < stat.awayTeamScore) {
      awayWinCount = awayWinCount + 1;
    }
  });
  if (homeWinCount > 3) {
    return {
      team: 'home',
      score: 1
    };
  } else if (awayWinCount > 3) {
    return {
      team: 'away',
      score: 1
    };
  } else {
    return {
      score: 0
    };
  }
};

// Function to calculate analysis types
const calcAnalysis = (type: string, stats: ResultInterface[]) => {
  let count = 0;
  stats.map((stat) => {
    if (type == 'calcBTTS') {
      if (stat.homeTeamScore > 0 && stat.awayTeamScore > 0) {
        count = count + 1;
      }
    } else if (type == 'calcOver') {
      if (stat.homeTeamScore + stat.awayTeamScore > 2) {
        count = count + 1;
      }
    } else if (type == 'calcUnder') {
      if (stat.homeTeamScore + stat.awayTeamScore < 3) {
        count = count + 1;
      }
    } else {
      console.log('Could not perform analysis'.red);
    }
  });
  if (count > 3) {
    return 1;
  } else {
    return 0;
  }
};

// Function to analyse Both team to score
const analyseBTTS = (match: Match) => {
  const homeBTTS = calcAnalysis('calcBTTS', match.homeStats);
  const awayBTTS = calcAnalysis('calcBTTS', match.awayStats);
  const overallHomeBTTS = calcAnalysis('calcBTTS', match.overallHomeStats);
  const overallAwayBTTS = calcAnalysis('calcBTTS', match.overallAwayStats);
  const overallH2hBTTS = calcAnalysis('calcBTTS', match.overallH2hStats);
  const directH2hBTTS = calcAnalysis('calcBTTS', match.directH2hStats);
  const totalBTTS_score = homeBTTS + awayBTTS + overallHomeBTTS + overallAwayBTTS + overallH2hBTTS + directH2hBTTS;
  if (homeBTTS > 0) console.log(`Home Team BTTS is at least 4/5`.magenta);
  if (awayBTTS > 0) console.log(`Away Team BTTS is at least 4/5`.magenta);
  if (overallHomeBTTS > 0) console.log(`Overall Home BTTS is at least 4/5`.magenta);
  if (overallAwayBTTS > 0) console.log(`Overall Away BTTS is at least 4/5`.magenta);
  if (overallH2hBTTS > 0) console.log(`Overall Head To Head BTTS is at least 4/5`.magenta);
  if (directH2hBTTS > 0) console.log(`Direct H2H BTTS is at least 4/5`.cyan);
  if (totalBTTS_score > 3) console.log(`TOTAL BTTS score is at least 4/6`.bg_magenta);
};

// Function to analyse Over 2.5 Goals
const analyseOver = (match: Match) => {
  const homeOver = calcAnalysis('calcOver', match.homeStats);
  const awayOver = calcAnalysis('calcOver', match.awayStats);
  const overallHomeOver = calcAnalysis('calcOver', match.overallHomeStats);
  const overallAwayOver = calcAnalysis('calcOver', match.overallAwayStats);
  const overallH2hOver = calcAnalysis('calcOver', match.overallH2hStats);
  const directH2hOver = calcAnalysis('calcOver', match.directH2hStats);
  const totalAvgGoals = getTotalAvgGoals(match);
  const totalOverScore = homeOver + awayOver + overallHomeOver + overallAwayOver + overallH2hOver + directH2hOver;
  if (totalOverScore > 3 && totalAvgGoals > 2.5) console.log(`Over 2.5 score is at least 4/6 with Average ${totalAvgGoals.toFixed(2)}`.green);
};

// Function to analyse Under 2.5 Goals
const analyseUnder = (match: Match) => {
  const homeOver = calcAnalysis('calcUnder', match.homeStats);
  const awayOver = calcAnalysis('calcUnder', match.awayStats);
  const overallHomeOver = calcAnalysis('calcUnder', match.overallHomeStats);
  const overallAwayOver = calcAnalysis('calcUnder', match.overallAwayStats);
  const overallH2hOver = calcAnalysis('calcUnder', match.overallH2hStats);
  const directH2hOver = calcAnalysis('calcUnder', match.directH2hStats);
  const totalAvgGoals = getTotalAvgGoals(match);
  const totalUnderScore = homeOver + awayOver + overallHomeOver + overallAwayOver + overallH2hOver + directH2hOver;
  if (totalUnderScore > 3 && totalAvgGoals < 2.5) console.log(`Under 2.5 score is at least 4/6 with Average ${totalAvgGoals.toFixed(2)}`.yellow.bold);
};

// Function to analyse head to head winners
const analyseWinner = (match: Match) => {
  // Winners
  const overallH2hWinner = calcH2hWinner(match.overallH2hStats);
  if (overallH2hWinner.score > 0 && overallH2hWinner.team === 'home') console.log(`OVERALL - ${match.homeTeam} WON ${match.awayTeam} at least 4/5 times`.blue);
  if (overallH2hWinner.score > 0 && overallH2hWinner.team === 'away') console.log(`OVERALL - ${match.awayTeam} WON ${match.homeTeam} at least 4/5 times`.blue);

  const H2H_WINNER_score = calcH2hWinner(match.directH2hStats);
  if (H2H_WINNER_score.score > 0 && H2H_WINNER_score.team === 'home') console.log(`DIRECT H2H - ${match.homeTeam} WON ${match.awayTeam} at least 4/5 times`.bg_green);
  if (H2H_WINNER_score.score > 0 && H2H_WINNER_score.team === 'away') console.log(`DIRECT H2H - ${match.awayTeam} WON ${match.homeTeam} at least 4/5 times`.bg_green);
};
