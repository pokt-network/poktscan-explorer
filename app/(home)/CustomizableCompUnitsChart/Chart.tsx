'use client'

import { useTheme } from 'next-themes'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import useFetchOnBlock, { DocumentNodeData, ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import { fillChartData, LineBarItem, normalizeIsoDate, UnitTimeGroup } from '@/app/Charts/utils'
import BaseLineBarChart from '@/app/Charts/BaseLineBarChart/BaseLineBarChart'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import {
  customizableCompUnitsDocument,
  customizableCompUnitsVariables,
} from '@/app/(home)/CustomizableCompUnitsChart/operations'
import { useSelectedTime } from '@/app/Charts/SelectedTime'
import { useDataContext } from '@/app/context/DataContext'
import { useChartType } from '@/app/Charts/ChartType'
import { formatAmount } from '@/app/utils/format'
import { Time } from '@/app/utils/dates'

interface RawItem  {
  date_truncated: string
  relays: number
  computed_units: number
  claimed_amount: number
}

export interface ChartItem extends LineBarItem {
  start_date: string
  totalRelays: number
  totalComputedUnits: number
  totalPokt: number
}

function useCustomizableCompUnitsData() {
  const { selectedTime } = useSelectedTime()
  const { setData } = useDataContext<ChartItem>()

  const lastVariables = useRef<ExtractVariables<typeof customizableCompUnitsDocument> | null>(null)
  const variables = useCallback((_: number, currentTime: string) => {
    return lastVariables.current = customizableCompUnitsVariables(
      currentTime,
      selectedTime
    )
  }, [selectedTime])

  const {refetch, isLoading, data, error} = useFetchOnBlock({
    query: customizableCompUnitsDocument,
    variables: variables,
    initialResult: null as unknown as DocumentNodeData<typeof customizableCompUnitsDocument>,
    initialError: false,
    updateOnNewSession: true
  })

  const processedData: Array<ChartItem> = useMemo(() => {
    if (!data) return []

    const rawData: Array<ChartItem> = (data.groupByDay || []).map((item: RawItem) => {
      const normalizedDate = normalizeIsoDate(item.date_truncated)

      return {
        id: '',
        point: normalizedDate,
        start_date: normalizedDate,
        totalRelays: item.relays,
        totalComputedUnits: item.computed_units,
        totalPokt: item.claimed_amount,
      }
    })

    return fillChartData({
      data: rawData,
      defaultProps: {
        totalComputedUnits: 0,
        totalPokt: 0,
        totalRelays: 0
      },
      startDate: lastVariables.current?.startDate || '',
      endDate: lastVariables.current?.endDate || '',
      unitToFormatDate: (lastVariables.current?.truncInterval as UnitTimeGroup) || 'day'
    })
  }, [data])

  useEffect(() => {
    setData(processedData)
    // eslint-disable-next-line
  }, [processedData])

  return {
    data: processedData,
    isLoading,
    error,
    refetch,
  }
}

export default function CustomizableCompUnitsChart() {
  const { selectedTime } = useSelectedTime()
  const {data, isLoading, error, refetch} = useCustomizableCompUnitsData()

  const {theme = 'dark'} = useTheme();
  const isDark = theme === 'dark'
  const {chartType} = useChartType()


  if (error) {
    return (
      <BaseRetryError
        onRetry={refetch}
      />
    )
  }

  return (
    <div className={'pt-2 px-4 h-[calc(100%-60px)]'}>
      <BaseLineBarChart
        data={{
          '': data
        }}
        colorById={{
          '': isDark ? '#b9b9b9' : '#3f3f3f'
        }}
        yAxisKey={'totalComputedUnits'}
        yAxisLabel={'Computed Units'}
        isLoading={isLoading}
        chartType={chartType}
        unitToFormatDate={[Time.Last24h, Time.Last48h].includes(selectedTime) ? 'hour' : 'day'}
        displayColorsInTooltip={false}
        getTooltipLabel={(data) => {
          return [
            `Computed Units: ${formatAmount({
              amount: data?.original || data?.totalComputedUnits || 0,
              abbreviateThreshold: Infinity,
            })}`,
            `Relays: ${formatAmount({ 
              amount: data?.totalRelays || 0,
              abbreviateThreshold: Infinity,
            })}`,
            `POKT: ${formatAmount({
              amount: data?.totalPokt || 0,
              denom: 'upokt',
              includeSymbol: false,
              maxDecimals: 6,
              abbreviateThreshold: Infinity,
            })}`
          ]
        }}
        getCustomDatasetProps={() => {
          return {
            tension: 0.5,
            pointRadius: 8,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            pointHoverRadius: 8,
            pointBorderColor: 'transparent',
            pointBackgroundColor: 'transparent',
            pointBorderWidth: 0,
            borderWidth: 1.5,
          }
        }}
      />
    </div>
  )
}
