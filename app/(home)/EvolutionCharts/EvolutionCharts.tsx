'use client'
import CommonLineChart, { CommonLineChartProps } from '@/app/(home)/CommonLineChart'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { useHeightContext } from '@/app/context/height'
import React, { useCallback } from 'react'
import { getEvolutionVariables } from '@/app/(home)/utils'
import { evolutionDocument } from '@/app/(home)/operations'
import { useDateContext } from '@/app/dates/Context'
import EvolutionChartsLoader from '@/app/(home)/EvolutionCharts/Loader'
import { BaseRetryError } from '@/app/components/ErrorBoundary'

interface CardEvolutionChartProps {
  title: string
  data: CommonLineChartProps['data']
  dataLabel: string
  valuesAreUPokt?: boolean
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
  initialData: DocumentNodeData<typeof evolutionDocument>
  initialError: boolean
}

export default function EvolutionCharts({
  initialData,
  initialError
}: SupplierAndAppsEvolutionProps) {
  const {currentTime} = useHeightContext()

  const variables = useCallback((_: number, currentTime: string) => getEvolutionVariables(new Date(currentTime)), [])

  const { data, error, isLoading, refetch } = useFetchOnBlock({
    query: evolutionDocument,
    variables,
    initialResult: initialData,
    initialError,
  })

  const {dateTimeZone} = useDateContext()

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
    const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", timeZone: dateTimeZone === 'utc' ? 'UTC' : undefined });

    const dates = getEvolutionVariables(new Date(currentTime))
    const currentDate = dateFormatter.format(new Date(dates.currentDate))
    const yesterdayDate = dateFormatter.format(new Date(dates.yesterdayDate))
    const previous2Date = dateFormatter.format(new Date(dates.previous2Date))
    const previous3Date = dateFormatter.format(new Date(dates.previous3Date))
    const previous4Date = dateFormatter.format(new Date(dates.previous4Date))
    const previous5Date = dateFormatter.format(new Date(dates.previous5Date))
    const previous6Date = dateFormatter.format(new Date(dates.previous6Date))

    const supplyData: CommonLineChartProps['data'] = [
      {
        label: currentDate,
        value: data.today?.nodes?.at(0)?.supplies?.nodes?.at(0)?.supply?.amount || 0
      },
      {
        label: yesterdayDate,
        value: data.yesterday.nodes?.at(0)?.supplies?.nodes?.at(0)?.supply?.amount || 0
      },
      {
        label: previous2Date,
        value: data.last2.nodes?.at(0)?.supplies?.nodes?.at(0)?.supply?.amount || 0
      },
      {
        label: previous3Date,
        value: data.last3.nodes?.at(0)?.supplies?.nodes?.at(0)?.supply?.amount || 0
      },
      {
        label: previous4Date,
        value: data.last4.nodes?.at(0)?.supplies?.nodes?.at(0)?.supply?.amount || 0
      },
      {
        label: previous5Date,
        value: data.last5.nodes?.at(0)?.supplies?.nodes?.at(0)?.supply?.amount || 0
      },
      {
        label: previous6Date,
        value: data.last6.nodes?.at(0)?.supplies?.nodes?.at(0)?.supply?.amount || 0
      },
    ].reverse()

    const validatorsData: CommonLineChartProps['data'] = [
      {
        label: currentDate,
        value: data.today?.nodes?.at(0)?.stakedValidators || 0
      },
      {
        label: yesterdayDate,
        value: data.yesterday?.nodes?.at(0)?.stakedValidators || 0
      },
      {
        label: previous2Date,
        value: data.last2?.nodes?.at(0)?.stakedValidators || 0
      },
      {
        label: previous3Date,
        value: data.last3?.nodes?.at(0)?.stakedValidators || 0
      },
      {
        label: previous4Date,
        value: data.last4?.nodes?.at(0)?.stakedValidators || 0
      },
      {
        label: previous5Date,
        value: data.last5?.nodes?.at(0)?.stakedValidators || 0
      },
      {
        label: previous6Date,
        value: data.last6?.nodes?.at(0)?.stakedValidators || 0
      },
    ].reverse()

    const supplierData: CommonLineChartProps['data'] = [
      {
        label: currentDate,
        value: data.today?.nodes?.at(0)?.stakedSuppliers || 0
      },
      {
        label: yesterdayDate,
        value: data.yesterday?.nodes?.at(0)?.stakedSuppliers || 0
      },
      {
        label: previous2Date,
        value: data.last2?.nodes?.at(0)?.stakedSuppliers || 0
      },
      {
        label: previous3Date,
        value: data.last3?.nodes?.at(0)?.stakedSuppliers || 0
      },
      {
        label: previous4Date,
        value: data.last4?.nodes?.at(0)?.stakedSuppliers || 0
      },
      {
        label: previous5Date,
        value: data.last5?.nodes?.at(0)?.stakedSuppliers || 0
      },
      {
        label: previous6Date,
        value: data.last6?.nodes?.at(0)?.stakedSuppliers || 0
      },
    ].reverse()

    const appsData: CommonLineChartProps['data'] = [
      {
        label: currentDate,
        value: data.today?.nodes?.at(0)?.stakedApps || 0
      },
      {
        label: yesterdayDate,
        value: data.yesterday?.nodes?.at(0)?.stakedApps || 0
      },
      {
        label: previous2Date,
        value: data.last2?.nodes?.at(0)?.stakedApps || 0
      },
      {
        label: previous3Date,
        value: data.last3?.nodes?.at(0)?.stakedApps || 0
      },
      {
        label: previous4Date,
        value: data.last4?.nodes?.at(0)?.stakedApps || 0
      },
      {
        label: previous5Date,
        value: data.last5?.nodes?.at(0)?.stakedApps || 0
      },
      {
        label: previous6Date,
        value: data.last6?.nodes?.at(0)?.stakedApps || 0
      },
    ].reverse()

    return (
      <div className="flex flex-col gap-y-4 w-full">
        <CardEvolutionChart title={'Supply Evolution (POKT)'} data={supplyData} dataLabel={'Supply'} valuesAreUPokt={true} />
        <CardEvolutionChart title={'Staked Validators Evolution'} data={validatorsData} dataLabel={'Staked Validators'} />
        <CardEvolutionChart title={'Staked Suppliers Evolution'} data={supplierData} dataLabel={'Staked Suppliers'} />
        <CardEvolutionChart title={'Staked Apps Evolution'} data={appsData} dataLabel={'Staked Apps'} />
      </div>
    )
  }
}
