import React from "react";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

let httpLink;
if (process.env.NODE_ENV === "development") {
  httpLink = createHttpLink({
    uri: "http://localhost:3001/graphql",
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
      <h1 className="text-gray-500">Hello World</h1>
    </ApolloProvider>
  );
}

export default App;
