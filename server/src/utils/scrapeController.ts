import { MongoClient } from 'mongodb';
import { MatchType } from '@ts/types.js';
import { processEnv } from './processEnv.js';
import Colors from 'colors.ts';

Colors.enable();

const client = new MongoClient(processEnv().MONGODB_URI!);
const DB_NAME = processEnv().DB_NAME;
const MATCHES_COLLECTION = processEnv().MATCHES_COLLECTION;
const database = client.db(DB_NAME);
const matchCollection = database.collection(MATCHES_COLLECTION!);

export const deleteMatches = async (matchIds: string[]) => {
  for (let i = 0; i < matchIds.length; i++) {
    try {
      await matchCollection.deleteOne({ matchId: matchIds[i] });
      console.log(`A document was deleted with the matchId: ${matchIds[i]}`.red);
    } catch (error) {
      console.log(error);
    }
  }
};

export const saveMatch = async (match: MatchType) => {
  try {
    const result = await matchCollection.insertOne(match);
    console.log(`A document was inserted with the _id: ${result.insertedId}`.green);
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
    console.log(`Result Updated`.green);
  } catch (error) {
    console.log(error);
  }
};

export const emptyResultMatches = async () => {
  try {
    const filterDateTime = new Date();
    filterDateTime.setHours(filterDateTime.getHours() - 3);
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
