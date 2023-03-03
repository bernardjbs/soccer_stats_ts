import { Schema, model } from 'mongoose';
// import { MatchType } from '../ts/types';

interface MatchStatsInterface {
  categoryStat: string;
  homeStat: number;
  awayStat: number;
}

interface H2hInterface {
  date: Date;
  competition: string | null;
  homeTeam: string;
  awayTeam: string;
  homeTeamScore: number;
  awayTeamScore: number;
  outcome: string;
  matchStats: MatchStatsInterface[];
}

interface TeamFormRankInterface {
  homeTeamRank: number;
  awayTeamRank: number;
}

type MatchType = {
  matchId: string;
  matchStart: Date;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  hotStat: string;
  directH2hStats: H2hInterface[];
  overallHomeStats: H2hInterface[];
  overallAwayStats: H2hInterface[];
  overallH2hStats: H2hInterface[];
  homeStats: H2hInterface[];
  awayStats: H2hInterface[];
  formStats: {
    homeForm: TeamFormRankInterface;
    awayForm: TeamFormRankInterface;
  };
  result: {
    homeScore: Number;
    awayScore: Number;
    matchStats: [MatchStatsInterface]
  };
};

const matchSchema = new Schema<MatchType>(
  {
    matchId: { type: String, required: true },
    matchStart: { type: Date, required: true },
    competition: { type: String, required: true },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    hotStat: { type: String },
    directH2hStats: [{ type: Object }],
    overallHomeStats: [{ type: Object }],
    overallAwayStats: [{ type: Object }],
    overallH2hStats: [{ type: Object }],
    homeStats: [{ type: Object }],
    awayStats: [{ type: Object }],
    formStats: {
      homeForm: { type: Object },
      awayForm: { type: Object }
    },
    result: {
      homeScore: Number,
      awayScore: Number,
      matchStats: [{ type: Object }]
    }
  },
  {
    collection: 'matches_apollo_test'
    // collection: 'matches_test'
  }
);


const Match = model('match', matchSchema);

export default Match;
