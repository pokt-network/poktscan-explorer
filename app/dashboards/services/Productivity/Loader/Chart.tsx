import type { DataItem } from '@/app/dashboards/services/Productivity/Chart'
import BaseLineBarChart from '@/app/Charts/BaseLineBarChart/BaseLineBarChart'

interface ProductivityLoaderChartProps {
  chartType: 'line' | 'bar'
}

export default function ProductivityLoaderChart({
  chartType,
}: ProductivityLoaderChartProps) {
  return (
    <BaseLineBarChart
      yAxisKey={'avgComputedUnits'}
      yAxisLabel={'Avg Computed Units'}
      chartType={chartType}
      isLoading={true}
      data={{} as Record<string, Array<DataItem>>}
    />
  )
}
