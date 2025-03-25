'use client'

import ServicesTable from '@/app/(home)/ServicesTable'
import ServicesDoughnutChart from '@/app/(home)/ServicesChart'
import React, { useCallback } from 'react'
import ServiceCardContent from '@/app/(home)/ServiceCardContent'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { servicesDocument } from '@/app/(home)/operations'
import { getServicesVariables } from '@/app/(home)/utils'
import Big from 'big.js';

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

const calculatePercentageChange = (current: Big, past: Big): number => {
  return  past.gt(0) ? current.minus(past).div(past).mul(100).toNumber() : 0
}

const calculatePercentage = (value: Big, total: Big): number => {
  return  total.gt(0) ?  value.div(total).mul(100).toNumber() : 0
}

function calculateChanges(current: Item[], past: Item[]): AugmentedItem[] {
  // Create a map of past items by id for quick lookup
  const pastMap = new Map(
    past.map((item) => [item.keys[0], item.sum])
  );

  // Calculate totals for percentage calculations
  const totalSums = current.reduce(
    (totals, item) => {
      totals.relays = totals.relays.add(new Big(item.sum.relays));
      totals.computedUnits = totals.computedUnits.add(item.sum.computedUnits);
      totals.amount = totals.amount.add(item.sum.amount);
      totals.claimedUpokt = totals.claimedUpokt.add(item.sum.claimedUpokt);
      return totals;
    },
    { relays: new Big(0), computedUnits: new Big(0), amount: new Big(0), claimedUpokt: new Big(0) }
  );

  // Process current array and calculate changes
  return current.map((currentItem) => {
    const id = currentItem.keys[0];
    const pastItem = pastMap.get(id);

    // Calculate percentage changes
    const changes = pastItem
      ? {
        relays: calculatePercentageChange(new Big(currentItem.sum.relays), new Big(pastItem.relays)),
        computedUnits: calculatePercentageChange(new Big(currentItem.sum.computedUnits), new Big(pastItem.computedUnits)),
        amount: calculatePercentageChange(new Big(currentItem.sum.amount), new Big(pastItem.amount)),
        claimedUpokt: calculatePercentageChange(new Big(currentItem.sum.claimedUpokt), new Big(pastItem.claimedUpokt)),
      }
      : {
        relays: 100, // Assume 100% increase if no past value
        computedUnits: 100,
        amount: 100,
        claimedUpokt: 100,
      };

    // Calculate percentages of the total
    const percentages = {
      relays: calculatePercentage(new Big(currentItem.sum.relays), totalSums.relays),
      computedUnits: calculatePercentage(new Big(currentItem.sum.computedUnits), totalSums.computedUnits),
      amount: calculatePercentage(new Big(currentItem.sum.amount), totalSums.amount),
      claimedUpokt: calculatePercentage(new Big(currentItem.sum.claimedUpokt), totalSums.claimedUpokt),
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
  initialData: DocumentNodeData<typeof servicesDocument>
  defaultType: string
}

export default function ServicesCard({
  defaultType,
  initialData,
}: ServicesCardProps) {
  const variables = useCallback((_: number, currentTime: string) => getServicesVariables(new Date(currentTime)), [])

  const data = useFetchOnBlock({
    query: servicesDocument,
    variables,
    initialResult: initialData,
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

