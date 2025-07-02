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
import { convertUpoktToPokt, formatAmount, truncateAddress } from '@/app/utils/format'
import { fillChartData, LineBarItem, normalizeIsoDate } from '@/app/Charts/utils'
import { ContentLoader } from '@/app/tools/RewardsByAddresses/Loader'
import isEqual from 'lodash/isEqual'
import { useSelectedTime } from '@/app/Charts/SelectedTime'
import orderBy from 'lodash/orderBy'
import useDidMountEffect from '@/app/hooks/useDidMountEffect'
import ItemsSelector from '@/app/Charts/ItemsSelector/ItemsSelector'
import { clsx } from 'clsx'
import { useMultipleOptionContext } from '@/app/context/MultipleOptionContext'

export interface RewardItem extends LineBarItem {
  totalAmount: number
  start_date: string
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
    skip: !addresses.length,
    updateOnNewSession: true,
  })

  const { selectedValue: groupAllAddresses } = useMultipleOptionContext<boolean>()

  const processedData: Record<string, Array<RewardItem>> = useMemo(() => {
    const rawPoints: Array<{date_truncated: string, total_amount: string | number, address: string}> = rawData?.rewards || []

    if (!addresses.length || !rawData?.rewards) return {}

    if (groupAllAddresses) {
      const amountByDate = rawPoints.reduce((acc, item) => ({
        ...acc,
        [item.date_truncated]: (acc[item.date_truncated] || 0) + Number(item.total_amount)
      }), {} as Record<string, number>)

      const dataNotFilled = Object.keys(amountByDate).map((date) => ({
        id: '',
        point: normalizeIsoDate(date),
        start_date: normalizeIsoDate(date),
        totalAmount: amountByDate[date]
      }))

      return {
        'all': fillChartData({
          data: dataNotFilled,
          startDate: lastVariables?.current?.startDate,
          endDate: lastVariables?.current?.endDate,
          unitToFormatDate: lastVariables?.current?.truncInterval === 'hour' ? 'hour' : 'day',
          defaultProps: {
            totalAmount: 0,
          }
        })
      } as Record<string, Array<RewardItem>>
    }

    const dataByAddress = rawPoints.reduce((acc: Record<string, Array<RewardItem>>, item) => ({
      ...acc,
      [item.address]: [
        ...(acc[item.address] || []),
        {
          id: item.address,
          point: normalizeIsoDate(item.date_truncated),
          start_date: normalizeIsoDate(item.date_truncated),
          totalAmount: Number(item.total_amount)
        },
      ]
    }), {} as Record<string, Array<RewardItem>>)

    return addresses.reduce((acc, address) => ({
      ...acc,
      [address]: fillChartData({
        data: dataByAddress[address] || [],
        startDate: lastVariables?.current?.startDate,
        endDate: lastVariables?.current?.endDate,
        unitToFormatDate: lastVariables?.current?.truncInterval === 'hour' ? 'hour' : 'day',
        defaultProps: {
          id: address,
          totalAmount: 0,
        }
      })
    }), {})
  }, [rawData, addresses, groupAllAddresses])

  const addressesWithRewards = useMemo(() => {
    return orderBy(Object.entries(processedData).map(([address, items]) => ({
      id: address,
      label: truncateAddress(address, 6),
      value: items.reduce((acc, item) => {
        return acc + convertUpoktToPokt(item.totalAmount)
      }, 0)
    })), ['value'], ['desc'])
  }, [processedData])

  const [selectedAddresses, setSelectedAddresses] = React.useState<Array<string>>(
    addressesWithRewards.map(item => item.id).slice(0, 5)
  )

  useDidMountEffect(() => {
    if (groupAllAddresses) return

    const newSelection = addressesWithRewards.map(item => item.id).slice(0, 5)

    if (!isEqual(newSelection, selectedAddresses)) {
      setSelectedAddresses(newSelection)
    }
  }, [processedData])

  useEffect(() => {
    let newData: Array<RewardItem> = []

    if (groupAllAddresses) {
      newData = processedData['all']
    } else {
      newData = Object.entries(processedData).reduce((acc, [address,items]) => {
        if (selectedAddresses.includes(address)) {
          return acc.concat(items)
        }
        return acc
      }, [] as Array<RewardItem>)
    }

    if (!isEqual(newData, data)) {
      setData(newData)
    }
    // eslint-disable-next-line
  }, [processedData, selectedAddresses])

  const changeSelectedAddresses = (addresses: Array<string>) => {
    setSelectedAddresses(addresses)
  }

  const filteredDataByAddress: Record<string, Array<RewardItem>> = useMemo(() => {
    if (groupAllAddresses) {
      return data.reduce((acc, item) => {
        acc.eth.push(item)
        return acc
      }, {'eth': []})
    }

    return data.reduce((acc, item) => {
      if (selectedAddresses.includes(item.id)) {
        if (acc[item.id]) {
          acc[item.id].push(item)
        } else {
          acc[item.id] = [item]
        }
      }

      return acc
    }, {} as Record<string, Array<RewardItem>> )
  }, [data, selectedAddresses, groupAllAddresses])

  let content: React.ReactNode

  if (!addresses.length) {
    content = (
      <div className={'mt-[-40px] flex w-full items-center justify-center'}>
        <NoData label={'Select addresses to see the rewards by time chart.'} />
      </div>
    )
  } else if (isLoading) {
    content = (
      <ContentLoader chartType={chartType} hideSelector={groupAllAddresses} />
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
    if (data.length === 0 && addressesWithRewards.every(i => i.value === 0)) {
      content = (
        <>
          <div className={'mt-[-40px] flex w-full items-center justify-center'}>
            <NoData label={'No data available for the time and addresses selected.'} />
          </div>
        </>
      )
    } else {
      content = (
        <>
          <div className={'flex flex-col md:flex-row w-full grow items-center gap-4'}>
            <div
              className={
                clsx(
                  'order-2 md:order-1',
                  groupAllAddresses && 'w-full h-full md:h-[328px]',
                  !groupAllAddresses && 'w-full md:w-[calc(100%-260px-16px)] h-[320px] sm:h-[328px]'
                )
              }
            >
              <BaseLineBarChart
                data={filteredDataByAddress}
                displayColorsInTooltip={false}
                yAxisKey={'totalAmount'}
                yAxisLabel={'Rewards (POKT)'}
                chartType={chartType}
                unitToFormatDate={lastVariables?.current?.truncInterval === 'hour' ? 'hour' : 'day'}
                getTooltipLabel={(item) => {
                  const value = formatAmount({ amount: item.totalAmount, denom: 'upokt' })

                  if (groupAllAddresses) {
                    return value
                  }

                  return [
                    `Address: ${truncateAddress(item.id, 6)}`,
                    `Rewards: ${value}`,
                  ]
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
            {!groupAllAddresses && (
              <div className={'min-h-[180px] h-[180px] md:h-[calc(100%-16px)] w-full md:min-w-[260px] md:w-[260px] order-1 md:order-2'}>
                <ItemsSelector
                  data={addressesWithRewards}
                  selectedItems={selectedAddresses}
                  changeSelectedItems={changeSelectedAddresses}
                />
              </div>
            )}
          </div>
        </>
      )
    }
  }

  return (
    <div
      className={
        clsx(
          !isLoading && 'flex flex-col items-center px-4 pt-2 pb-4 h-full gap-4',
          isLoading && 'flex flex-col md:flex-row items-center px-4 pt-2 pb-4 h-[calc(100%-44px)] gap-4'
        )
      }
    >
      {content}
    </div>
  )
}
