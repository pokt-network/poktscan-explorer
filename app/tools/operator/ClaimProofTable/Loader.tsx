import BaseTable from '@/app/components/BaseTable'
import columns from '@/app/tools/operator/columns'
import LastClaimingWindowTableCard from '@/app/tools/operator/ClaimProofTable/Card'

export default function LastClaimingWindowTableLoader() {
  return (
    <LastClaimingWindowTableCard>
      <BaseTable columns={columns} rows={[]} isLoading={true} />
    </LastClaimingWindowTableCard>
  )
}
