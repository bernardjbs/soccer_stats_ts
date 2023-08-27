import { MongoClient } from 'mongodb';
import { MatchType } from '../ts/types';
import { processEnv } from './processEnv.js';

const client = new MongoClient(processEnv().MONGODB_URI!);
const DB_NAME = processEnv().DB_NAME;
const MATCHES_COLLECTION = processEnv().MATCHES_COLLECTION;
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

export const saveMatch = async (match: MatchType) => {
  try {
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
