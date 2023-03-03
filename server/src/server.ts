// startApolloServer();
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import resolvers from './schemas/resolvers.js';
import typeDefs from './schemas/typeDefs.js';
import db from './config/connection.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
import bodyParser from 'body-parser';

const __dirname = path.dirname(__filename);

import { processEnv } from './utils/processEnv.js';

const PORT = processEnv().PORT || 4000;

interface MyContext {
  token?: String;
}

const app = express();
const httpServer = http.createServer(app);
const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});

await server.start();

app.use(
  '/graphql',
  cors<cors.CorsRequest>({
    origin: ['http://localhost:3000', 'http://localhost:8000']
  }),
  bodyParser.json(),
  // express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token })
  })
);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
}

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
});
