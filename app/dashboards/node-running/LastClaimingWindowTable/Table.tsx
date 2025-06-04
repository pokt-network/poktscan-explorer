import { getClient } from '@/app/config/apollo/rsc'
import { getLatestBlock } from '@/app/api/blocks'
import DataProvider from '@/app/context/DataContext'
import {
  getDataByDelegatorAddressesAndBlocksDocument,
  getParamsDocument,
} from '@/app/dashboards/node-running/operations'
import { Suspense } from 'react'
import LastClaimingWindowTableLoader from '@/app/dashboards/node-running/LastClaimingWindowTable/Loader'
import LastClaimingWindowTableCard from '@/app/dashboards/node-running/LastClaimingWindowTable/Card'
import ClientLastClaimingWindowTable from '@/app/dashboards/node-running/LastClaimingWindowTable/ClientTable'
import TableCardActions from '@/app/dashboards/node-running/CardActions'

interface LastClaimingWindowTableProps {
  addresses: Array<string>
}

async function ServerLastClaimingWindowTable({addresses}: LastClaimingWindowTableProps) {
  const client = getClient()

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

  const {data} = await client.query({
    query: getDataByDelegatorAddressesAndBlocksDocument,
    variables: {
      delegatorAddresses: addresses,
      startBlock: startHeight.toString() || '0',
      endBlock: endHeight.toString() || '0',
    }
  })

  return (
    <DataProvider initialData={[]}>
      <LastClaimingWindowTableCard
        actions={
          <TableCardActions filenameKey={'last_claiming_window_table'} />
        }
      >
        <ClientLastClaimingWindowTable
          addresses={addresses}
          initialData={data}
        />
      </LastClaimingWindowTableCard>
    </DataProvider>
  )
}


export default function LastClaimingWindowTable({addresses}: LastClaimingWindowTableProps) {
  return (
    <Suspense
      key={addresses.join(',')}
      fallback={
        <LastClaimingWindowTableLoader />
      }
    >
      <ServerLastClaimingWindowTable addresses={addresses} />
    </Suspense>
  )
}
