import BaseTable from '@/app/components/BaseTable'
import columns from '@/app/dashboards/node-running/columns'
import LastClaimingWindowTableCard from '@/app/dashboards/node-running/LastClaimingWindowTable/Card'

export default function LastClaimingWindowTableLoader() {
  return (
    <LastClaimingWindowTableCard>
      <BaseTable columns={columns} rows={[]} isLoading={true} />
    </LastClaimingWindowTableCard>
  )
}
