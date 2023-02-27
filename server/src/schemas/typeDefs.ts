import { gql } from 'apollo-server-express';

const typedefs = gql`
  scalar Date

  type MatchStats {
    categoryStat: String
    homeStat: String
    awayStat: String
  }

  type H2HStats {
    date: Date
    competition: String
    homeTeam: String
    awayTeam: String
    homeTeamScore: Int
    awayTeamScore: Int
    outcome: String
    matchStats: MatchStats
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
    homeScore: String
    awayScore: String
    matchStats: MatchStats
  }

  type Match {
    _id: ID 
    matchId: String!
    matchStart: Date!
    competition: String!
    homeTeam: String!
    awayTeam: String!
    hotStat: String
    overallHomeStats: [H2HStats]
    overallAwayStats: [H2HStats]
    homeStats: [H2HStats]
    awayStats: [H2HStats]
    directH2hStats: [H2HStats]
    formStats: FormStats
    result: Result
  }

  type Query {
    match(matchId: String!): Match
    matches: [Match]
    matchesFilter(filter: String): [Match]
    matchOrderBy(orderBy: String): [Match]
  }
`;

export default typedefs;
