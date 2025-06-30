'use client'

import useFetchOnBlock, { DocumentNodeData, ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import { getProductivityVariables, productivityQuery } from '@/app/dashboards/services/operations'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BaseLineBarChart from '@/app/Charts/BaseLineBarChart/BaseLineBarChart'
import ServicesSelector from '@/app/dashboards/services/Productivity/ServicesSelector/ServicesSelector'
import { setCookie } from '@/app/utils/cookies'
import { selectedServicesCookieKey } from '@/app/dashboards/services/Productivity/constants'
import useDidMountEffect from '@/app/hooks/useDidMountEffect'
import { formatAmount, formatSimpleAmount } from '@/app/utils/format'
import NoData from '@/app/components/NoData'
import { useChartType } from '@/app/Charts/ChartType'
import { useDataContext } from '@/app/context/DataContext'
import { fillChartData, LineBarItem } from '@/app/Charts/utils'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { ContentLoader } from '@/app/dashboards/services/Productivity/Loader/Loader'
import isEqual from 'lodash/isEqual'

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
  initialError: boolean
  initialSelectedServices: Array<string>
  initialData: DocumentNodeData<typeof productivityQuery>
  initialVariables: ExtractVariables<typeof productivityQuery>
}

export default function ServicesProductivityChart({
  timeSelected,
  initialData,
  initialError,
  initialVariables,
  initialSelectedServices,
}: ServicesProductivityChartProps) {
  const {chartType} = useChartType()
  const {setData, data: dataFromContext} = useDataContext<DataItem>()
  const lastVariables = useRef<ExtractVariables<typeof productivityQuery>>(initialVariables)

  const variables = useCallback((_: number, timestamp: string)=> {
    return lastVariables.current = getProductivityVariables(timestamp, timeSelected)
  }, [timeSelected])

  const { data: rawData, error, refetch, isLoading } = useFetchOnBlock({
    query: productivityQuery,
    variables,
    initialResult: initialData,
    initialError,
    updateOnNewSession: true,
  })

  const data = useMemo(() => ({
    suppliersData: JSON.parse(rawData?.suppliersData || '[]'),
    servicesProductivity: JSON.parse(rawData?.servicesProductivity || '[]'),
  }), [rawData])

  const dataByService: Record<string, Array<DataItem>> = useMemo(() => {
    const supplierDataByServiceAndPoint = data?.suppliersData?.reduce((acc, item) => {
      acc[`${item!.service_id}-${item!.date_truncated}`] = {
        amount: Number(item!.amount),
        blocks: Number(item!.blocks),
      }

      return acc
    }, {} as Record<string, {
      amount: number,
      blocks: number,
    }>)

    const dataNotFilled = data?.servicesProductivity?.reduce((acc, item) => {
      if (!acc[item!.service_id]) {
        acc[item!.service_id] = []
      }

      const blocksAmount = supplierDataByServiceAndPoint[`${item!.service_id}-${item!.date_truncated}`]?.blocks || 0
      const totalStakedSuppliers = supplierDataByServiceAndPoint[`${item!.service_id}-${item!.date_truncated}`]?.amount || 0

      let avgRelays = 0
      let avgComputedUnits = 0
      let avgClaimedUpokt = 0
      let avgStakedSuppliers = 0

      if (blocksAmount > 0 && totalStakedSuppliers > 0) {
        avgRelays = Number(((Number(item!.relays) / totalStakedSuppliers) * blocksAmount).toFixed(2))
        avgComputedUnits = Number(((Number(item!.computed_units) / totalStakedSuppliers) * blocksAmount).toFixed(2))
        avgClaimedUpokt = Number(((Number(item!.claimed_upokt) / totalStakedSuppliers) * blocksAmount).toFixed(2))
        avgStakedSuppliers = Number((totalStakedSuppliers / blocksAmount).toFixed(0))
      }

      acc[item.service_id].push({
        id: item!.service_id,
        point: item!.date_truncated,
        start_date: item!.date_truncated,
        relays: Number(item!.relays),
        computedUnits: Number(item!.computed_units),
        claimedUpokt: Number(item!.claimed_upokt),
        avgRelays,
        avgComputedUnits,
        avgClaimedUpokt,
        avgStakedSuppliers,
      })

      return acc
    }, {} as Record<string, Array<DataItem>>) || []

    return Object.entries(dataNotFilled).reduce((acc, [serviceId, data]) => ({
      ...acc,
      [serviceId]: fillChartData({
        data,
        startDate: lastVariables?.current?.startDate,
        endDate: lastVariables?.current?.endDate,
        unitToFormatDate: lastVariables?.current?.truncInterval === 'hour' ? 'hour' : 'day',
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

  const servicesWithComputedUnit = useMemo(() => {
    return Object.entries(dataByService).map(([serviceId, items]) => {
      return {
        id: serviceId,
        label: '',
        value: items.reduce((acc, item) => {
          return acc + item.computedUnits
        }, 0)
      }
    }).sort((a, b) => b.value - a.value)
  }, [dataByService])

  const [selectedServices, setSelectedServices] = useState<Array<string>>(
    initialSelectedServices.some(id => !!dataByService[id])
      ? initialSelectedServices
      : servicesWithComputedUnit.slice(0, 5).map(item => item.id)
  )

  useDidMountEffect(() => {
    const newSelection = selectedServices.some(id => !!dataByService[id])
      ? selectedServices
      : servicesWithComputedUnit.slice(0, 5).map(item => item.id)

    if (!isEqual(newSelection, selectedServices)) {
      setSelectedServices(newSelection)
    }
  }, [data])

  useEffect(() => {
    const newData = Object.entries(dataByService).reduce((acc, [serviceId,items]) => {
        if (selectedServices.includes(serviceId)) {
          return acc.concat(items)
        }
        return acc
      }, [] as Array<DataItem>)

    if (!isEqual(newData, dataFromContext)) {
      setData(newData)
    }
    // eslint-disable-next-line
  }, [dataByService, selectedServices])

  const changeSelectedServices = (services: Array<string>) => {
    setSelectedServices(services)
    setCookie(selectedServicesCookieKey, services.join(','))
  }

  const filteredDataByService: Record<string, Array<DataItem>> = useMemo(() => {
    return dataFromContext.reduce((acc, item) => {
      if (selectedServices.includes(item.id)) {
        if (acc[item.id]) {
          acc[item.id].push(item)
        } else {
          acc[item.id] = [item]
        }
      }

      return acc
    }, {} as Record<string, Array<DataItem>> )
  }, [dataFromContext, selectedServices])

  const component: React.ReactNode = useMemo(() => {
    let content: React.ReactNode

    if (isLoading) {
      content = (
        <ContentLoader chartType={chartType} />
      )
    } else if (error) {
      content = (
        <div className={'mt-[-40px] flex w-full grow'}>
          <BaseRetryError
            onRetry={refetch}
          />
        </div>
      )
    } else {
      if (servicesWithComputedUnit.length === 0) {
        content = (
          <div className={'mt-[-40px] flex w-full items-center justify-center'}>
            <NoData label={'No data available in the time selected.'} />
          </div>
        )
      } else {
        content = (
          <>
            <div className={'order-2 md:order-1 w-full md:w-[calc(100%-260px-16px)] h-full'}>
              <BaseLineBarChart
                data={filteredDataByService}
                yAxisKey={'avgComputedUnits'}
                yAxisLabel={'Avg Computed Units'}
                chartType={chartType}
                unitToFormatDate={lastVariables?.current?.truncInterval === 'hour' ? 'hour' : 'day'}
                getTooltipLabel={(item) => [
                  `Service: ${item.id}`,
                  `Relays:  ${formatSimpleAmount(item.relays)}`,
                  `Computed Units:  ${formatSimpleAmount(item.computedUnits)}`,
                  `Claimed:  ${formatAmount({ amount: item.claimedUpokt, denom: 'upokt' })}`,
                  `Avg Relays:  ${formatSimpleAmount(item.avgRelays)}`,
                  `Avg Computed Units:  ${formatSimpleAmount(item.avgComputedUnits)}`,
                  `Avg Claimed:  ${formatAmount({ amount: item.avgClaimedUpokt, denom: 'upokt' })}`,
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
        )
      }
    }

    return content
    // eslint-disable-next-line
  }, [filteredDataByService, chartType, isLoading, error, selectedServices])

  return (
    <div className={'flex flex-col md:flex-row items-center px-4 pt-2 pb-4 h-[calc(100%-44px)] gap-4'}>
      {component}
    </div>
  )
}
