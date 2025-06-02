'use client'

import useFetchOnBlock, { DocumentNodeData, ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import { getProductivityVariables, productivityQuery } from '@/app/dashboards/services/operations'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BaseLineBarChart from '@/app/Charts/BaseLineBarChart/BaseLineBarChart'
import ServicesSelector from '@/app/dashboards/services/Productivity/ServicesSelector/ServicesSelector'
import { setCookie } from '@/app/utils/cookies'
import { selectedServicesCookieKey } from '@/app/dashboards/services/Productivity/constants'
import useDidMountEffect from '@/app/hooks/useDidMountEffect'
import { formatAmount, formatSimpleAmount } from '@/app/utils/format'
import NoData from '@/app/components/NoData'
import { useChartType } from '@/app/dashboards/services/Productivity/ChartType'
import { useDataContext } from '@/app/context/DataContext'
import { fillChartData, LineBarItem } from '@/app/Charts/utils'

export interface DataItem extends LineBarItem {
  relays: number
  computedUnits: number
  claimedUpokt: number
  avgRelays: number
  avgComputedUnits: number
  avgClaimedUpokt: number
  avgStakedSuppliers: number
}


interface ServicesProductivityChartProps {
  timeSelected: string
  initialSelectedServices: Array<string>
  initialData: DocumentNodeData<typeof productivityQuery>
  initialVariables: ExtractVariables<typeof productivityQuery>
}

export default function ServicesProductivityChart({
  timeSelected,
  initialData,
  initialVariables,
  initialSelectedServices,
}: ServicesProductivityChartProps) {
  const {chartType} = useChartType()
  const {setData} = useDataContext()
  const lastVariables = useRef<ExtractVariables<typeof productivityQuery>>(initialVariables)

  const variables = useCallback((_: number, timestamp: string)=> {
    return lastVariables.current = getProductivityVariables(timestamp, timeSelected)
  }, [timeSelected])

  const data = useFetchOnBlock({
    query: productivityQuery,
    variables,
    initialResult: initialData
  })

  const dataByService: Record<string, Array<DataItem>> = useMemo(() => {
    const supplierDataByServiceAndPoint = data?.suppliersData?.nodes?.reduce((acc, item) => {
      acc[`${item!.serviceId}-${item!.point}`] = {
        amount: Number(item!.amount),
        blocks: Number(item!.blocks),
      }

      return acc
    }, {} as Record<string, {
      amount: number,
      blocks: number,
    }>)

    const dataNotFilled = data?.servicesProductivity?.nodes?.reduce((acc, item) => {
      if (!acc[item!.serviceId]) {
        acc[item!.serviceId] = []
      }

      const blocksAmount = supplierDataByServiceAndPoint[`${item!.serviceId}-${item!.point}`]?.blocks || 0
      const totalStakedSuppliers = supplierDataByServiceAndPoint[`${item!.serviceId}-${item!.point}`]?.amount || 0

      let avgRelays = 0
      let avgComputedUnits = 0
      let avgClaimedUpokt = 0
      let avgStakedSuppliers = 0

      if (blocksAmount > 0 && totalStakedSuppliers > 0) {
        avgRelays = (Number(item!.relays) / totalStakedSuppliers) * blocksAmount
        avgComputedUnits = (Number(item!.computedUnits) / totalStakedSuppliers) * blocksAmount
        avgClaimedUpokt = (Number(item!.claimedUpokt) / totalStakedSuppliers) * blocksAmount
        avgStakedSuppliers = totalStakedSuppliers / blocksAmount
      }

      acc[item.serviceId].push({
        id: item!.serviceId,
        point: item!.point,
        start_date: item!.point,
        relays: Number(item!.relays),
        computedUnits: Number(item!.computedUnits),
        claimedUpokt: Number(item!.claimedUpokt),
        avgRelays,
        avgComputedUnits,
        avgClaimedUpokt,
        avgStakedSuppliers,
      })

      return acc
    }, {} as Record<string, Array<DataItem>>)

    return Object.entries(dataNotFilled).reduce((acc, [serviceId, data]) => ({
      ...acc,
      [serviceId]: fillChartData({
        data,
        startDate: lastVariables.current.startDate,
        endDate: lastVariables.current.endDate,
        unitToFormatDate: lastVariables.current.truncInterval === 'day' ? 'day' : 'hour',
        defaultProps: {
          id: serviceId,
          relays: 0,
          computedUnits: 0,
          claimedUpokt: 0,
          avgRelays: 0,
          avgComputedUnits: 0,
          avgClaimedUpokt: 0,
          avgStakedSuppliers: 0,
        }
      })
    }), {})
  }, [data])

  const servicesWithComputedUnit = Object.entries(dataByService).map(([serviceId, items]) => {
    return {
      id: serviceId,
      label: '',
      value: items.reduce((acc, item) => {
        return acc + item.computedUnits
      }, 0)
    }
  }).sort((a, b) => b.value - a.value)

  const [selectedServices, setSelectedServices] = useState<Array<string>>(
    initialSelectedServices.some(id => !!dataByService[id])
      ? initialSelectedServices
      : servicesWithComputedUnit.slice(0, 5).map(item => item.id)
  )

  useDidMountEffect(() => {
    setSelectedServices(
      initialSelectedServices.some(id => !!dataByService[id])
        ? initialSelectedServices
        : servicesWithComputedUnit.slice(0, 5).map(item => item.id)
    )
  }, [data])

  useEffect(() => {
    setData(
      Object.entries(dataByService).reduce((acc, [serviceId,items]) => {
        if (selectedServices.includes(serviceId)) {
          return acc.concat(items)
        }
        return acc
      }, [] as Array<DataItem>)
    )
    // eslint-disable-next-line
  }, [dataByService, selectedServices])

  const changeSelectedServices = (services: Array<string>) => {
    setSelectedServices(services)
    setCookie(selectedServicesCookieKey, services.join(','))
  }

  const filteredDataByService: Record<string, Array<DataItem>> = selectedServices.reduce((acc, serviceId) => ({
    ...acc,
    [serviceId]: dataByService[serviceId] || []
  }), {})

  return (
    <div className={'flex flex-col md:flex-row items-center px-4 pt-2 pb-4 h-[calc(100%-44px)] gap-4'}>
      {servicesWithComputedUnit.length === 0 ? (
        <div className={'mt-[-40px] flex w-full items-center justify-center'}>
          <NoData label={'No data available in the time selected.'} />
        </div>
      ) : (
        <>
          <div className={'order-2 md:order-1 w-full md:w-[calc(100%-260px-16px)] h-full'}>
            <BaseLineBarChart
              data={filteredDataByService}
              yAxisKey={'avgComputedUnits'}
              yAxisLabel={'Avg Computed Units'}
              chartType={chartType}
              unitToFormatDate={lastVariables.current.truncInterval === 'day' ? 'day' : 'hour'}
              getTooltipLabel={(item) => [
                `Service: ${item.id}`,
                `Relays:  ${formatSimpleAmount(item.relays)}`,
                `Computed Units:  ${formatSimpleAmount(item.computedUnits)}`,
                `Claimed:  ${formatAmount({ amount: item.claimedUpokt, denom: 'upokt' })}`,
                `Relays:  ${formatSimpleAmount(item.avgRelays)}`,
                `Computed Units:  ${formatSimpleAmount(item.avgComputedUnits)}`,
                `Claimed:  ${formatAmount({ amount: item.avgClaimedUpokt, denom: 'upokt' })}`,
                `Avg Suppliers:  ${formatSimpleAmount(item.avgStakedSuppliers)}`,
              ]}
            />
          </div>
          <div className={'h-[260px] md:h-[calc(100%-16px)] w-full md:min-w-[260px] md:w-[260px] order-1 md:order-2'}>
            <ServicesSelector
              data={servicesWithComputedUnit}
              servicesSelected={selectedServices}
              changeSelectedServices={changeSelectedServices}
            />
          </div>
        </>
      )}
    </div>
  )
}
