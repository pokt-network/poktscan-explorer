'use client'

import type { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import React, { useEffect, useState } from 'react'
import { validatorUptimeDocument } from '@/app/(details)/validator/[id]/Uptime/operations'
import ClientUptime from '@/app/(details)/validator/[id]/Uptime/Client'
import UptimeLoader from '@/app/(details)/validator/[id]/Uptime/Loader'
import UptimeCard from '@/app/(details)/validator/[id]/Uptime/Card'
import {
  getHexAddressFromConsensusPubkey,
  getRawValidatorFromRpc
} from '@/app/(details)/validator/[id]/getValidator'
import { indexerMetadataDocument } from '@/app/operations/metadata'
import useFetchOnBlock from '@/app/hooks/useFetchOnBlock'
import { useQuery } from '@apollo/client'
import { useRpcUrl } from '@/app/context/rpcUrl'

const amountOfBlocks = 499

interface UptimeProps {
  valoperAddress: string
}

export default function Uptime({valoperAddress}: UptimeProps) {
  const rpcUrl = useRpcUrl()
  const [validatorData, setValidatorData] = useState<{
    hexAddress: string
    from: string
    to: string
  } | null>(null)
  const [isLoadingValidator, setIsLoadingValidator] = useState(true)
  const [uptimeData, setUptimeData] = useState<DocumentNodeData<typeof validatorUptimeDocument> | null>(null)
  const [uptimeError, setUptimeError] = useState(false)

  const { data: metadata, isLoading: isLoadingMetadata } = useFetchOnBlock({
    query: indexerMetadataDocument,
    initialResult: null,
    initialError: false
  })

  const { data: graphqlUptimeData, error: graphqlUptimeError } = useQuery(
    validatorUptimeDocument,
    {
      variables: {
        from: validatorData?.from || '0',
        validatorHexAddress: validatorData?.hexAddress || '',
      },
      skip: !validatorData || !validatorData.hexAddress
    }
  )

  useEffect(() => {
    if (graphqlUptimeData) {
      setUptimeData(graphqlUptimeData)
      setUptimeError(false)
    }
    if (graphqlUptimeError) {
      setUptimeError(true)
    }
  }, [graphqlUptimeData, graphqlUptimeError])

  useEffect(() => {
    if (!isLoadingMetadata && metadata) {
      setIsLoadingValidator(true)
      getRawValidatorFromRpc(valoperAddress, rpcUrl)
        .then(validator => {
          if (validator) {
            const hexAddress = getHexAddressFromConsensusPubkey(validator.consensus_pubkey.key)
            const to = metadata?._metadata?.lastProcessedHeight?.toString() || '0'
            const from = (BigInt(to) - BigInt(amountOfBlocks)).toString()

            setValidatorData({ hexAddress, from, to })
          }
          setIsLoadingValidator(false)
        })
        .catch(() => {
          setIsLoadingValidator(false)
        })
    }
  }, [isLoadingMetadata, metadata, valoperAddress])

  if (isLoadingMetadata || isLoadingValidator || !validatorData) {
    return (
      <UptimeCard>
        <UptimeLoader amountOfBlocks={amountOfBlocks} />
      </UptimeCard>
    )
  }

  return (
    <ClientUptime
      initialTo={validatorData.to}
      initialFrom={validatorData.from}
      initialData={uptimeData}
      initialError={uptimeError}
      amountOfBlocks={amountOfBlocks}
      validatorHexAddress={validatorData.hexAddress}
      valoperAddress={valoperAddress}
      rpcUrl={rpcUrl}
    />
  )
}
