import { MongoClient } from 'mongodb';
import { Match } from '../ts/types';

export const saveMatch = async (match: Match) => {
  const client = new MongoClient(process.env.MONGODB_URI!);
  const DB_NAME = process.env.DB_NAME;
  const MATCHES_COLLECTION = process.env.MATCHES_COLLECTION;
  try {
    const database = client.db(DB_NAME);
    const matches = database.collection(MATCHES_COLLECTION!);

    // console.log(matches);
    // create a document to insert
    const result = await matches.insertOne(match);
    // const result = await matches.updateOne({ matchId: match.matchId }, { $setOnInsert: match }, { upsert: true });

    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } finally {
    // await client.close();
  }
};
