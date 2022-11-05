export interface ResultInterface {
  date: Date,
  competition: string | null,
  homeTeam: string,
  awayTeam: string,
  homeTeamScore: number,
  awayTeamScore: number,
  outcome: string,
  matchStats: MatchStatsInterface[],
};

export interface MatchStatsInterface {
  categoryStat: string,
  homeStat: string,
  awayStat: string,
};