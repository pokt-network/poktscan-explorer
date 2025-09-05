import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { useCallback, useMemo, useRef } from 'react'
import useFetchOnBlock, { ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import { fillChartData, LineBarItem, normalizeIsoDate } from '@/app/Charts/utils'

interface ClaimProofData<T extends TypedDocumentNode> {
  document: T
  variables: (timestamp: string) => ExtractVariables<T>
}

type RawData = {
  data: Array<{
    date: string
    claim_upokt: number
    proof_upokt: number
    claim_amount: number
    claim_relays: number
    proof_amount: number
    proof_relays: number
    expired_proof_upokt: number
    claim_computed_units: number
    expired_proof_amount: number
    expired_proof_relays: number
    proof_computed_units: number
    expired_proof_computed_units: number
  }>
} | null

export interface Item extends LineBarItem {
  start_date: string
  claim_upokt: number
  proof_upokt: number
  claim_amount: number
  claim_relays: number
  proof_amount: number
  proof_relays: number
  expired_proof_upokt: number
  claim_computed_units: number
  expired_proof_amount: number
  expired_proof_relays: number
  proof_computed_units: number
  expired_proof_computed_units: number
}

export default function useClaimProofData<T extends TypedDocumentNode<any, any>>({
  document,
  variables: variablesFromProps
}: ClaimProofData<T>) {
  const lastVariablesRef = useRef<ExtractVariables<T> | null>(null)
  const variables = useCallback((_: number, timestamp: string) => {
    return lastVariablesRef.current = variablesFromProps(timestamp)
  }, [variablesFromProps])

  const {refetch, data, error, isLoading} = useFetchOnBlock({
    query: document,
    variables,
    initialResult: null as RawData,
    initialError: false,
    updateOnNewSession: true,
  })

  const processedData: Array<Item> = useMemo(() => {
    if (!data) return []

    return fillChartData({
      data: (data?.data || []).map((item) => ({
        id: '',
        start_date: normalizeIsoDate(item.date),
        point: normalizeIsoDate(item.date),
        claim_upokt: item.claim_upokt,
        proof_upokt: item.proof_upokt,
        claim_amount: item.claim_amount,
        claim_relays: item.claim_relays,
        proof_amount: item.proof_amount,
        proof_relays: item.proof_relays,
        expired_proof_upokt: item.expired_proof_upokt,
        claim_computed_units: item.claim_computed_units,
        expired_proof_amount: item.expired_proof_amount,
        expired_proof_relays: item.expired_proof_relays,
        proof_computed_units: item.proof_computed_units,
        expired_proof_computed_units: item.expired_proof_computed_units,
      })),
      defaultProps: {
        claim_upokt: 0,
        proof_upokt: 0,
        claim_amount: 0,
        claim_relays: 0,
        proof_amount: 0,
        proof_relays: 0,
        expired_proof_upokt: 0,
        claim_computed_units: 0,
        expired_proof_amount: 0,
        expired_proof_relays: 0,
        proof_computed_units: 0,
        expired_proof_computed_units: 0,
      },
      startDate: lastVariablesRef.current?.startDate || '',
      endDate: lastVariablesRef.current?.endDate || '',
      unitToFormatDate: lastVariablesRef.current?.truncInterval || 'day'
    })

  }, [data])

  return {
    data: processedData,
    refetch,
    error,
    isLoading: isLoading || (!data && !error),
  }
}
