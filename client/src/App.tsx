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
      <section className="m-2">
        <div
          className="
        border-solid border-2 border-black"
        >
          <h1 className="text-red-500 text-xl font-bold">
            England Championship - Round 26 - Blackburn VS Cardif - Sunday 1
            January 2023, 20:00
          </h1>
        </div>
        <section className="flex">
          <div className="bg-gray-200">
            <p>Blackburn BTTS @Home at least 4/5 times</p>
            <p>Cardif BTTS @Away at least 4/5 times</p>
            <p>Blackburn BTTS @Overall at least 4/5 times</p>
            <p>Cardif BTTS @Overall at least 4/5 times</p>
            <p>Direct BTTS is at least 4/5 times</p>
          </div>
          <div className="bg-gray-300">
            <p>Won (3-2)</p>
            <p>Won (3-2)</p>
            <p>Won (3-2)</p>
            <p>Won (3-2)</p>
            <p>Won (3-2)</p>
          </div>
        </section>
      </section>
    </ApolloProvider>
  );
}

export default App;
