import { H2hInterface, TeamFormRankInterface } from './interfaces';

export type Match = {
  matchId: string,
  matchStart: Date,
  competition: string,
  homeTeam: string,
  awayTeam: string,
  hotStat: string,
  overallHomeStats: H2hInterface[],
  overallAwayStats: H2hInterface[],
  overallH2hStats: H2hInterface[],
  homeStats: H2hInterface[],
  awayStats: H2hInterface[],
  directH2hStats: H2hInterface[],
  formStats: {
    homeForm: TeamFormRankInterface, 
    awayForm: TeamFormRankInterface
  }
};