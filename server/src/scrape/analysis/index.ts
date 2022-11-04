import { MongoClient } from 'mongodb';
import colors from 'colors.ts';

import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, '../../../../.env')
});

const client = new MongoClient(process.env.MONGODB_URI!);
const DB_NAME = process.env.DB_NAME;
const MATCHES_COLLECTION = process.env.MATCHES_COLLECTION;

const analyseMatch = async () => {
  try {
    const database = client.db(DB_NAME);
    const matches = database.collection(MATCHES_COLLECTION!);
    const results = await matches
      .find({ matchStart: { $gt: new Date() } })
      .sort({ matchStart: 1 })
      .toArray();
    // console.log(results[1]);

    // Get home team home stats
    results.map((result) => {
      console.log(`home team: ${result.homeStats.lastMatchesHome[0].homeTeam}`);
    });
    // Get away team away stats

    // Get H2H stats
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
};

analyseMatch();
