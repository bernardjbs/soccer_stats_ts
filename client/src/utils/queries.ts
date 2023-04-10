import { getMatchIds } from "./../../../server/src/utils/scrape";
import { gql } from "@apollo/client";

export const QUERY_MATCH = gql`
  query getMatch($matchId: String) {
    match(matchId: $matchId) {
      awayTeam
      competition
      homeTeam
      matchId
      matchStart
    }
  }
`;

export const QUERY_MATCHES = gql`
  {
    matches {
      matchId
      matchStart
      competition
      homeTeam
      awayTeam
      result {
        homeScore
        awayScore
        matchStats {
          categoryStat
          homeStat
          awayStat
        }
      }
    }
  }
`;
