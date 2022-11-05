import { ResultInterface } from './interfaces';

export type Match = {
  matchId: string,
  matchStart: Date,
  homeTeam: string,
  awayTeam: string,
  hotStat: string,
  overallHomeStats: ResultInterface[],
  overallAwayStats: ResultInterface[],
  overallH2hStats: ResultInterface[],
  homeStats: ResultInterface[],
  awayStats: ResultInterface[],
  directH2hStats: ResultInterface[],
}