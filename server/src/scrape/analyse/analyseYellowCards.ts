import { dateToStr } from '@utils/helpers.js';
import { H2hInterface } from '@ts/interfaces.js';
import { MatchType } from '@ts/types.js';
import { MongoClient } from 'mongodb';
import { processEnv } from '@utils/processEnv.js';

const client = new MongoClient(processEnv().MONGODB_URI!);
const DB_NAME = processEnv().DB_NAME;
const MATCHES_COLLECTION = processEnv().MATCHES_COLLECTION;
import Colors from 'colors.ts';
Colors.enable();

let yellowHomeScore = 0;
let yellowAwayScore = 0;

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

// Function to calculate yellow cards
const calcYellow = (stats: H2hInterface[], type: String) => {
  let homeYellowScore = 0;
  let awayYellowScore = 0;

  const yellowCards = stats
    .map((stat) => stat.matchStats)
    .flat()
    .filter((category) => category.categoryStat === 'Yellow Cards')
    .flat();

  if (yellowCards.length > 0) {
    const homeYellows = yellowCards.map((obj) => obj.homeStat);
    const awayYellows = yellowCards.map((obj) => obj.awayStat);

    homeYellowScore = homeYellows.reduce((a, b) => a + b);
    awayYellowScore = awayYellows.reduce((a, b) => a + b);
  }

  return {
    type: type,
    home: homeYellowScore,
    away: awayYellowScore
  };
};

// Function to calculate yellow cards
const analyseYellow = (match: MatchType) => {
  const homeYellow = calcYellow(match.homeStats, 'homeStats');
  const awayYellow = calcYellow(match.awayStats, 'awayStats');
  const directYellow = calcYellow(match.directH2hStats, 'directStats');
  
  yellowHomeScore = 0
  yellowAwayScore = 0

  // Who received more cards?
  const homeTotal = homeYellow.home + directYellow.home;
  const awayTotal = awayYellow.away + directYellow.away;

  if (homeTotal > awayTotal) {
    yellowHomeScore++;
  } else {
    yellowAwayScore++;
  }

  if (homeYellow.home > homeYellow.away) {
    yellowHomeScore++;
  }

  if (awayYellow.away > awayYellow.home) {
    yellowAwayScore++;
  }
  if (directYellow.home > directYellow.away) {
    yellowHomeScore++;
  } else {
    yellowAwayScore++;
  }

  let message;
  if (yellowHomeScore == 3 && yellowAwayScore == 0) {
    message = 'HOME team received more cards'.magenta; 
  } else if (yellowAwayScore == 3 && yellowHomeScore == 0) {
    message = 'AWAY team received more cards'.blue; 
  }
  return message
};

// MAIN FUNCTION - Analyse the matches
export const analyseMatches = async () => {
  try {
    const matches: MatchType[] = await getMatches();
    const hasStats = false;
    
    matches.map((match: MatchType) => {
      const yellowResults = analyseYellow(match) ?? '';
      if (yellowResults) {
        console.log(`${match.competition} - ${match.homeTeam} VS ${match.awayTeam} | STARTING ${dateToStr(match.matchStart)}`.red);
        console.log(yellowResults.bold)
      }
    });
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
};

analyseMatches();
