import RewardsByServiceCard from '@/app/tools/operator/ServicesTab/Card'
import BaseTable from '@/app/components/BaseTable'
import { rewardsByServiceColumns } from '@/app/tools/operator/ServicesTab/columns'

export default function RewardsByServiceLoader() {
  return (
    <RewardsByServiceCard>
      <BaseTable columns={rewardsByServiceColumns} rows={[]} isLoading={true} />
    </RewardsByServiceCard>
  )
}
