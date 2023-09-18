import { H2hInterface } from '@ts/interfaces';
import { MatchType } from '@ts/types';
import { MongoClient } from 'mongodb';

import { dateToStr, jsonConsole } from '@utils/helpers.js';
import Colors from 'colors.ts';
Colors.enable();

import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import { json } from 'stream/consumers';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, '../../../../.env')
});

const client = new MongoClient(process.env.MONGODB_URI!);
const DB_NAME = process.env.DB_NAME;
const MATCHES_COLLECTION = process.env.MATCHES_COLLECTION;

// Fetch the matches to be analysed from database
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

const getTotalAvgGoals = (match: MatchType) => {
  // jsonConsole(match.homeTeam, 4)
  const calcAvgGoals = (stats: H2hInterface[]): number => {
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
const calcH2hWinner = (stats: H2hInterface[], matchHomeTeam: string, matchAwayTeam: string) => {
  let homeWinCount = 0;
  let awayWinCount = 0;
  stats.map((stat) => {
    if (matchHomeTeam == stat.homeTeam && stat.homeTeamScore > stat.awayTeamScore) {
      homeWinCount = homeWinCount + 1;
    } else if (matchHomeTeam == stat.awayTeam && stat.homeTeamScore < stat.awayTeamScore) {
      homeWinCount = homeWinCount + 1;
    } else if (matchAwayTeam == stat.homeTeam && stat.homeTeamScore > stat.awayTeamScore) {
      awayWinCount = awayWinCount + 1;
    } else if (matchAwayTeam == stat.awayTeam && stat.homeTeamScore < stat.awayTeamScore) {
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
const calcAnalysis = (type: string, stats: H2hInterface[]) => {
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

// Function to calculate yellow cards
const calcYellow = (stats: H2hInterface[]) => {
  let count: number = 0;
  let cardCount: number = 0;
  let btYellowCount: number = 0;
  stats.map((stat) => {
    if (stat.matchStats.length > 0) {
      const matchStats = stat.matchStats;
      matchStats.map((matchStat) => {
        if (matchStat.categoryStat === 'Yellow Cards') {
          count = count + 1;
          cardCount = cardCount + (matchStat.homeStat + matchStat.awayStat);
          if (matchStat.homeStat > 0 && matchStat.awayStat > 0) {
            btYellowCount = btYellowCount + 1;
          }
        }
      });
    }
  });
  const avgYellow = cardCount / count;
  const pcBTyellow = (btYellowCount / count) * 100;
  return {
    avgYellow: avgYellow,
    pcBTyellow: pcBTyellow
  };
};

// Function to calculate corners
const calcCorners = (stats: H2hInterface[]) => {
  let count: number = 0;
  let cornerCount: number = 0;
  stats.map((stat) => {
    if (stat.matchStats.length > 0) {
      const matchStats = stat.matchStats;
      matchStats.map((matchStat) => {
        if (matchStat.categoryStat === 'Corner Kicks') {
          count = count + 1;
          cornerCount = cornerCount + (matchStat.homeStat + matchStat.awayStat);
        }
      });
    }
  });
  const avgCorner = cornerCount / count;
  return { avgCorner: avgCorner };
};

// Function to analyse Both team to score
const analyseBTTS = (match: MatchType) => {
  const homeBTTS = calcAnalysis('calcBTTS', match.homeStats);
  const awayBTTS = calcAnalysis('calcBTTS', match.awayStats);
  const overallHomeBTTS = calcAnalysis('calcBTTS', match.overallHomeStats);
  const overallAwayBTTS = calcAnalysis('calcBTTS', match.overallAwayStats);
  const overallH2hBTTS = calcAnalysis('calcBTTS', match.overallH2hStats);
  const directH2hBTTS = calcAnalysis('calcBTTS', match.directH2hStats);
  const totalBTTS_score = homeBTTS + awayBTTS + overallHomeBTTS + overallAwayBTTS + overallH2hBTTS + directH2hBTTS;

  let btts: boolean = false;
  totalBTTS_score > 3 ? (btts = true) : (btts = false);
  return btts;
};

// Function to analyse Over 2.5 Goals
const analyseOver = (match: MatchType) => {
  const homeOver = calcAnalysis('calcOver', match.homeStats);
  const awayOver = calcAnalysis('calcOver', match.awayStats);
  const overallHomeOver = calcAnalysis('calcOver', match.overallHomeStats);
  const overallAwayOver = calcAnalysis('calcOver', match.overallAwayStats);
  const overallH2hOver = calcAnalysis('calcOver', match.overallH2hStats);
  const directH2hOver = calcAnalysis('calcOver', match.directH2hStats);
  const totalAvgGoals = getTotalAvgGoals(match);

  let over = {
    analyse: false,
    totalAvgGoals: totalAvgGoals
  };

  const totalOverScore = homeOver + awayOver + overallHomeOver + overallAwayOver + overallH2hOver + directH2hOver;

  if (totalOverScore > 3 && totalAvgGoals > 2.5) {
    over.analyse = true;
  }

  return over;
};

// Function to analyse Under 2.5 Goals
const analyseUnder = (match: MatchType) => {
  const homeOver = calcAnalysis('calcUnder', match.homeStats);
  const awayOver = calcAnalysis('calcUnder', match.awayStats);
  const overallHomeOver = calcAnalysis('calcUnder', match.overallHomeStats);
  const overallAwayOver = calcAnalysis('calcUnder', match.overallAwayStats);
  const overallH2hOver = calcAnalysis('calcUnder', match.overallH2hStats);
  const directH2hOver = calcAnalysis('calcUnder', match.directH2hStats);
  const totalAvgGoals = getTotalAvgGoals(match);
  const totalUnderScore = homeOver + awayOver + overallHomeOver + overallAwayOver + overallH2hOver + directH2hOver;

  let under = {
    analyse: false,
    totalAvgGoals: totalAvgGoals
  };

  if (totalUnderScore > 3 && totalAvgGoals < 2.5) {
    under.analyse = true
  } 

  return under;
};

// Function to analyse head to head winners
const analyseWinner = (match: MatchType) => {
  // Winners
  let winner = {
    overallHome: false,
    overallAway: false,
    directH2hHome: false,
    directH2hAway: false
  };

  const overallH2hWinner = calcH2hWinner(match.overallH2hStats, match.homeTeam, match.awayTeam);

  if (overallH2hWinner.score > 0 && overallH2hWinner.team === 'home') {
    winner.overallHome = true
  } else if (overallH2hWinner.score > 0 && overallH2hWinner.team === 'away') {
    winner.overallAway = true
  };
    
  // overallH2hWinner.score > 0 && overallH2hWinner.team === 'home' ? (winner.overallHome = true) : (winner.overallAway = false);
  // overallH2hWinner.score > 0 && overallH2hWinner.team === 'away' ? (winner.overallHome = false) : (winner.overallAway = true);

  const H2H_WINNER_score = calcH2hWinner(match.directH2hStats, match.homeTeam, match.awayTeam);

  if (H2H_WINNER_score.score > 0 && H2H_WINNER_score.team === 'home') {
    winner.directH2hHome = true
  } else if (H2H_WINNER_score.score > 0 && H2H_WINNER_score.team === 'away') { 
    winner.directH2hAway = true
  } ;
    // H2H_WINNER_score.score > 0 && H2H_WINNER_score.team === 'home' ? (winner.directH2hHome = true) : (winner.directH2hAway = false);
    // H2H_WINNER_score.score > 0 && H2H_WINNER_score.team === 'away' ? (winner.directH2hHome = false) : (winner.directH2hAway = true);

  return winner;
};

// Function to calculate yellow cards
const analyseYellow = (match: MatchType) => {
  const homeYellow = calcYellow(match.homeStats);
  const awayYellow = calcYellow(match.awayStats);
  const overallHomeYellow = calcYellow(match.overallHomeStats);
  const overallAwayYellow = calcYellow(match.overallAwayStats);
  const overallH2hYellow = calcYellow(match.overallH2hStats);
  const directH2hYellow = calcYellow(match.directH2hStats);

  const pcBTyellow = (homeYellow.pcBTyellow + awayYellow.pcBTyellow + overallHomeYellow.pcBTyellow + overallAwayYellow.pcBTyellow + overallH2hYellow.pcBTyellow + directH2hYellow.pcBTyellow) / 6;
  const avgYellow = (homeYellow.avgYellow + awayYellow.avgYellow + overallHomeYellow.avgYellow + overallAwayYellow.avgYellow + overallH2hYellow.avgYellow + directH2hYellow.avgYellow) / 6;

  let yellow = {
    analyse: false,
    percentage: pcBTyellow, 
    avgYellow: avgYellow
  };

  if (pcBTyellow > 90) {
    yellow.analyse = true;
  }

  return yellow;
};

// Function to calculate corners
const analyseCorner = (match: MatchType) => {
  const homeCorners = calcCorners(match.homeStats).avgCorner;
  const awayCorners = calcCorners(match.awayStats).avgCorner;
  const overallHomeCorners = calcCorners(match.overallHomeStats).avgCorner;
  const overallAwayCorners = calcCorners(match.overallAwayStats).avgCorner;
  const overallH2hCorners = calcCorners(match.overallH2hStats).avgCorner;
  const directH2hCorners = calcCorners(match.directH2hStats).avgCorner;

  const avgCorner = (homeCorners + awayCorners + overallHomeCorners + overallAwayCorners + overallH2hCorners + directH2hCorners) / 6;

  let corner = {
    analyse: false,
    avgCorner: avgCorner
  };

  if (avgCorner > 0) {
    corner.analyse = true;
  } 

  return corner;
};

// Function to analyse which team has more cards
const analyseTeamCards = (match: MatchType) => {};

// Function to analyse home and away form
// const analyseForm = (match: Match) => {
//   if (match.formStats) {
//     const homeForm = match.formStats.homeForm;
//     const awayForm = match.formStats.awayForm;

//     let homeTeamScore: number = 0;
//     let awayTeamScore: number = 0;

//     homeForm.homeTeamRank < homeForm.awayTeamRank ? homeTeamScore++ : awayTeamScore++;
//     awayForm.homeTeamRank < awayForm.awayTeamRank ? homeTeamScore++ : awayTeamScore++;

//     if (homeTeamScore == 2) {
//       console.log(`${match.homeTeam} IS IN FORM`.yellow.bg_blue.bold);
//     } else if (awayTeamScore == 2) {
//       console.log(`${match.awayTeam} IS IN FORM`.yellow.bg_blue.bold);
//     }
//   }
// };

// MAIN FUNCTION - Analyse the matches
export const analyseMatches = async () => {
  try {
    const matches: MatchType[] = await getMatches();
    matches.map((match: MatchType) => {
      
      const winner = analyseWinner(match);
      const btts = analyseBTTS(match);
      const over = analyseOver(match);
      const under = analyseUnder(match);
      const yellow = analyseYellow(match);
      const corner = analyseCorner(match);

      if ( winner.directH2hHome || winner.directH2hAway || winner.overallHome || winner.overallAway || btts || over.analyse || under.analyse || yellow.analyse || corner.analyse ){
        console.log(`\n${match.competition} - ${match.homeTeam} VS ${match.awayTeam} | STARTING ${dateToStr(match.matchStart)}`.red);

        if (winner.directH2hHome) console.log(`DIRECT H2H - ${match.homeTeam} WON ${match.awayTeam} at least 4/5 times`.bg_green);
        if (winner.directH2hAway) console.log(`DIRECT H2H - ${match.awayTeam} WON ${match.homeTeam} at least 4/5 times`.bg_green);
        if (winner.overallHome) console.log(`OVERALL - ${match.homeTeam} WON ${match.awayTeam} at least 4/5 times`.blue);
        if (winner.overallAway) console.log(`OVERALL - ${match.awayTeam} WON ${match.homeTeam} at least 4/5 times`.blue);

        if (btts) console.log(`TOTAL BTTS score is at least 4/6`.bg_magenta);
        if (over.analyse) console.log(`Over 2.5 score is at least 4/6 with Average ${over.totalAvgGoals.toFixed(2)}`.green);
        if (under.analyse) console.log(`Under 2.5 score is at least 4/6 with Average ${under.totalAvgGoals.toFixed(2)}`.yellow.bold);
        if (yellow.analyse) console.log(`Percentage BT Yellow: ${yellow.percentage.toFixed(2)}% - Average Yellow Cards: ${yellow.avgYellow.toFixed(2)}`.yellow.bold);
        if (corner.analyse) console.log(`Average corners: ${corner.avgCorner.toFixed(2)}`.cyan.bold);
      }
    });
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
};
