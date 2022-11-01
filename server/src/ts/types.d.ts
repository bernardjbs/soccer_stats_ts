import { ResultInterface } from './interfaces';

export type Match = {
  matchId: string;
  matchCompetition: string,
  matchStart: Date;
  homeTeam: string;
  awayTeam: string;
  hotStat: string;
  overallStats: OverallStats;
  homeStats: HomeStats;
  awayStats: AwayStats;
};

export type OverallStats = {
  overallHome_lastMatches: [ResultInterface];
  overallAway_lastMatches: [ResultInterface];
  overallH2H: [ResultInterface];
};

export type HomeStats = {
  overallHome_lastMatches: [ResultInterface];
  overallH2H: [ResultInterface];
};

export type AwayStats = {
  overallAway_lastMatches: [ResultInterface];
  overallH2H: [ResultInterface];
};
