import PerformanceTableCard from '@/app/dashboards/services/PerformanceTable/Card'
import BaseTable from '@/app/components/BaseTable'
import columns from '@/app/dashboards/services/PerformanceTable/columns'

interface LoaderProps {
  timeSelected: string
}

export default function PerformanceTableLoader({timeSelected}: LoaderProps) {
  return (
    <PerformanceTableCard timeSelected={timeSelected}>
      <BaseTable columns={columns} rows={[]} isLoading={true} />
    </PerformanceTableCard>
  )
}
