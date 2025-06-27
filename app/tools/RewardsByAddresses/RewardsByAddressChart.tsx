'use client'

import {
  rewardsByAddressAndTimeGroupByDateDocument,
  rewardsByAddressAndTimeGroupByDateVariables,
} from '@/app/tools/RewardsByAddresses/operations'
import { useChartType } from '@/app/Charts/ChartType'
import { useDataContext } from '@/app/context/DataContext'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import useFetchOnBlock, { DocumentNodeData, ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import { useSelectedAddresses } from '@/app/tools/SelectedAddresses'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import NoData from '@/app/components/NoData'
import BaseLineBarChart from '@/app/Charts/BaseLineBarChart/BaseLineBarChart'
import { formatAmount } from '@/app/utils/format'
import { fillChartData, LineBarItem } from '@/app/Charts/utils'
import { ContentLoader } from '@/app/tools/RewardsByAddresses/Loader'
import isEqual from 'lodash/isEqual'
import { useSelectedTime } from '@/app/Charts/SelectedTime'

export interface RewardItem extends LineBarItem {
  totalAmount: number
}

interface RewardsByAddressChartProps {
  initialError: boolean
  initialAddresses: Array<string>
  initialData: DocumentNodeData<typeof rewardsByAddressAndTimeGroupByDateDocument>
  initialVariables: ExtractVariables<typeof rewardsByAddressAndTimeGroupByDateDocument>
}

export default function RewardsByAddressChart({
  initialError,
  initialAddresses,
  initialData,
  initialVariables,
}: RewardsByAddressChartProps) {
  const {chartType} = useChartType()
  const {setData, data} = useDataContext<RewardItem>()
  const {addresses} = useSelectedAddresses()
  const {selectedTime} = useSelectedTime()
  const lastVariables = useRef<ExtractVariables<typeof rewardsByAddressAndTimeGroupByDateDocument>>(initialVariables)

  const variables = useCallback((_: number, timestamp: string) => {
    return lastVariables.current = rewardsByAddressAndTimeGroupByDateVariables(
      addresses || initialAddresses,
      timestamp,
      selectedTime,
    )
  }, [addresses, selectedTime, initialAddresses])

  const { data: rawData, error, refetch, isLoading } = useFetchOnBlock({
    query: rewardsByAddressAndTimeGroupByDateDocument,
    variables,
    initialResult: initialData,
    initialError,
    skip: !addresses.length
  })

  const processedData: Array<RewardItem> = useMemo(() => {
    const rawPoints: Array<{date_truncated: string, total_amount: string | number}> = rawData?.rewards || []

    const notFilled = rawPoints.map(item => ({
      id: 'rewards',
      point: item.date_truncated,
      start_date: item.date_truncated,
      totalAmount: Number(item.total_amount),
    }))

    if (!addresses.length) return []

    return fillChartData({
      data: notFilled,
      startDate: lastVariables?.current?.startDate,
      endDate: lastVariables?.current?.endDate,
      unitToFormatDate: lastVariables?.current?.truncInterval === 'hour' ? 'hour' : 'day',
      defaultProps: {
        id: 'rewards',
        totalAmount: 0,
      }
    })
  }, [rawData, addresses?.length])

  useEffect(() => {
    if (!isEqual(processedData, data)) {
      setData(processedData)
    }
    // eslint-disable-next-line
  }, [processedData])

  let content: React.ReactNode

  if (!addresses.length) {
    content = (
      <div className={'mt-[-40px] flex w-full items-center justify-center'}>
        <NoData label={'Select addresses to see the rewards by time chart.'} />
      </div>
    )
  } else if (isLoading) {
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
    if (data.length === 0 && processedData.length === 0) {
      content = (
        <div className={'mt-[-40px] flex w-full items-center justify-center'}>
          <NoData label={'No data available for the time and addresses selected.'} />
        </div>
      )
    } else {
      content = (
        <div className={'order-2 md:order-1 w-full md:w-[calc(100%-0px)] h-full'}>
          <BaseLineBarChart
            data={{
              'eth': data.length ? data : processedData
            }}
            displayColorsInTooltip={false}
            yAxisKey={'totalAmount'}
            yAxisLabel={'Rewards (POKT)'}
            chartType={chartType}
            unitToFormatDate={lastVariables?.current?.truncInterval === 'hour' ? 'hour' : 'day'}
            getTooltipLabel={(item) => {
              const value = formatAmount({ amount: item.totalAmount, denom: 'upokt' })

              return value === '0' ? '0 POKT' : value
            }}
            formatValueAxisY={
              (value) => formatAmount({
                amount: value,
                denom: 'upokt',
                includeSymbol: false,
                abbreviateThreshold: 1e6,
              })
            }
          />
        </div>
      )
    }
  }

  return (
    <div className={'flex flex-col md:flex-row items-center px-4 pt-2 pb-4 h-[calc(100%-44px)] gap-4'}>
      {content}
    </div>
  )
}
