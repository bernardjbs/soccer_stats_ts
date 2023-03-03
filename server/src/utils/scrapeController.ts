import { MongoClient } from 'mongodb';
import { MatchType } from '../ts/types';

import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, '../../../.env')
});

const client = new MongoClient(process.env.MONGODB_URI!);
const DB_NAME = process.env.DB_NAME;
const MATCHES_COLLECTION = process.env.MATCHES_COLLECTION;
const database = client.db(DB_NAME);
const matchCollection = database.collection(MATCHES_COLLECTION!);

export const deleteMatches = async (matchIds: string[]) => {
  let count = 0;
  matchIds.map(async (matchId, i) => {
    try {
      await matchCollection.deleteOne({ matchId: matchId });
      console.log(`A document was deleted with the matchId: ${matchId}`);
    } catch (error) {
      console.log(error);
    } finally {
      count = count + 1;
      if (count === matchIds.length) {
        process.exit();
      }
    }
  });
};


import Match  from '../models/Match.js';
export const saveMatch = async (match: MatchType) => {
  // try {
  //   const newMatch = new Match(match);

  //     const result = await matchCollection.insertOne(newMatch);
  //     console.log(`A document was inserted with the _id: ${result.insertedId}`);
  // } catch (error) {
  //   console.log(error);
  // }


  try {
    // const result = await matchCollection.updateOne({ matchId: match.matchId }, { $setOnInsert: match }, { upsert: true });
    // console.log(`A document was inserted with the _id: ${result.upsertedId}`);

    // create a document to insert
      //   const newMatch = new Match(match);

    const result = await matchCollection.insertOne(match);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } finally {
    // await client.close();
  }
};

export const matchExists = async (matchId: String) => {
  try {
    const foundMatch = await matchCollection.findOne({ matchId: matchId });
    if (foundMatch) return true;
    return false;
  } catch (error) {
    console.log(error);
  }
};

export const updateMatchResult = async (matchId: String, results: Object) => {
  try {
    await matchCollection.updateOne({ matchId: matchId }, { $set: { result: results } });
    console.log(`Result Updated`);
  } catch (error) {
    console.log(error);
  } 
};

export const emptyResultMatches = async () => {
  try {
    const filterDateTime = new Date();
    filterDateTime.setHours(filterDateTime.getHours() - 2);
    const matches = await matchCollection
      .find({
        result: [],
        matchStart: { $lt: filterDateTime }
      })
      .toArray()
      .then((res) => {
        const json = JSON.parse(JSON.stringify(res));
        return json;
      });
    return matches;
  } catch (error) {
    console.log(error);
  }
};

// Insert result field to conllection if it does not exist
export const insertResultField = async () => {
  try {
    matchCollection.updateMany({}, { $set: { result: [] } }).then(() => console.log('done'));
  } catch (error) {
    console.log(error);
  }
};
