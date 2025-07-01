import { getClient } from '@/app/config/apollo/rsc'
import { getLatestBlock } from '@/app/api/blocks'
import DataProvider from '@/app/context/DataContext'
import {
  getDataByDelegatorAddressesAndBlocksDocument,
  getDataByDelegatorAddressesAndTimesDocument,
  getDataByDelegatorAddressesAndTimesVariables,
  getParamsDocument,
} from '@/app/tools/operator/operations'
import LastClaimingWindowTableCard from '@/app/tools/operator/ClaimProofTable/Card'
import ClientLastClaimingWindowTable from '@/app/tools/operator/ClaimProofTable/ClientTable'
import TableCardActions from '@/app/tools/operator/CardActions'
import { TimeClaimProofTable } from '@/app/tools/operator/constants'

interface LastClaimingWindowTableProps {
  addresses: Array<string>
  time: TimeClaimProofTable
}

export default async function ServerLastClaimingWindowTable({addresses, time}: LastClaimingWindowTableProps) {
  let data, error = false

  try {
    const client = getClient()

    if (time === TimeClaimProofTable.LastClaimingWindow) {
      const [latestBlock, {data: paramsData}] = await Promise.all([
        getLatestBlock(),
        client.query({
          query: getParamsDocument,
        })
      ])

      const claimWindowCloseOffsetBlocks = paramsData?.params?.nodes?.find(n => n.key === 'claim_window_close_offset_blocks')?.value
      const claimWindowOpenOffsetBlocks = paramsData?.params?.nodes?.find(n => n.key === 'claim_window_open_offset_blocks')?.value
      const proofWindowCloseOffsetBlocks = paramsData?.params?.nodes?.find(n => n.key === 'proof_window_close_offset_blocks')?.value

      const window = Number(claimWindowCloseOffsetBlocks || 0) + Number(claimWindowOpenOffsetBlocks || 0) + Number(proofWindowCloseOffsetBlocks || 0)

      const endHeight = BigInt(latestBlock.height)
      const startHeight = endHeight - BigInt(window)

      const response = await client.query({
        query: getDataByDelegatorAddressesAndBlocksDocument,
        variables: {
          delegatorAddresses: addresses,
          startBlock: startHeight.toString() || '0',
          endBlock: endHeight.toString() || '0',
        }
      })

      data = response.data
    } else {
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
    }
  } catch {
    error = true
  }

  return (
    <DataProvider initialData={[]}>
      <LastClaimingWindowTableCard
        actions={
          <TableCardActions
            filenameKey={
              time === TimeClaimProofTable.LastClaimingWindow ?
                'last_claiming_window_table' :
                `${time}_table`
            }
          />
        }
        initialSelectedTime={time}
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
