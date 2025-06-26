import { getLatestBlock } from '@/app/api/blocks'
import { getClient } from '@/app/config/apollo/rsc'
import { summaryDocument, summaryVariables } from '@/app/tools/Summary/operations'
import Summary from '@/app/tools/Summary/Summary'

interface ServerSummaryProps {
  addresses: Array<string>
  isOwners: boolean
}

export default async function ServerSummary({addresses, isOwners}: ServerSummaryProps) {
  let data, error = false

  if (addresses.length) {
    try {
      const latestBlock = await getLatestBlock()

      const response = await getClient().query({
        query: summaryDocument,
        variables: summaryVariables(
          isOwners,
          addresses,
          latestBlock.timestamp
        )
      })

      data = response.data
    } catch {
      error = true
    }
  }

  return (
    <Summary
      isOwners={isOwners}
      initialAddresses={addresses}
      initialData={data}
      initialError={error}
    />
  )
}
