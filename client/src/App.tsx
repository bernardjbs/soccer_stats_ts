import React from "react";
import { MatchTable } from "./components/MatchTable";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { MatchId } from "./components/MatchId";

let httpLink;
if (process.env.NODE_ENV === "development") {
  httpLink = createHttpLink({
    uri: process.env.REACT_APP_APOLLO_URI,
  });
} else {
  httpLink = createHttpLink({
    uri: "/graphql",
  });
}

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <section className="m-2">
        <MatchTable />
        <MatchId />
      </section>
    </ApolloProvider>
  );
}

export default App;
