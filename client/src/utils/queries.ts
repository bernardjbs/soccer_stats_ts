import { gql } from "@apollo/client";

export const QUERY_MATCH = gql`
  {
    query getMatch {
        matchId
        matchStart
        competition
        homeTeam
        awayTeam 
    }
  }
`;
