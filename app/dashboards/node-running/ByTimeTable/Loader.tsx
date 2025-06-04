import ByTimeTableCard from '@/app/dashboards/node-running/ByTimeTable/Card'
import BaseTable from '@/app/components/BaseTable'
import columns from '@/app/dashboards/node-running/columns'

interface LoaderProps {
  timeSelected: string
}

export default function ByTimeTableLoader({timeSelected}: LoaderProps) {
  return (
    <ByTimeTableCard timeSelected={timeSelected}>
      <BaseTable columns={columns} rows={[]} isLoading={true} />
    </ByTimeTableCard>
  )
}
