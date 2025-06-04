'use client'

import {
  getDataByDelegatorAddressesAndTimesDocument,
  getDataByDelegatorAddressesAndTimesVariables,
} from '@/app/dashboards/node-running/operations'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { useDataContext } from '@/app/context/DataContext'
import columns, { DataByDelegatorRow } from '@/app/dashboards/node-running/columns'
import React, { useCallback, useEffect, useMemo } from 'react'
import { formatSimpleAmount, formatUpokt } from '@/app/utils/format'
import NoData from '@/app/components/NoData'
import BaseTable from '@/app/components/BaseTable'

interface ClientByTimeTableProps {
  initialData: DocumentNodeData<typeof getDataByDelegatorAddressesAndTimesDocument>
  timeSelected: string
  addresses: Array<string>
}

export default function ClientByTimeTable({
  initialData,
  timeSelected,
  addresses,
}: ClientByTimeTableProps) {
  const {setData} = useDataContext<DataByDelegatorRow>()

  const variables = useCallback((_: number, currentTime: string) => getDataByDelegatorAddressesAndTimesVariables(addresses, currentTime, timeSelected), [addresses, timeSelected])

  const data = useFetchOnBlock({
    query: getDataByDelegatorAddressesAndTimesDocument,
    variables,
    initialResult: initialData,
  })

  const rows: Array<DataByDelegatorRow> = useMemo(() => {
    return data?.data?.filter(item => {
      const fields = Object.keys(item).filter(key => key !== 'address')

      return !fields.every(field => item[field] === 0)
    }).map(item => ({
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
    })).sort((a, b) => b.proof_computed_units - a.proof_computed_units) || []
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
    <BaseTable columns={columns} rows={rows}  />
  )
}
