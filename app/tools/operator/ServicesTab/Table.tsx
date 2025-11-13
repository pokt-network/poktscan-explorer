import { Time } from '@/app/utils/dates'
import DataProvider from '@/app/context/DataContext'
import RewardsByServiceCard from '@/app/tools/operator/ServicesTab/Card'
import ClientRewardsByServiceTable from '@/app/tools/operator/ServicesTab/ClientTable'
import TableCardActions from '@/app/tools/operator/ServicesTab/CardActions'

interface ServicesTableProps {
  addresses: Array<string>
  time: Time
}

export default async function RewardsByServiceTable({addresses}: ServicesTableProps) {
  return (
    <DataProvider initialData={[]}>
      <RewardsByServiceCard
        actions={(
          <TableCardActions />
        )}
      >
        <ClientRewardsByServiceTable
          addresses={addresses}
          initialData={null}
          initialError={false}
        />
      </RewardsByServiceCard>
    </DataProvider>
  )
}
