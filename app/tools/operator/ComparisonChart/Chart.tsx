'use client'

import { useCallback, useEffect, useMemo, } from 'react'
import {
  claimProofByAddressesAndTimesDocument,
  claimProofByAddressesAndTimesVariables,
} from '@/app/tools/operator/operations'
import useClaimProofData from '@/app/hooks/useClaimProofData'
import { useSelectedAddresses } from '@/app/tools/SelectedAddresses'
import ClaimProofExpiredChart, { ChartItem } from '@/app/Charts/ClaimProofExpiredChart'
import { useSelectedTime } from '@/app/Charts/SelectedTime'
import { useDataContext } from '@/app/context/DataContext'

function useClaimProofDataByDelegator() {
  const {setData} = useDataContext()
  const {addresses} = useSelectedAddresses()
  const {selectedTime} = useSelectedTime()

  const variables = useCallback((timestamp: string) => claimProofByAddressesAndTimesVariables(
    addresses,
    timestamp,
    selectedTime,
  ), [addresses, selectedTime])

  const {data, refetch, isLoading, error} = useClaimProofData({
    variables,
    document: claimProofByAddressesAndTimesDocument,
  })

  useEffect(() => {
    setData(data || [])
    // eslint-disable-next-line
  }, [data])

  const processedData = useMemo(() => {
    const expired: Array<ChartItem> = [],
      proofs: Array<ChartItem> = [],
      claims: Array<ChartItem> = []

    for (const datum of data) {
      expired.push({
        id: 'expired',
        start_date: datum.start_date,
        point: datum.point,
        amount: datum.expired_proof_amount,
        relays: datum.expired_proof_relays,
        upokt: datum.expired_proof_upokt,
        computedUnits: datum.expired_proof_computed_units,
      })

      proofs.push({
        id: 'proof',
        start_date: datum.start_date,
        point: datum.point,
        amount: datum.proof_amount,
        relays: datum.proof_relays,
        upokt: datum.proof_upokt,
        computedUnits: datum.proof_computed_units,
      })

      claims.push({
        id: 'claim',
        start_date: datum.start_date,
        point: datum.point,
        amount: datum.claim_amount,
        relays: datum.claim_relays,
        upokt: datum.claim_upokt,
        computedUnits: datum.claim_computed_units,
      })
    }

    return {
      claims,
      proofs,
      expired,
    }
  }, [data])

  return {
    data: processedData,
    refetch,
    isLoading,
    error,
  }
}

export default function ClaimProofChartByDelegator() {
  const {data, refetch, isLoading, error} = useClaimProofDataByDelegator()

  return (
    <ClaimProofExpiredChart
      data={data}
      isLoading={isLoading}
      refetch={refetch}
      error={error}
      onlyShowAmountInTooltip={false}
    />
  )
}
