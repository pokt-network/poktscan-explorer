import { getClient } from '@/app/config/apollo/rsc'
import { getLatestBlock } from '@/app/api/blocks'
import DataProvider from '@/app/context/DataContext'
import {
  getDataByDelegatorAddressesAndTimesDocument,
  getDataByDelegatorAddressesAndTimesVariables,
} from '@/app/tools/operator/operations'
import LastClaimingWindowTableCard from '@/app/tools/operator/ClaimProofTable/Card'
import ClientLastClaimingWindowTable from '@/app/tools/operator/ClaimProofTable/ClientTable'
import TableCardActions from '@/app/tools/operator/CardActions'
import { Time } from '@/app/utils/dates'

interface LastClaimingWindowTableProps {
  addresses: Array<string>
  time: Time
}

export default async function ServerLastClaimingWindowTable({addresses, time}: LastClaimingWindowTableProps) {
  let data, error = false

  try {
    const client = getClient()

    const latestBlock = await getLatestBlock()

    const response = await client.query({
      query: getDataByDelegatorAddressesAndTimesDocument,
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
      <LastClaimingWindowTableCard
        actions={
          <TableCardActions
            filenameKey={`${time}_table`}
          />
        }
      >
        <ClientLastClaimingWindowTable
          addresses={addresses}
          initialData={data}
          initialError={error}
        />
      </LastClaimingWindowTableCard>
    </DataProvider>
  )
}
