import { useQuery } from "@apollo/client";
import React, { useState, useEffect } from "react";
import { QUERY_MATCHES } from "../utils/queries";
import { dateToStr } from "../utils/helpers";

export type IMatchTableProps = {};

const MatchTable: React.FC<IMatchTableProps> = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { loading, error, data } = useQuery(QUERY_MATCHES);

  if (loading) return <p>Loading...</p>;

  const recordsPerPage = 5;
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const npage = Math.ceil(data.matches.length / recordsPerPage);

  const numbers = [...Array(npage + 1).keys()].slice(1);
  return (
    <>
      <div className="flex flex-col border-2 border-blue-700 text-sm">
        <div className="flex flex-row font-bold text-gray-900 bg-yellow-400 border-b-2 border-gray-500">
          <div className="flex-1 min-w-[10%]">Date</div>
          <div className="flex-1 min-w-[16%]">Competition</div>
          <div className="flex-1">Teams</div>
          <div className="flex-1 max-w-[5%]">Score</div>
          <div className="flex-1 max-w-[5%]">Corners</div>
          <div className="flex-1 max-w-[5%]">Yellow Cards</div>
          <div className="flex-1 max-w-[5%]">BTTS</div>
          <div className="flex-1 max-w-[5%]">BT-Yellow</div>
          <div className="flex-1 max-w-[9%]">Direct-H2H</div>
          <div className="flex-1"></div>
        </div>
        {data.matches.map((match: any) => (
          <>
            <div className="flex flex-row">
              <div className="flex-1 min-w-[10%]">
                {dateToStr(match.matchStart)}
              </div>
              <div className="flex-1 min-w-[16%]">{match.competition}</div>
              <div className="flex-1">{match.homeTeam}</div>
              <div className="flex-1 max-w-[5%]">
                {match.result.homeScore || match.result.homeScore === 0
                  ? match.result.homeScore
                  : "-"}
              </div>
              <div className="flex-1 max-w-[5%]">
                {match.result.matchStats[0].homeStat ||
                match.result.matchStats[0].homeStat === 0
                  ? match.result.matchStats[0].homeStat
                  : "-"}
              </div>
              <div className="flex-1 max-w-[5%]">
                {match.result.matchStats[1]?.homeStat ||
                match.result.matchStats[1]?.homeStat === 0
                  ? match.result.matchStats[1].homeStat
                  : "-"}
              </div>
              <div className="flex-1 max-w-[5%] border-b-2">Y</div>
              <div className="flex-1 max-w-[5%] border-b-2">Y</div>
              <div className="flex-1 max-w-[9%] border-b-2">
                Manchester United
              </div>
              <div className="flex-1 border-b-2">Predicted</div>
            </div>
            <div className="flex flex-row text-gray-700 border-b-2 border-gray-300">
              <div className="flex-1 min-w-[10%]"></div>
              <div className="flex-1 min-w-[16%]"></div>
              <div className="flex-1">{match.awayTeam}</div>
              <div className="flex-1 max-w-[5%]">
                {match.result.awayScore || match.result.awayScore === 0
                  ? match.result.awayScore
                  : "-"}
              </div>
              <div className="flex-1 max-w-[5%]">
                {match.result.matchStats[0].awayStat ||
                match.result.matchStats[0].awayStat === 0
                  ? match.result.matchStats[0].awayStat
                  : "-"}
              </div>
              <div className="flex-1 max-w-[5%]">
                {match.result.matchStats[1]?.awayStat ||
                match.result.matchStats[1]?.awayStat === 0
                  ? match.result.matchStats[1].awayStat
                  : "-"}
              </div>
              <div className="flex-1 max-w-[5%]">
                {match.result.homeScore > 0 && match.result.awayScore > 0
                  ? "Y"
                  : "N"}
              </div>
              <div className="flex-1 max-w-[5%]">Y</div>
              <div className="flex-1 max-w-[9%]">Manchester United</div>
              <div className="flex-1">Outcome</div>
            </div>
          </>
        ))}
      </div>
      <div>
        <nav>
          <ul className="pagination flex flex-row">
            <li className="px-1">
              <button>Prev</button>
            </li>
            {numbers.map((n, i) => (
              <li className="page-item px-1" key={i}>
                <button>{n}</button>
              </li>
            ))}
            <li className="px-1">
              <button>Next</button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export { MatchTable };
