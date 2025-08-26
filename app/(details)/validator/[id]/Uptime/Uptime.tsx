import type { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import React, { Suspense } from 'react'
import { validatorUptimeDocument } from '@/app/(details)/validator/[id]/Uptime/operations'
import ClientUptime from '@/app/(details)/validator/[id]/Uptime/Client'
import UptimeLoader from '@/app/(details)/validator/[id]/Uptime/Loader'
import UptimeCard from '@/app/(details)/validator/[id]/Uptime/Card'
import {
  getHexAddressFromConsensusPubkey,
  getRawValidatorFromRpc
} from '@/app/(details)/validator/[id]/getValidator'
import { getClient } from '@/app/config/apollo/rsc'
import getMetadata from '@/app/api/metadata'

const amountOfBlocks = 499
const rpcUrl = process.env.RPC_BASE_URL!

async function ServerUptime({valoperAddress}: UptimeProps) {
  let data: DocumentNodeData<typeof validatorUptimeDocument> | null = null,
    error = false,
    from = '',
    to = '',
    hexAddress = ''

  try {
    const [validator, metadata] = await Promise.all([
      getRawValidatorFromRpc(valoperAddress, rpcUrl),
      getMetadata(),
    ])

    if (!validator) {
      return null
    }

    hexAddress = getHexAddressFromConsensusPubkey(validator.consensus_pubkey.key)
    to = metadata?._metadata?.lastProcessedHeight?.toString() || '0'
    from = (BigInt(to) - BigInt(amountOfBlocks)).toString()

    const response = await getClient().query({
      query: validatorUptimeDocument,
      variables: {
        from,
        validatorHexAddress: hexAddress,
      }
    })

    data = response.data
  } catch {
    error = true
  }

  return (
    <ClientUptime
      initialTo={to}
      initialFrom={from}
      initialData={data}
      initialError={error}
      amountOfBlocks={amountOfBlocks}
      validatorHexAddress={hexAddress}
      valoperAddress={valoperAddress}
      rpcUrl={rpcUrl}
    />
  )
}

interface UptimeProps {
  valoperAddress: string
}

export default async function Uptime({valoperAddress}: UptimeProps) {
  return (
    <Suspense
      key={valoperAddress}
      fallback={(
        <UptimeCard>
          <UptimeLoader amountOfBlocks={amountOfBlocks} />
        </UptimeCard>
      )}
    >
      <ServerUptime valoperAddress={valoperAddress} />
    </Suspense>
  )
}
