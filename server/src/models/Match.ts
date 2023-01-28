import { Schema, model } from 'mongoose';
import { Match } from '../ts/types';
import { H2hInterface } from '../ts/interfaces';

const h2hSchema = new Schema<H2hInterface>({
  date: { type: Date },
  competition: { type: String },
  homeTeam: { type: String },
  awayTeam: { type: String },
  homeTeamScore: { type: Number },
  awayTeamScore: { type: Number },
  outcome: { type: String },
  matchStats: [
    {
      categoryStat: { type: String, required: true },
      homeStat: { type: Number, required: true },
      awayStat: { type: Number, required: true }
    }
  ]
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
    awayForm: {type: Object}
  }
});

const Match = model('match', matchSchema);

export default Match;
