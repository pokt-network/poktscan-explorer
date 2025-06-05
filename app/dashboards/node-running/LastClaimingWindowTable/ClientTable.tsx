'use client'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import {
  getDataByDelegatorAddressesAndBlocksDocument,
  getParamsDocument,
} from '@/app/dashboards/node-running/operations'
import { useDataContext } from '@/app/context/DataContext'
import columns, { DataByDelegatorRow } from '@/app/dashboards/node-running/columns'
import { useLazyQuery } from '@apollo/client'
import React, { useEffect, useMemo, useRef, useCallback } from 'react'
import { formatSimpleAmount, formatUpokt } from '@/app/utils/format'
import NoData from '@/app/components/NoData'
import BaseTable from '@/app/components/BaseTable'

interface ClientLastClaimingWindowTableProps {
  initialData: DocumentNodeData<typeof getDataByDelegatorAddressesAndBlocksDocument>
  addresses: Array<string>
}

export default function ClientLastClaimingWindowTable({
  addresses,
  initialData
}: ClientLastClaimingWindowTableProps) {
  const {setData} = useDataContext<DataByDelegatorRow>()

  const [getData] = useLazyQuery(
    getDataByDelegatorAddressesAndBlocksDocument,
  )

  const lastBlockRef = useRef<number | null>(null)

  const variables = useCallback((height: number) => {
    lastBlockRef.current = height
    return undefined
  }, [])

  const data = useFetchOnBlock({
    variables,
    query: getParamsDocument,
    initialResult: initialData,
    resultParser: async (paramsData) => {
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
    }
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

  if (rows.length === 0) {
    return (
      <NoData label={'No data for the selected addresses and time.'} />
    )
  }

  return (
    <>
      <BaseTable columns={columns} rows={rows} />
    </>
  )
}
