import { processEnv } from './processEnv.js';
import { MongoClient } from 'mongodb';
import express from 'express';
import mysql from 'mysql2';
import { toSqlDateFormat } from './helpers.js';
import { connection } from 'mongoose';
import fetch from 'node-fetch';

// Mongodb
const client = new MongoClient(processEnv().MONGODB_URI!);
const DB_NAME = processEnv().DB_NAME;
const MATCHES_COLLECTION = processEnv().MATCHES_COLLECTION;
const database = client.db(DB_NAME);
const matchCollection = database.collection(MATCHES_COLLECTION!);

// MySQL
const PORT = processEnv().PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection({
  host: processEnv().DB_CONNECTION,
  user: processEnv().DB_USERNAME,
  password: processEnv().DB_PASSWORD,
  database: processEnv().DB_DATABASE
});

const saveAllMatches = async () => {
  try {
    const count = await matchCollection.countDocuments();
    // const matches = await matchCollection.findOne({ matchId: 'E1N7x54p' });
    console.log(`There are ${count} documents... `);
    const matches = await matchCollection.find().toArray();

    console.log('Convertion started... ');
    matches.map((match) => {
      const matchStart = toSqlDateFormat(match?.matchStart);
      let homeTeam = '';
      let awayTeam = '';
      if (match?.homeTeam.includes("'")) {
        homeTeam = match?.homeTeam.replace(/'/g, "''");
      }
      if (match?.awayTeam.includes("'")) {
        awayTeam = match?.awayTeam.replace(/'/g, "''");
      }
      // console.log(matchStart);
      db.query(`
      INSERT IGNORE INTO soccer_matches (
        match_id,
        match_start,
        competition,
        home_team,
        away_team, 
        created_at, 
        updated_at
      )
      VALUES (
        '${match?.matchId}',
        '${matchStart}',
        '${match?.competition}',
        '${homeTeam}',
        '${awayTeam}', 
        NOW(), 
        NOW()
      );`);
    });

    // Close the connection
    // db.end((err) => {
    //   if (err) {
    //     console.error(err);
    //   } else {
    //     console.log('Conversion completed. MySQL connection closed successfully!');
    //     process.exit();
    //   }
    // });
  } catch (error) {
    console.error(error);
  }
  console.log('done');
};

export const saveScore = async (match_id: string, home_score: number, away_score: number) => {
  console.log('saving results');
  try {
    db.query(`
      INSERT IGNORE INTO results (
        soccer_match_id,
        home_score,
        away_score,
        created_at, 
        updated_at
      )
      VALUES (
        '${match_id}',
        '${home_score}',
        '${away_score}', 
        NOW(), 
        NOW()
      );`);

    // Close the connection
    // db.end((err) => {
    //   if (err) {
    //     console.error(err);
    //   } else {
    //     console.log('Results saved - MySQL connection closed successfully!');
    //   }
    // });
  } catch (error) {
    console.error(error);
  }
  console.log('SAVED SCORE');
};

export const saveStats = async (match_id: string, type_id: number, for_team: string, stat_score: number) => {
  console.log('saving results');
  try {
    db.query(`
      INSERT INTO stats (
        soccer_match_id,
        stat_type_id,
        for_team, 
        stat_score,
        created_at, 
        updated_at
      )
      VALUES (
        '${match_id}',
        '${type_id}',
        '${for_team}', 
        '${stat_score}', 
        NOW(), 
        NOW()
      );`);

    // Close the connection
    // db.end((err) => {
    //   if (err) {
    //     console.error(err);
    //   } else {
    //     console.log('Results saved - MySQL connection closed successfully!');
    //   }
    // });
  } catch (error) {
    console.error(error);
  }
  console.log('SAVED STATS');
};

const addStatTypes = async (type: string) => {
  try {
    db.query(`
      INSERT INTO stat_types (
        stat_type,
        created_at, 
        updated_at
      )
      VALUES (
        '${type}',
        NOW(), 
        NOW()
      );`);
  } catch (error) {
    console.error(error);
  }
  console.log('SAVED STAT TYPE: ' + type);
};


// saveAllMatches();
// addStatTypes('Expected Goals (xG)');
// addStatTypes('Yellow Cards');
// addStatTypes('Corner Kicks');


// saveScore('Y7uusodT', 2, 1);
