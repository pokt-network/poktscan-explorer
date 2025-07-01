import RewardsByAddressCard from '@/app/tools/RewardsByAddresses/Card'
import BaseLineBarChart from '@/app/Charts/BaseLineBarChart/BaseLineBarChart'
import type { DataItem } from '@/app/dashboards/services/Productivity/Chart'
import ServicesSelectorLoader from '@/app/Charts/ItemsSelector/Loader'
import React from 'react'

interface ContentLoaderProps {
  chartType: 'line' | 'bar'
  hideSelector?: boolean
}

export function ContentLoader({chartType, hideSelector}: ContentLoaderProps) {
  return (
    <>
      <div className={'order-2 md:order-1 w-full md:w-[calc(100%-260px-16px)] h-full'}>
        <BaseLineBarChart
          yAxisKey={'totalAmount'}
          yAxisLabel={'Rewards (POKT)'}
          chartType={chartType}
          isLoading={true}
          data={{} as Record<string, Array<DataItem>>}
        />
      </div>
      {!hideSelector && (
        <div className={'h-[260px] md:h-[calc(100%-16px)] w-full md:min-w-[260px] md:w-[260px] order-1 md:order-2'}>
          <ServicesSelectorLoader />
        </div>
      )}
    </>
  )
}

interface LoaderProps {
  chartType: 'line' | 'bar'
}

export default function RewardsByAddressesLoader({chartType}: LoaderProps) {
  return (
    <RewardsByAddressCard
      includeTimeSelector={false}
    >
      <div className={'flex flex-col md:flex-row items-center px-4 pt-2 pb-4 h-[calc(100%-44px)] gap-4'}>
        <ContentLoader chartType={chartType} />
      </div>
    </RewardsByAddressCard>
  )
}
