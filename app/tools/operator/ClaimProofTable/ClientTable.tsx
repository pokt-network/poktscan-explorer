'use client'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import {
  getDataByDelegatorAddressesAndBlocksDocument, getDataByDelegatorAddressesAndTimesDocument,
  getDataByDelegatorAddressesAndTimesVariables,
  getParamsDocument,
} from '@/app/tools/operator/operations'
import { useDataContext } from '@/app/context/DataContext'
import columns, { DataByDelegatorRow } from '@/app/tools/operator/columns'
import { useLazyQuery } from '@apollo/client'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { formatSimpleAmount, formatUpokt } from '@/app/utils/format'
import NoData from '@/app/components/NoData'
import BaseTable from '@/app/components/BaseTable'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { TimeClaimProofTable } from '@/app/tools/operator/constants'
import { useSelectedAddresses } from '@/app/tools/SelectedAddresses'
import { useMultipleOptionContext } from '@/app/context/MultipleOptionContext'

interface ClientLastClaimingWindowTableProps {
  initialError: boolean
  initialData: DocumentNodeData<typeof getDataByDelegatorAddressesAndBlocksDocument>
  addresses: Array<string>,
}

export default function ClientLastClaimingWindowTable({
  addresses: initialAddresses,
  initialData,
  initialError,
}: ClientLastClaimingWindowTableProps) {
  const {setData} = useDataContext<DataByDelegatorRow>()
  const {addresses} = useSelectedAddresses()
  const {selectedValue: selectedTime} = useMultipleOptionContext<TimeClaimProofTable>()

  const [getData] = useLazyQuery(
    getDataByDelegatorAddressesAndBlocksDocument,
  )

  const lastBlockRef = useRef<number | null>(null)

  const variables = useCallback((height: number, currentTime: string) => {
    if (selectedTime === TimeClaimProofTable.LastClaimingWindow) {
      lastBlockRef.current = height
      return undefined
    } else {
      return getDataByDelegatorAddressesAndTimesVariables(addresses || initialAddresses, currentTime, selectedTime)
    }
  }, [selectedTime, addresses, initialAddresses])

  const resultParser = useCallback(async (paramsData) => {
    const claimWindowCloseOffsetBlocks = paramsData?.params?.nodes?.find(n => n.key === 'claim_window_close_offset_blocks')?.value
    const claimWindowOpenOffsetBlocks = paramsData?.params?.nodes?.find(n => n.key === 'claim_window_open_offset_blocks')?.value
    const proofWindowCloseOffsetBlocks = paramsData?.params?.nodes?.find(n => n.key === 'proof_window_close_offset_blocks')?.value

    const window = Number(claimWindowCloseOffsetBlocks || 0) + Number(claimWindowOpenOffsetBlocks || 0) + Number(proofWindowCloseOffsetBlocks || 0)

    const endHeight = BigInt(lastBlockRef.current)
    const startHeight = endHeight - BigInt(window)

    const {data: finalData} = await getData({
      variables: {
        delegatorAddresses: addresses,
        startBlock: startHeight.toString() || '0',
        endBlock: endHeight.toString() || '0',
      }
    })

    return finalData
  }, [addresses, getData])

  const { data, error, refetch, isLoading } = useFetchOnBlock({
    variables,
    query: selectedTime === TimeClaimProofTable.LastClaimingWindow ? getParamsDocument : getDataByDelegatorAddressesAndTimesDocument,
    initialError,
    initialResult: initialData,
    resultParser: selectedTime === TimeClaimProofTable.LastClaimingWindow ? resultParser : undefined,
  })

  const rows: Array<DataByDelegatorRow> = useMemo(() => {
    return data?.data?.filter(item => {
      const fields = Object.keys(item).filter(key => key !== 'address')

      return !fields.every(field => item[field] === 0)
    })?.map(item => ({
      id: item.address,
      delegatorAddress: item.address,
      slashed: formatUpokt({
        amount: item.slashed,
      }),
      proofPokt: formatUpokt({
        amount: item.proof_upokt,
      }),
      proofRelays: formatSimpleAmount(item.proof_relays),
      proofComputedUnits: formatSimpleAmount(item.proof_computed_units),
      proofAmount: formatSimpleAmount(item.proof_amount),

      proof_computed_units: item.proof_computed_units,

      claimPokt: formatUpokt({
        amount: item.claim_upokt,
      }),
      claimRelays: formatSimpleAmount(item.claim_relays),
      claimComputedUnits: formatSimpleAmount(item.claim_computed_units),
      claimAmount: formatSimpleAmount(item.claim_amount),
    }))
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

  if (isLoading) {
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
