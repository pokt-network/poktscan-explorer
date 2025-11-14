"use client";

import { HttpLink } from '@apollo/client'
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/experimental-nextjs-app-support";
import React from 'react'

function makeClient(url: string) {
  const httpLink = new HttpLink({
    uri: url,
    // Enable HTTP caching for better performance
    // Only disable cache for mutations or real-time critical queries via context override
    fetchOptions: { cache: "default" },
  });

  // use the `ApolloClient` from "@apollo/experimental-nextjs-app-support"
  return new ApolloClient({
    // use the `InMemoryCache` from "@apollo/experimental-nextjs-app-support"
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Merge policy for blocks queries - always replace with fresh data
            blocks: {
              keyArgs: false,
              merge(_existing, incoming) {
                return incoming
              }
            },
            // Cache evolution data by date range
            getLatestBlocksByDay: {
              keyArgs: ['startDate', 'endDate'],
              merge(_existing, incoming) {
                return incoming
              }
            },
            getTotalSupplyByDay: {
              keyArgs: ['startDate', 'endDate'],
              merge(_existing, incoming) {
                return incoming
              }
            },
            // Cache rewards data by date range and interval
            getRewardsByDate: {
              keyArgs: ['startDate', 'endDate', 'truncInterval'],
              merge(_existing, incoming) {
                return incoming
              }
            },
            // Cache relay/service aggregations
            relayByBlockAndServices: {
              keyArgs: ['currentDate', 'last24hDate', 'last48hDate'],
              merge(_existing, incoming) {
                return incoming
              }
            },
            // Cache service stats
            getServiceStats: {
              keyArgs: false,
              merge(_existing, incoming) {
                return incoming
              }
            },
            // Cache app stats
            getAppStats: {
              keyArgs: false,
              merge(_existing, incoming) {
                return incoming
              }
            },
          }
        },
        Block: {
          keyFields: ['id']
        },
        Account: {
          keyFields: ['address']
        },
        Application: {
          keyFields: ['address']
        },
        Supplier: {
          keyFields: ['address']
        },
        Service: {
          keyFields: ['id']
        },
      }
    }),
    link: httpLink,
    // Enable automatic query deduplication
    queryDeduplication: true,
    // Assume immutable cache results for better performance
    // Since blockchain data doesn't change, we can safely assume immutability
    assumeImmutableResults: true,
    // Default fetch policies - use cache first, then network
    defaultOptions: {
      watchQuery: {
        // For components with server data, first render uses cache
        // Subsequent updates check network
        fetchPolicy: 'cache-first',
        nextFetchPolicy: 'cache-and-network',
        // Return partial data from cache while fetching
        returnPartialData: true,
        // Canonize results for better performance
        canonizeResults: true,
      },
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
        canonizeResults: true,
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
}

// you need to create a component to wrap your app in
export function ApolloWrapper({ children, url }: {children: React.ReactNode, url: string}) {
  return (
    <ApolloNextAppProvider makeClient={() => makeClient(url)}>
      {children}
    </ApolloNextAppProvider>
  );
}
