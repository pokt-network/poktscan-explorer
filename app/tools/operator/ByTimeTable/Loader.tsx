import ByTimeTableCard from '@/app/tools/operator/ByTimeTable/Card'
import BaseTable from '@/app/components/BaseTable'
import columns from '@/app/tools/operator/columns'

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
