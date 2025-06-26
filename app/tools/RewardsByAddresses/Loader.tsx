import RewardsByAddressCard from '@/app/tools/RewardsByAddresses/Card'
import BaseLineBarChart from '@/app/Charts/BaseLineBarChart/BaseLineBarChart'
import type { DataItem } from '@/app/dashboards/services/Productivity/Chart'

export function ContentLoader({chartType}: LoaderProps) {
  return (
    <BaseLineBarChart
      yAxisKey={'totalAmount'}
      yAxisLabel={'Rewards (POKT)'}
      chartType={chartType}
      isLoading={true}
      data={{} as Record<string, Array<DataItem>>}
    />
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
      <ContentLoader chartType={chartType} />
    </RewardsByAddressCard>
  )
}
