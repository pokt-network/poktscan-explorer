import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import ServicesTable from '@/app/(home)/ServicesTable'
import ServicesDoughnutChart from '@/app/(home)/ServicesChart'
import React from 'react'
import ServiceCardContent from '@/app/(home)/ServiceCardContent'

const servicesDocument = graphql(`
  query services($currentDate: Datetime!, $last24hDate: Datetime!, $last48hDate: Datetime!) {
    current24h: relayByBlockAndServices(filter: {block: {timestamp: {greaterThanOrEqualTo: $last24hDate, lessThanOrEqualTo: $currentDate}}}) {
      aggregated: groupedAggregates(groupBy: SERVICE_ID) {
        keys
        sum {
          relays
          computedUnits
          amount
          claimedUpokt
        }
      }
    }
    last24h: relayByBlockAndServices(filter: {block: {timestamp: {greaterThanOrEqualTo: $last48hDate, lessThan: $last24hDate}}}) {
      aggregated: groupedAggregates(groupBy: SERVICE_ID) {
        keys
        sum {
          relays
          computedUnits
          amount
          claimedUpokt
        }
      }
    }
  }
`)

type Item = {
  keys: string[]; // Array with one string element (id)
  sum: {
    relays: number;
    computedUnits: number;
    amount: number;
    claimedUpokt: number;
  };
};

export type AugmentedItem = {
  id: string; // Extracted from keys
  sum: {
    relays: number;
    computedUnits: number;
    amount: number;
    claimedUpokt: number;
  };
  changes: {
    relays: number; // Percentage change
    computedUnits: number; // Percentage change
    amount: number; // Percentage change
    claimedUpokt: number; // Percentage change
  };
  percentages: {
    relays: number; // Percentage of total relays
    computedUnits: number; // Percentage of total computedUnits
    amount: number; // Percentage of total amount
    claimedUpokt: number; // Percentage of total claimedUpokt
  };
};

function calculateChanges(current: Item[], past: Item[]): AugmentedItem[] {
  // Create a map of past items by id for quick lookup
  const pastMap = new Map(
    past.map((item) => [item.keys[0], item.sum])
  );

  // Calculate totals for percentage calculations
  const totalSums = current.reduce(
    (totals, item) => {
      totals.relays += item.sum.relays;
      totals.computedUnits += item.sum.computedUnits;
      totals.amount += item.sum.amount;
      totals.claimedUpokt += item.sum.claimedUpokt;
      return totals;
    },
    { relays: 0, computedUnits: 0, amount: 0, claimedUpokt: 0 }
  );

  // Process current array and calculate changes
  return current.map((currentItem) => {
    const id = currentItem.keys[0];
    const pastItem = pastMap.get(id);

    // Calculate percentage changes
    const changes = pastItem
      ? {
        relays: pastItem.relays
          ? ((currentItem.sum.relays - pastItem.relays) / pastItem.relays) *
          100
          : 0,
        computedUnits: pastItem.computedUnits
          ? ((currentItem.sum.computedUnits - pastItem.computedUnits) /
            pastItem.computedUnits) *
          100
          : 0,
        amount: pastItem.amount
          ? ((currentItem.sum.amount - pastItem.amount) / pastItem.amount) *
          100
          : 0,
        claimedUpokt: pastItem.claimedUpokt
          ? ((currentItem.sum.claimedUpokt - pastItem.claimedUpokt) /
            pastItem.claimedUpokt) *
          100
          : 0,
      }
      : {
        relays: 100, // Assume 100% increase if no past value
        computedUnits: 100,
        amount: 100,
        claimedUpokt: 100,
      };

    // Calculate percentages of the total
    const percentages = {
      relays:
        totalSums.relays > 0
          ? (currentItem.sum.relays / totalSums.relays) * 100
          : 0,
      computedUnits:
        totalSums.computedUnits > 0
          ? (currentItem.sum.computedUnits / totalSums.computedUnits) * 100
          : 0,
      amount:
        totalSums.amount > 0
          ? (currentItem.sum.amount / totalSums.amount) * 100
          : 0,
      claimedUpokt:
        totalSums.claimedUpokt > 0
          ? (currentItem.sum.claimedUpokt / totalSums.claimedUpokt) * 100
          : 0,
    };

    // Return the augmented item with changes and percentages
    return {
      id, // Add the id field
      sum: currentItem.sum,
      changes,
      percentages,
    };
  });
}

interface ServicesCardProps {
  defaultType: string
  currentDate: Date
}

export default async function ServicesCard({
  defaultType,
  currentDate
}: ServicesCardProps) {
  const last24hDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000)
  const last48hDate = new Date(currentDate.getTime() - 48 * 60 * 60 * 1000)

  const {data} = await getClient().query({
    query: servicesDocument,
    variables: {
      currentDate: currentDate.toISOString(),
      last24hDate: last24hDate.toISOString(),
      last48hDate: last48hDate.toISOString(),
    }
  })

  const processedData = calculateChanges(
    (data?.current24h?.aggregated || []) as unknown as Item[],
    (data?.last24h?.aggregated || []) as unknown as Item[]
  )

  return (
    <ServiceCardContent
      table={<ServicesTable data={processedData} />}
      chart={<ServicesDoughnutChart data={processedData} />}
      defaultType={defaultType}
      hasItems={processedData.length > 0}
    />
  )
}

