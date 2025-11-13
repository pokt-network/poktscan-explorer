'use client'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import {
  getDataByDelegatorAddressesAndBlocksDocument, getDataByDelegatorAddressesAndTimesDocument,
  getDataByDelegatorAddressesAndTimesVariables,
} from '@/app/tools/operator/operations'
import { useDataContext } from '@/app/context/DataContext'
import columns, { DataByDelegatorRow } from '@/app/tools/operator/columns'
import React, { useCallback, useEffect, useMemo } from 'react'
import { convertUpoktToPokt, formatSimpleAmount, formatUpokt } from '@/app/utils/format'
import NoData from '@/app/components/NoData'
import BaseTable from '@/app/components/BaseTable'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { useSelectedAddresses } from '@/app/tools/SelectedAddresses'
import { useSelectedTime } from '@/app/Charts/SelectedTime'

interface ClientLastClaimingWindowTableProps {
  initialError: boolean
  initialData: DocumentNodeData<typeof getDataByDelegatorAddressesAndBlocksDocument> | null
  addresses: Array<string>,
}

export default function ClientLastClaimingWindowTable({
  addresses: initialAddresses,
  initialData,
  initialError,
}: ClientLastClaimingWindowTableProps) {
  const {setData} = useDataContext<DataByDelegatorRow>()
  const {addresses} = useSelectedAddresses()
  const {selectedTime} = useSelectedTime()

  const variables = useCallback((height: number, currentTime: string) => {
    return getDataByDelegatorAddressesAndTimesVariables(addresses || initialAddresses, currentTime, selectedTime)
  }, [selectedTime, addresses, initialAddresses])

  const { data, error, refetch, isLoading } = useFetchOnBlock({
    variables,
    query: getDataByDelegatorAddressesAndTimesDocument,
    initialError,
    initialResult: initialData,
    updateOnNewSession: true,
  })

  const rows: Array<DataByDelegatorRow> = useMemo(() => {
    return data?.data?.filter(item => {
      const fields = Object.keys(item).filter(key => key !== 'address')

      return !fields.every(field => item[field] === 0)
    })?.map(item => ({
      id: item.address,
      delegatorAddress: item.address,
      raw_slashed: convertUpoktToPokt(item.slashed),
      slashed: formatUpokt({
        amount: item.slashed,
      }),
      raw_proofPokt: convertUpoktToPokt(item.proof_upokt),
      proofPokt: formatUpokt({
        amount: item.proof_upokt,
      }),
      raw_proofRelays: item.proof_relays,
      proofRelays: formatSimpleAmount(item.proof_relays),
      raw_proofComputedUnits: item.proof_computed_units,
      proofComputedUnits: formatSimpleAmount(item.proof_computed_units),
      raw_proofAmount: item.proof_amount,
      proofAmount: formatSimpleAmount(item.proof_amount),

      raw_claimPokt: convertUpoktToPokt(item.claim_upokt),
      claimPokt: formatUpokt({
        amount: item.claim_upokt,
      }),
      raw_claimRelays: item.claim_relays,
      claimRelays: formatSimpleAmount(item.claim_relays),
      raw_claimComputedUnits: item.claim_computed_units,
      claimComputedUnits: formatSimpleAmount(item.claim_computed_units),
      raw_claimAmount: item.claim_amount,
      claimAmount: formatSimpleAmount(item.claim_amount),
    } as DataByDelegatorRow ))
      .sort((a, b) => b.proof_computed_units - a.proof_computed_units) || []
  }, [data])

  useEffect(() => {
    setData(rows)
    // eslint-disable-next-line
  }, [rows])

  if (!addresses.length) {
    return (
      <NoData label={'Select addresses to see the data.'} />
    )
  }

  if (isLoading || (!data && !error)) {
    return (
      <BaseTable columns={columns} rows={rows} isLoading={true} />
    )
  } else if (error) {
    return (
      <div className={'flex pb-10 grow'}>
        <BaseRetryError
          onRetry={refetch}
        />
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <NoData label={'No data for the selected addresses and time.'} />
    )
  }

  return (
    <BaseTable columns={columns} rows={rows} />
  )
}
