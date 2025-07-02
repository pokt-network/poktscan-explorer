import { Time } from '@/app/utils/dates'
import { getClient } from '@/app/config/apollo/rsc'
import { getLatestBlock } from '@/app/api/blocks'
import {
  getDataByDelegatorAddressesAndTimesVariables,
  rewardsByServicesDocument,
} from '@/app/tools/operator/operations'
import DataProvider from '@/app/context/DataContext'
import RewardsByServiceCard from '@/app/tools/operator/ServicesTab/Card'
import ClientRewardsByServiceTable from '@/app/tools/operator/ServicesTab/ClientTable'
import TableCardActions from '@/app/tools/operator/ServicesTab/CardActions'

interface ServicesTableProps {
  addresses: Array<string>
  time: Time
}

export default async function RewardsByServiceTable({addresses, time}: ServicesTableProps) {
  let data, error = false

  try {
    const client = getClient()

    const latestBlock = await getLatestBlock()

    const response = await client.query({
      query: rewardsByServicesDocument,
      variables: getDataByDelegatorAddressesAndTimesVariables(
        addresses,
        latestBlock.timestamp,
        time
      )
    })

    data = response.data
  } catch {
    error = true
  }

  return (
    <DataProvider initialData={[]}>
      <RewardsByServiceCard
        actions={(
          <TableCardActions />
        )}
      >
        <ClientRewardsByServiceTable
          addresses={addresses}
          initialData={data}
          initialError={error}
        />
      </RewardsByServiceCard>
    </DataProvider>
  )
}
