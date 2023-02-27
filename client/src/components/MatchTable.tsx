import React from "react";

export type IMatchTableProps = {};

const MatchTable: React.FC<IMatchTableProps> = ({}) => {
  return (
    <div className="flex flex-col border-2 border-blue-700">
      <div className="flex flex-row font-bold text-gray-900 bg-yellow-400 border-b-2 border-gray-500">
        <div className="flex-1">Date</div>
        <div className="flex-1">Competition</div>
        <div className="flex-1">Teams</div>
        <div className="flex-1">Score</div>
        <div className="flex-1">Cards</div>
        <div className="flex-1">Corners</div>
        <div className="flex-1">Yellows</div>
        <div className="flex-1">BTTS</div>
        <div className="flex-1">BT-Yellow</div>
        <div className="flex-1">Direct-H2H</div>
      </div>
      <div className="flex flex-row text-gray-700">
        <div className="flex-1">23 Feb 2023 - 04:00</div>
        <div className="flex-1">EPL</div>
        <div className="flex-1">Manchester United</div>
        <div className="flex-1">2</div>
        <div className="flex-1">2</div>
        <div className="flex-1">5</div>
        <div className="flex-1">1</div>
        <div className="flex-1">Y</div>
        <div className="flex-1">Y</div>
        <div className="flex-1">Manchester United</div>
      </div>
      <div className="flex flex-row text-gray-700">
        <div className="flex-1"></div>
        <div className="flex-1"></div>
        <div className="flex-1">Liverpool</div>
        <div className="flex-1">0</div>
        <div className="flex-1">3</div>
        <div className="flex-1">7</div>
        <div className="flex-1">2</div>
        <div className="flex-1">N</div>
        <div className="flex-1">Y</div>
        <div className="flex-1">Manchester United</div>
      </div>
    </div>
  );
};

export { MatchTable };
