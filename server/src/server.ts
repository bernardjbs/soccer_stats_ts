import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import resolvers from './schemas/resolvers.js';
import typeDefs from './schemas/typeDefs.js';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

import db from './config/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

const PORT = process.env.PORT || 4000;

const app = express();

app.use(express.json());

const server = new ApolloServer({
  typeDefs,
  resolvers
});

// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });
  
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  }) 
  };

startApolloServer();
