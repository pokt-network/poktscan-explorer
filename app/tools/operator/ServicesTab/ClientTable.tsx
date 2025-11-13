'use client'

import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import {
  getDataByDelegatorAddressesAndTimesVariables,
  rewardsByServicesDocument,
} from '@/app/tools/operator/operations'
import { rewardsByServiceColumns, RewardsByServiceRow } from '@/app/tools/operator/ServicesTab/columns'
import { useDataContext } from '@/app/context/DataContext'
import { useSelectedAddresses } from '@/app/tools/SelectedAddresses'
import { useSelectedTime } from '@/app/Charts/SelectedTime'
import React, { useCallback, useEffect, useMemo } from 'react'
import { convertUpoktToPokt, formatSimpleAmount, formatUpokt } from '@/app/utils/format'
import orderBy from 'lodash/orderBy'
import NoData from '@/app/components/NoData'
import BaseTable from '@/app/components/BaseTable'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { DataByDelegatorRow } from '@/app/tools/operator/columns'

interface ClientRewardsByServiceTableProps {
  initialError: boolean
  initialData: DocumentNodeData<typeof rewardsByServicesDocument> | null
  addresses: Array<string>
}

export default function ClientRewardsByServiceTable({
  initialError,
  initialData,
  addresses: initialAddresses,
}: ClientRewardsByServiceTableProps) {
  const {setData} = useDataContext<DataByDelegatorRow>()
  const {addresses} = useSelectedAddresses()
  const {selectedTime} = useSelectedTime()

  const variables = useCallback((height: number, currentTime: string) => {
    return getDataByDelegatorAddressesAndTimesVariables(addresses || initialAddresses, currentTime, selectedTime)
  }, [selectedTime, addresses, initialAddresses])

  const { data, error, refetch, isLoading } = useFetchOnBlock({
    variables,
    query: rewardsByServicesDocument,
    initialError,
    initialResult: initialData,
    updateOnNewSession: true,
  })

  const rows: Array<RewardsByServiceRow> = useMemo(() => orderBy(data?.data?.map(item => ({
    id: item.service_id,
    relays: formatSimpleAmount(item.relays),
    raw_relays: item.relays,
    computedUnits: formatSimpleAmount(item.computed_units),
    raw_computedUnits: item.computed_units,
    grossRewards: formatUpokt({amount: item.gross_rewards}),
    raw_grossRewards: convertUpoktToPokt(item.gross_rewards),
    netRewards: formatUpokt({amount: item.net_rewards}),
    raw_netRewards: convertUpoktToPokt(item.net_rewards),
  } as RewardsByServiceRow)) || [], ['raw_computedUnits'], ['desc']), [data])

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
      <BaseTable columns={rewardsByServiceColumns} rows={rows} isLoading={true} />
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
    <BaseTable columns={rewardsByServiceColumns} rows={rows} />
  )
}
