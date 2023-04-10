import React from 'react';
import { useLazyQuery } from "@apollo/client";
import { QUERY_MATCH } from '../utils/queries';

export type IMatchIdProps = {
  
}

const MatchId: React.FC<IMatchIdProps> = () => {
  const [getMatch, { data }] = useLazyQuery(QUERY_MATCH);
  const handleClick = () => { 
    getMatch({ variables: { matchId: "29OTqmCA" } }).then((match) => {
      console.log(match);
    });
  }
  return (
    <div className='m-2'>
      <button className='bg-blue-500 p-2 rounded-md' onClick={() => handleClick()}>
        Get Match Id
      </button>
    </div>
  );
}

export { MatchId };