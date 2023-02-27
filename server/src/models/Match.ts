import { ResultInterface, MatchStatsInterface, TeamFormRankInterface } from './../ts/interfaces.d';
import { Schema, model } from 'mongoose';
import { Match } from '../ts/types';
import { H2hInterface } from '../ts/interfaces';

const matchStatsSchema = new Schema<MatchStatsInterface>({
  categoryStat: String,
  homeStat: String,
  awayStat: String
});

const h2hSchema = new Schema<H2hInterface>({
  date: { type: Date },
  competition: { type: String },
  homeTeam: { type: String },
  awayTeam: { type: String },
  homeTeamScore: { type: Number },
  awayTeamScore: { type: Number },
  outcome: { type: String },
  matchStats: [{ type: Schema.Types.ObjectId, ref: matchStatsSchema }]
});

const resultSchema = new Schema<ResultInterface>({
  homeScore: Number,
  awayScore: Number,
  matchStats: [{ type: Schema.Types.ObjectId, ref: matchStatsSchema }]
});

const matchSchema = new Schema<Match>({
  matchId: { type: String, required: true },
  matchStart: { type: Date, required: true },
  competition: { type: String, required: true },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  hotStat: { type: String },
  overallHomeStats: [{ type: Schema.Types.ObjectId, ref: h2hSchema }],
  overallAwayStats: [{ type: Schema.Types.ObjectId, ref: h2hSchema }],
  overallH2hStats: [{ type: Schema.Types.ObjectId, ref: h2hSchema }],
  homeStats: [{ type: Schema.Types.ObjectId, ref: h2hSchema }],
  awayStats: [{ type: Schema.Types.ObjectId, ref: h2hSchema }],
  directH2hStats: [{ type: Schema.Types.ObjectId, ref: h2hSchema }],
  formStats: {
    homeForm: { type: Object },
    awayForm: { type: Object }
  },
  result: {
    homeScore: String,
    awayScore: String,
    matchStats: [{ type: Schema.Types.ObjectId, ref: resultSchema }]
  }
});

const Match = model('match', matchSchema);

export default Match;
