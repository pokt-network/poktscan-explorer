'use client'

import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { distributionDocument, getDistributionVariables } from '@/app/dashboards/services/operations'
import { useCallback, useEffect, useMemo } from 'react'
import Big from 'big.js'
import BaseDoughnut from '@/app/Charts/BaseDoughnut'
import { calculatePercentage } from '@/app/utils/calculate'
import NoData from '@/app/components/NoData'
import { useDataContext } from '@/app/context/DataContext'

interface DistributionChartProps {
  initialData: DocumentNodeData<typeof distributionDocument>
  timeSelected: string
}

export default function DistributionChart({initialData, timeSelected}: DistributionChartProps) {
  const {setData} = useDataContext()
  const variables = useCallback((_: number, currentTime: string) => getDistributionVariables(new Date(currentTime), timeSelected), [timeSelected])

  const data = useFetchOnBlock({
    query: distributionDocument,
    variables,
    initialResult: initialData
  })

  const processedData = useMemo(() => {
    const total = data?.relayByBlockAndServices?.groupedAggregates?.reduce((acc, item) => acc.add(item?.sum?.computedUnits || 0), new Big(0)) || new Big(0)

    return data?.relayByBlockAndServices?.groupedAggregates?.map((item) => ({
      id: item?.keys?.at(0) || '',
      total: item?.sum?.computedUnits || 0,
      percent: calculatePercentage(new Big(item?.sum?.computedUnits || 0), total),
    })) || []
  }, [data])

  useEffect(() => {
    setData(processedData)
    // eslint-disable-next-line
  }, [processedData])

  if (processedData.length === 0) {
    return (
      <NoData label={'No data available in the time selected.'} />
    )
  }

  return (
    <BaseDoughnut
      data={processedData}
    />
  )
}
