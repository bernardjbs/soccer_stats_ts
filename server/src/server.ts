import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import resolvers from './schemas/resolvers.js';
import typeDefs from './schemas/typeDefs.js';

const app = express();

app.use(express.json());

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// await server.start();
// server.applyMiddleware({ app });

const PORT = process.env.PORT || 4000;

// app.listen({ port: PORT }, () => console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`));

// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });
  

    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);

  }) 
  };
    startApolloServer();