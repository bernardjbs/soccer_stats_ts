export interface StatsInterface {
  statsHome: string;
  statsAway: string;
  statsCategory: string;
}

export interface ResultInterface {
  date: Date;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamScore: number;
  awayTeamScore: number;
  outcome: string;
  stats: StatsInterface[];
}

export interface MatchStatsInterface {
  categoryStat: string;
  homeStat: string;
  awayStat: string;
}
