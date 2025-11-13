'use client'
import CommonLineChart, { CommonLineChartProps } from '@/app/(home)/CommonLineChart'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import React, { useCallback, useMemo } from 'react'
import { getEvolutionVariables } from '@/app/(home)/utils'
import { newEvolutionDocument } from '@/app/(home)/operations'
import EvolutionChartsLoader from '@/app/(home)/EvolutionCharts/Loader'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { fillChartData, formatDate, LineBarItem, normalizeIsoDate } from '@/app/Charts/utils'

interface CardEvolutionChartProps {
  title: string
  data: CommonLineChartProps['data']
  dataLabel: string
  valuesAreUPokt?: boolean
  applyMinAndMax?: boolean
}

interface EvolutionData extends LineBarItem {
  value: number
  start_date: string
}

function CardEvolutionChart({title, ...chartProps }: CardEvolutionChartProps) {
  return (
    <div className={'bg-[color:--main-background] pb-2 border-[color:--divider] border rounded-lg base-shadow'}>
      <div className={'h-[41px] p-4 flex items-center border-b border-[color:--divider]'}>
        <p className={'font-semibold text-[15px]'}>
          {title}
        </p>
      </div>
      <CommonLineChart {...chartProps} />
    </div>
  )
}

interface SupplierAndAppsEvolutionProps {
  initialData: DocumentNodeData<typeof newEvolutionDocument> | null
  initialError: boolean
}

export default function EvolutionCharts({
  initialData,
  initialError
}: SupplierAndAppsEvolutionProps) {
  const lastVariablesRef = React.useRef<ReturnType<typeof getEvolutionVariables>>()
  const variables = useCallback((_: number, currentTime: string) => {
    return lastVariablesRef.current = getEvolutionVariables(currentTime)
  }, [])

  const { data, error, isLoading, refetch } = useFetchOnBlock({
    query: newEvolutionDocument,
    variables,
    initialResult: initialData,
    initialError,
  })

  const {
    validatorsData,
    supplierData,
    supplyData,
    appsData,
  } = useMemo(() => {
    const validatorsData: Array<EvolutionData> = [],
      supplierData: Array<EvolutionData> = [],
      supplyData: Array<EvolutionData> = [],
      appsData: Array<EvolutionData> = []

    if (data) {
      for (const item of data.getLatestBlocksByDay) {
        const date = normalizeIsoDate(item.date)
        const point = formatDate(date, 'day', true)

        validatorsData.push({
          id: 'validators',
          value: Number(item.block.staked_validators),
          point: point,
          start_date: date,
        })

        supplierData.push({
          id: 'suppliers',
          value: Number(item.block.staked_suppliers),
          point: point,
          start_date: date,
        })

        appsData.push({
          id: 'suppliers',
          value: Number(item.block.staked_apps),
          point: point,
          start_date: date,
        })
      }

      for (const item of data.supply) {
        const date = normalizeIsoDate(item.day)
        const point = formatDate(date, 'day', true)

        supplyData.push({
          id: 'supply',
          value: Number(item.total_supply),
          point: point,
          start_date: date,
        })
      }
    }

    if (lastVariablesRef.current) {
      return {
        validatorsData: fillChartData({
          data: validatorsData,
          startDate: lastVariablesRef.current.startDate,
          endDate: lastVariablesRef.current.endDate,
          unitToFormatDate: 'day',
          defaultProps: {
            value: 0,
          }
        }),
        supplierData: fillChartData({
          data: supplierData,
          startDate: lastVariablesRef.current.startDate,
          endDate: lastVariablesRef.current.endDate,
          unitToFormatDate: 'day',
          defaultProps: {
            value: 0,
          }
        }),
        appsData: fillChartData({
          data: appsData,
          startDate: lastVariablesRef.current.startDate,
          endDate: lastVariablesRef.current.endDate,
          unitToFormatDate: 'day',
          defaultProps: {
            value: 0,
          }
        }),
        supplyData: fillChartData({
          data: supplyData,
          startDate: lastVariablesRef.current.startDate,
          endDate: lastVariablesRef.current.endDate,
          unitToFormatDate: 'day',
          defaultProps: {
            value: 0,
          }
        }),
      }
    }

    return {
      validatorsData,
      supplierData,
      appsData,
      supplyData,
    }
  }, [data])

  if (isLoading) {
    return <EvolutionChartsLoader />
  } else if (error) {
    return (
      <div className={'bg-[color:--main-background] grow flex rounded-lg border border-[color:--divider] base-shadow p-4'}>
        <BaseRetryError
          onRetry={refetch}
          errorMessage={`Oops. There was an error loading the chart's data.`}
        />
      </div>
    )
  } else {
    return (
      <div className="flex flex-col gap-y-4 w-full">
        <CardEvolutionChart
          title={'Supply Evolution (POKT)'}
          data={supplyData}
          dataLabel={'Supply'}
          valuesAreUPokt={true}
          applyMinAndMax={true}
        />
        <CardEvolutionChart title={'Staked Validators Evolution'} data={validatorsData} dataLabel={'Staked Validators'} />
        <CardEvolutionChart title={'Staked Suppliers Evolution'} data={supplierData} dataLabel={'Staked Suppliers'} />
        <CardEvolutionChart title={'Staked Apps Evolution'} data={appsData} dataLabel={'Staked Apps'} />
      </div>
    )
  }
}
