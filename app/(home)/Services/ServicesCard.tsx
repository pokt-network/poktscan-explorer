'use client'

import ServicesTable from '@/app/(home)/Services/ServicesTable'
import ServicesDoughnutChart from '@/app/(home)/Services/ServicesChart'
import React, { useCallback } from 'react'
import ServiceCardContent from '@/app/(home)/Services/ServiceCardContent'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { servicesDocument } from '@/app/(home)/operations'
import { getServicesVariables } from '@/app/(home)/utils'
import Big from 'big.js';
import { calculatePercentage, calculatePercentageChange } from '@/app/utils/calculate'
import ServicesLoader from '@/app/(home)/Services/Loader'
import { BaseRetryError } from '@/app/components/ErrorBoundary'

type Item = {
  keys: string[]; // Array with one string element (id)
  sum: {
    relays: number;
    estimatedRelays: number;
    computedUnits: number;
    estimatedComputedUnits: number;
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

export function calculateChanges(current: Item[], past: Item[]): AugmentedItem[] {
  // Create a map of past items by id for quick lookup
  const pastMap = new Map(
    past.map((item) => [item.keys[0], item.sum])
  );

  // Calculate totals for percentage calculations
  const totalSums = current.reduce(
    (totals, item) => {
      totals.relays = totals.relays.add(new Big(item.sum.estimatedRelays));
      totals.computedUnits = totals.computedUnits.add(item.sum.estimatedComputedUnits);
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
        relays: calculatePercentageChange(new Big(currentItem.sum.estimatedRelays), new Big(pastItem.estimatedRelays)),
        computedUnits: calculatePercentageChange(new Big(currentItem.sum.estimatedComputedUnits), new Big(pastItem.estimatedComputedUnits)),
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
      relays: calculatePercentage(new Big(currentItem.sum.estimatedRelays), totalSums.relays),
      computedUnits: calculatePercentage(new Big(currentItem.sum.estimatedComputedUnits), totalSums.computedUnits),
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
  initialData: DocumentNodeData<typeof servicesDocument> | null
  defaultType: string
  initialError: boolean
}

export default function ServicesCard({
  defaultType,
  initialData,
  initialError,
}: ServicesCardProps) {
  const variables = useCallback((_: number, currentTime: string) => getServicesVariables(currentTime), [])

  const { data, refetch, error, isLoading } = useFetchOnBlock({
    query: servicesDocument,
    variables,
    initialResult: initialData,
    initialError,
  })

  if (isLoading) {
    return <ServicesLoader defaultType={defaultType} />
  } else if (error) {
    const errorComponent = (
      <div className={'h-[calc(100%)] flex pb-[88px]'}>
        <BaseRetryError
          onRetry={refetch}
          errorMessage={`Oops. There was an error loading the services data.`}
        />
      </div>
    )

    return (
      <ServiceCardContent
        table={errorComponent}
        chart={errorComponent}
        defaultType={defaultType}
        hasItems={true}
        disableSelect={true}
      />
    )
  }

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

