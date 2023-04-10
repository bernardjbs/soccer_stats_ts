import { TeamFormRankInterface } from './../ts/interfaces.d';
const typedefs = `#graphql
    scalar Date

  input H2HStatsInput {
    date: Date
    competition: String
    homeTeam: String
    awayTeam: String
    homeTeamScore: Int
    awayTeamScore: Int
    outcome: String
    matchStats: [MatchStatsInput]
  }

  input MatchStatsInput {
    categoryStat: String
    homeStat: Int
    awayStat: Int
  }

  input TeamFormRankInput {
    homeTeamRank: Int
    awayTeamRank: Int
  }

  input FormStatsInput {
    homeForm: TeamFormRankInput
    awayForm: TeamFormRankInput
  }

  input ResultInput {
    homeScore: Int
    awayScore: Int
    matchStats: [MatchStatsInput]
  }

  type MatchStats {
    categoryStat: String
    homeStat: Int
    awayStat: Int
  }

  type H2HStats {
    date: Date
    competition: String
    homeTeam: String
    awayTeam: String
    homeTeamScore: Int
    awayTeamScore: Int
    outcome: String
    matchStats: [MatchStats]
  }

  type User {
    firstName: String
    lastName: String
    username: String
    phone: String
    address: String
  }
  
  type TeamFormRank {
    homeTeamRank: Int
    awayTeamRank: Int
  }

  type FormStats {
    homeForm: TeamFormRank
    awayForm: TeamFormRank
  }

  type Result {
    homeScore: Int
    awayScore: Int
    matchStats: [MatchStats]
  }

  type Match {
    _id: ID 
    matchId: String!
    matchStart: Date!
    competition: String!
    homeTeam: String!
    awayTeam: String!
    hotStat: String
    directH2hStats: [H2HStats]
    overallHomeStats: [H2HStats]
    overallAwayStats: [H2HStats]
    overallH2hStats: [H2HStats]
    homeStats: [H2HStats]
    awayStats: [H2HStats]
    formStats: FormStats
    result: Result
  }

  type Query {
    match(matchId: String): Match
    matches: [Match]
  }

  type Mutation {
  createMatch(
    matchId: String!
    matchStart: Date!
    competition: String!
    homeTeam: String!
    awayTeam: String!
    hotStat: String
    directH2hStats: [H2HStatsInput]
    overallHomeStats: [H2HStatsInput]
    overallAwayStats: [H2HStatsInput]
    overallH2hStats: [H2HStatsInput]
    homeStats: [H2HStatsInput]
    awayStats: [H2HStatsInput]   
    formStats: FormStatsInput 
    result: ResultInput
  ): Match
}
`;

export default typedefs;
