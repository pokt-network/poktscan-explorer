'use client'

import { Chart as ChartJs } from 'chart.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  overservicedByAddressesAndTimeDocument,
  overservicedByAddressesAndTimeVariables,
} from '@/app/tools/operator/operations'
import { Time } from '@/app/utils/dates'
import LegendItem from '@/app/Charts/LegendItem'
import { useChartType } from '@/app/Charts/ChartType'
import { useDataContext } from '@/app/context/DataContext'
import { useSelectedTime } from '@/app/Charts/SelectedTime'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { convertUpoktToPokt, formatUpokt } from '@/app/utils/format'
import { useSelectedAddresses } from '@/app/tools/SelectedAddresses'
import BaseLineBarChart from '@/app/Charts/BaseLineBarChart/BaseLineBarChart'
import useFetchOnBlock, { ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import { fillChartData, LineBarItem, normalizeIsoDate } from '@/app/Charts/utils'

export interface OverservicedItem extends LineBarItem {
  start_date: string
  value: number
  expected_burn: number
  effective_burn: number
}

type RawData = {
  data: Array<{
    date_truncated: string
    expected_burn: number
    effective_burn: number
  }>
} | null

const legendItems = [
  {
    label: 'Effective',
    color: '#00CF9D',
  },
  {
    label: 'Expected',
    color: '#B7ABFF',
  },
]

function useOverservicedData() {
  const { setData } = useDataContext()
  const { addresses } = useSelectedAddresses()
  const { selectedTime } = useSelectedTime()

  const lastVariablesRef = useRef<ExtractVariables<typeof overservicedByAddressesAndTimeDocument> | null>(null)

  const variablesFromProps = useCallback(
    (timestamp: string) => overservicedByAddressesAndTimeVariables(addresses, timestamp, selectedTime),
    [addresses, selectedTime]
  )

  const variables = useCallback(
    (_: number, timestamp: string) => {
      return (lastVariablesRef.current = variablesFromProps(timestamp))
    },
    [variablesFromProps]
  )

  const { refetch, data, error, isLoading } = useFetchOnBlock({
    query: overservicedByAddressesAndTimeDocument,
    variables,
    initialResult: null as RawData,
    initialError: false,
    updateOnNewSession: true,
  })

  const processedData = useMemo(() => {
    if (!data) return []

    return fillChartData({
      data: (data?.data || []).map((item) => ({
        id: '',
        start_date: normalizeIsoDate(item.date_truncated),
        point: normalizeIsoDate(item.date_truncated),
        expected_burn: item.expected_burn,
        effective_burn: item.effective_burn,
      })),
      defaultProps: {
        expected_burn: 0,
        effective_burn: 0,
      },
      startDate: lastVariablesRef.current?.startDate || '',
      endDate: lastVariablesRef.current?.endDate || '',
      unitToFormatDate: lastVariablesRef.current?.truncInterval === 'day' ? 'day' : 'hour',
    })
  }, [data])

  const chartData = useMemo(() => {
    const effective: Array<OverservicedItem> = []
    const expected: Array<OverservicedItem> = []

    for (const datum of processedData) {
      effective.push({
        id: 'effective',
        start_date: datum.start_date,
        point: datum.point,
        value: convertUpoktToPokt(datum.effective_burn),
        expected_burn: datum.expected_burn,
        effective_burn: datum.effective_burn,
      })

      expected.push({
        id: 'expected',
        start_date: datum.start_date,
        point: datum.point,
        value: convertUpoktToPokt(datum.expected_burn),
        expected_burn: datum.expected_burn,
        effective_burn: datum.effective_burn,
      })
    }

    return { effective, expected }
  }, [processedData])

  useEffect(() => {
    setData(processedData || [])
    // eslint-disable-next-line
  }, [processedData])

  return {
    data: chartData,
    refetch,
    error,
    isLoading: isLoading || (!data && !error),
  }
}

export default function OverservicedChart() {
  const chartRef = useRef<ChartJs<'bar'>>(null)
  const { selectedTime } = useSelectedTime()
  const { chartType } = useChartType()
  const { data, refetch, isLoading, error } = useOverservicedData()

  const [hiddenDatasets, setHiddenDatasets] = useState<Array<number>>([])

  const onItemLegendClick = useCallback((index: number) => {
    if (chartRef?.current) {
      chartRef.current.toggleDataVisibility(index)
      const meta = chartRef.current.getDatasetMeta(index)

      if (meta.hidden) {
        setHiddenDatasets((prevState) => [...prevState, index])
      } else {
        setHiddenDatasets((prevState) => prevState.filter((value) => value !== index))
      }

      chartRef.current.update('none')
    }
  }, [])

  if (error && !isLoading) {
    return <BaseRetryError onRetry={refetch} />
  }

  return (
    <>
      <div className={'px-4 flex flex-row flex-wrap gap-x-8 gap-y-2 pt-2 pb-6'}>
        {legendItems.map((item, index) => (
          <LegendItem
            key={index}
            label={item.label}
            boxColor={hiddenDatasets.includes(index) ? 'rgba(93, 93, 93, 0.5)' : item.color}
            onClick={() => onItemLegendClick(index)}
            loading={isLoading || (!data && !error)}
          />
        ))}
      </div>
      <div className={'h-[calc(100%-60px-48px-20px)] px-4'}>
        <BaseLineBarChart
          data={{
            effective: data?.effective || [],
            expected: data?.expected || [],
          }}
          ref={chartRef}
          yAxisKey={'value' as keyof OverservicedItem}
          yAxisLabel="POKT"
          isLoading={isLoading}
          chartType={chartType}
          unitToFormatDate={[Time.Last24h, Time.Last48h].includes(selectedTime) ? 'hour' : 'day'}
          getTooltipLabel={(item: OverservicedItem) => {
            const difference = item.expected_burn - item.effective_burn
            return [
              `Effective: ${formatUpokt({
                includeSymbol: true,
                amount: item.effective_burn,
                maxDecimals: 6,
                abbreviateThreshold: Infinity,
              })}`,
              `Expected: ${formatUpokt({
                includeSymbol: true,
                amount: item.expected_burn,
                maxDecimals: 6,
                abbreviateThreshold: Infinity,
              })}`,
              `Difference: ${formatUpokt({
                includeSymbol: true,
                amount: Math.abs(difference),
                maxDecimals: 6,
                abbreviateThreshold: Infinity,
              })}`,
            ]
          }}
          displayColorsInTooltip={false}
          colorById={{
            effective: '#00CF9D',
            expected: '#B7ABFF',
          }}
          getCustomDatasetProps={(id) => {
            if (id === 'effective') {
              return {
                fill: {
                  target: '+1',
                  above: 'rgba(0, 207, 157, 0.1)',
                  below: 'rgba(183, 171, 255, 0.1)',
                },
              }
            }
            return {}
          }}
          customOptions={{
            plugins: {
              tooltip: {
                filter: (_item: unknown, index: number) => index === 0,
                footerColor: '#9e9e9e',
                footerFont: {
                  size: 11,
                  weight: 'bold' as const,
                  family: 'Roboto',
                },
                footerMarginTop: 10,
              },
            },
          }}
        />
      </div>
    </>
  )
}
