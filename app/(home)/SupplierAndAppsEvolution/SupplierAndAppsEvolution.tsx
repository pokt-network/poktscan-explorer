'use client'
import CommonLineChart, { CommonLineChartProps } from '@/app/(home)/CommonLineChart'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { useHeightContext } from '@/app/context/height'
import { useCallback } from 'react'
import { getEvolutionVariables } from '@/app/(home)/utils'
import { evolutionDocument } from '@/app/(home)/operations'

interface SupplierAndAppsEvolutionProps {
  initialData: DocumentNodeData<typeof evolutionDocument>
}

export default function SupplierAndAppsEvolution({
  initialData
}: SupplierAndAppsEvolutionProps) {
  const {currentTime} = useHeightContext()

  const variables = useCallback((_: number, currentTime: string) => getEvolutionVariables(new Date(currentTime)), [])

  const data = useFetchOnBlock({
    query: evolutionDocument,
    variables,
    initialResult: initialData
  })

  const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" });

  const dates = getEvolutionVariables(new Date(currentTime))
  const currentDate = dateFormatter.format(new Date(dates.currentDate))
  const yesterdayDate = dateFormatter.format(new Date(dates.yesterdayDate))
  const previous2Date = dateFormatter.format(new Date(dates.previous2Date))
  const previous3Date = dateFormatter.format(new Date(dates.previous3Date))
  const previous4Date = dateFormatter.format(new Date(dates.previous4Date))
  const previous5Date = dateFormatter.format(new Date(dates.previous5Date))
  const previous6Date = dateFormatter.format(new Date(dates.previous6Date))

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
      <div className={'bg-[color:--main-background] pb-2 border-[color:--divider] border rounded-lg base-shadow'}>
        <div className={'h-[50px] p-4 flex items-center border-b border-[color:--divider]'}>
          <p className={'font-semibold text-[15px]'}>
            Staked Suppliers Evolution
          </p>
        </div>
        <CommonLineChart data={supplierData} dataLabel={'Staked Suppliers'} />
      </div>
      <div className={'bg-[color:--main-background] pb-2 border-[color:--divider] border rounded-lg base-shadow'}>
        <div className={'h-[50px] p-4 flex items-center border-b border-[color:--divider]'}>
          <p className={'font-semibold text-[15px]'}>
            Staked Apps Evolution
          </p>
        </div>
        <CommonLineChart data={appsData} dataLabel={'Staked Apps'} />
      </div>
    </div>
  )
}
