'use client'

import { getServicesPerformanceVariables, servicesPerformanceDocument } from '@/app/dashboards/services/operations'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { useCallback, useEffect, useMemo } from 'react'
import Big from 'big.js'
import { calculatePercentage, calculatePercentageChange } from '@/app/utils/calculate'
import { formatAmount, formatSimpleAmount } from '@/app/utils/format'
import BaseTable from '@/app/components/BaseTable'
import NoData from '@/app/components/NoData'
import columns, { ServicePerformanceRow } from './columns'
import { useDataContext } from '@/app/context/DataContext'

interface PerformanceTableProps {
  initialData: DocumentNodeData<typeof servicesPerformanceDocument>
  timeSelected: string
}

export default function PerformanceTable({initialData, timeSelected}: PerformanceTableProps) {
  const {setData} = useDataContext<ServicePerformanceRow>()

  const variables = useCallback((_: number, currentTime: string) => getServicesPerformanceVariables(currentTime, timeSelected), [timeSelected])

  const data = useFetchOnBlock({
    query: servicesPerformanceDocument,
    variables,
    initialResult: initialData
  })

  const rows: Array<ServicePerformanceRow> = useMemo(() => {
    const previousComputedUnitsPerService = data?.previousData?.groupedAggregates?.reduce((acc, item) => {
      if (!item.keys) {
        return acc
      }

      const serviceId = item.keys.at(0)

      if (!serviceId) {
        return acc
      }

      acc[serviceId] = new Big(item.sum!.computedUnits).add(acc[serviceId] || 0)

      return acc
    }, {} as Record<string, Big>) || {}

    let totalComputedUnits = new Big(0)

    const currentComputedUnitsPerService = data?.currentData?.groupedAggregates?.reduce((acc, item) => {
      if (!item.keys) {
        return acc
      }

      const serviceId = item.keys.at(0)

      if (!serviceId) {
        return acc
      }

      if (!acc[serviceId]) {
        acc[serviceId] = {
          claimedUpokt: new Big(0),
          computedUnits: new Big(0),
          relays: new Big(0)
        }
      }

      acc[serviceId].computedUnits = new Big(item.sum!.computedUnits).add(acc[serviceId].computedUnits || 0)
      acc[serviceId].claimedUpokt = new Big(item.sum!.claimedUpokt).add(acc[serviceId].claimedUpokt || 0)
      acc[serviceId].relays = new Big(item.sum!.relays).add(acc[serviceId].relays || 0)

      totalComputedUnits = totalComputedUnits.add(item.sum!.computedUnits)

      return acc
    }, {} as Record<string, {
      claimedUpokt: Big,
      computedUnits: Big,
      relays: Big
    }>) || {}

    return data?.currentData?.nodes?.map((item) => {
      const service = item!.service!

      let computedUnits = '0', relays = '0', claimedUpokt = '0', earnAvg = '0', network = 0

      if (currentComputedUnitsPerService[service.id]) {
        const sum = currentComputedUnitsPerService[service.id]

        computedUnits = sum.computedUnits.toString()
        relays = sum.relays.toString()
        claimedUpokt = sum.claimedUpokt.toString()

        const suppliersStakedDuringPeriod = new Big(service.stakedSuppliersByBlockAndServices?.aggregates?.sum?.amount || 0)
        const blocks = new Big(service.stakedSuppliersByBlockAndServices?.totalCount || 0)

        earnAvg = formatAmount({
          amount: suppliersStakedDuringPeriod.gt(0)
            ? new Big(claimedUpokt).div(suppliersStakedDuringPeriod).mul(blocks).toNumber()
            : 0,
          denom: 'upokt'
        })

        network = calculatePercentage(
          sum.computedUnits,
          totalComputedUnits
        )
      }

      const currentComputedUnits = new Big(computedUnits)
      totalComputedUnits = totalComputedUnits.add(currentComputedUnits)

      return {
        id: service!.id,
        serviceId: service!.id,
        serviceName: service!.name,
        stakedApps: service?.stakedApps?.totalCount || 0,
        stakedNodes: service?.stakedSuppliers.totalCount || 0,
        computedUnits: formatSimpleAmount(computedUnits),
        relays: formatSimpleAmount(relays),
        change: calculatePercentageChange(
          currentComputedUnits,
          previousComputedUnitsPerService[service!.id] || new Big(0)
        ),
        network,
        earnAvg,
      }
    }).sort((a, b) => b.network - a.network) || []
  }, [data])

  useEffect(() => {
    setData(rows)
    // eslint-disable-next-line
  }, [rows])

  if (rows.length === 0) {
    return (
      <NoData label={'No data available in the time selected.'} />
    )
  }

  return (
    <BaseTable columns={columns} rows={rows} />
  )
}
