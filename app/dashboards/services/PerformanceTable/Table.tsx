'use client'

import {
  getServicesPerformanceVariables,
  servicesPerformanceDocument,
} from '@/app/dashboards/services/operations'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import Big from 'big.js'
import { calculatePercentage } from '@/app/utils/calculate'
import { formatAmount, formatSimpleAmount } from '@/app/utils/format'
import BaseTable from '@/app/components/BaseTable'
import NoData from '@/app/components/NoData'
import columns, { ServicePerformanceRow } from './columns'
import { useDataContext } from '@/app/context/DataContext'
import { BaseRetryError } from '@/app/components/ErrorBoundary'

interface PerformanceTableProps {
  initialData: DocumentNodeData<typeof servicesPerformanceDocument>
  timeSelected: string
  initialError: boolean
}

export default function PerformanceTable({initialData, initialError, timeSelected}: PerformanceTableProps) {
  const {setData} = useDataContext<ServicePerformanceRow>()

  const latestVariablesRef = useRef<ReturnType<typeof getServicesPerformanceVariables> | null>(null)
  const variables = useCallback((_: number, currentTime: string) => {
    return latestVariablesRef.current = getServicesPerformanceVariables(currentTime, timeSelected)
  }, [timeSelected])

  const { data, error, refetch, isLoading } = useFetchOnBlock({
    query: servicesPerformanceDocument,
    variables,
    initialResult: initialData,
    initialError,
    updateOnNewSession: true,
  })

  const rows: Array<ServicePerformanceRow> = useMemo(() => {
    if (!data) return []
    const avgDataByServiceId = data.avgData?.reduce((acc, item) => ({
      ...acc,
      [item.service_id]: {
        blocks: item.blocks,
        suppliersStaked: item.suppliers_staked,
      },
    }), {}) || {}

    const totalComputedUnits = data.performance?.reduce((acc, item) => acc.add(new Big(item.computed_units)), new Big(0)) || new Big(0)

    return  data.performance?.map((item) => {
      const avgData = avgDataByServiceId[item.service_id]

      const rawEarnAvg = !avgData ? 0 : new Big(item.claimed_upokt).div(avgData.suppliersStaked).mul(avgData.blocks).toNumber()

      return {
        id: item.service_id,
        serviceId: item.service_id,
        serviceName: item.service_name,
        change: item.change * 100,
        earnAvg: formatAmount({
          amount: rawEarnAvg,
          denom: 'upokt'
        }),
        raw_earnAvg: rawEarnAvg,
        relays: formatSimpleAmount(item.relays),
        raw_relays: item.relays,
        computedUnits: formatSimpleAmount(item.computed_units),
        raw_computedUnits: item.computed_units,
        stakedApps: formatSimpleAmount(item.apps_staked),
        raw_stakedApps: item.apps_staked,
        stakedNodes: formatSimpleAmount(item.suppliers_staked),
        raw_stakedNodes: item.suppliers_staked,
        totalEarn: formatAmount({ amount: item.claimed_upokt, denom: 'upokt' }),
        raw_totalEarn: item.claimed_upokt,
        network: calculatePercentage(
          new Big(item.computed_units),
          totalComputedUnits
        ),
      } as Omit<ServicePerformanceRow, 'network'>
    }) || []
  }, [data])

  useEffect(() => {
    setData(rows)
    // eslint-disable-next-line
  }, [rows])

  if (isLoading) {
    return (
      <BaseTable columns={columns} rows={[]} isLoading={true} />
    )
  } else if (error) {
    return (
      <div className={'flex grow pb-10'}>
        <BaseRetryError
          onRetry={refetch}
        />
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <NoData label={'No data available in the time selected.'} />
    )
  }

  return (
    <BaseTable columns={columns} rows={rows}  />
  )
}
