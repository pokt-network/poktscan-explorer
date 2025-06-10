import { GridColDef } from '@/app/components/Table'
import React from 'react'
import { combineByIndex, LabelByIndex, ValueByIndex } from '@/app/components/FourCards/utils'
import FourCard from '@/app/components/FourCard'
import BaseTable from '@/app/components/BaseTable'
import { Skeleton } from '@/components/ui/skeleton'

interface LoadingSummaryProps {
  defaultSkeleton?: React.ReactNode
  labels: LabelByIndex
  skeletonsPerIndex?: ValueByIndex<React.ReactNode | undefined>
}

export function LoadingSummary({
  defaultSkeleton,
  labels,
  skeletonsPerIndex
}: LoadingSummaryProps) {
  const defaultSummarySkeleton = defaultSkeleton || (
    <Skeleton className={'h-[18px] mt-[6px] w-4/6'} />
  )

  return (
    <FourCard
      items={
        combineByIndex(
          labels,
          {
            1: skeletonsPerIndex?.['1'] || defaultSummarySkeleton,
            2: skeletonsPerIndex?.['2'] || defaultSummarySkeleton,
            3: skeletonsPerIndex?.['3'] || defaultSummarySkeleton,
            4: skeletonsPerIndex?.['4'] || defaultSummarySkeleton,
          }
        )
      }
    />
  )
}

interface LoadingTableProps {
  columns: Array<GridColDef>
  rowsAmount: number
}

export function LoadingTable({columns, rowsAmount}: LoadingTableProps) {
  return (
    <div className={"w-full h-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
      <div className={"flex pt-4 px-3 md:px-4 pb-3 flex-row w-full min-h-[74px] flex-wrap items-center justify-between gap-3"}>
      </div>
      <BaseTable columns={columns} rows={[]} isLoading={true} skeletonRows={rowsAmount} />
    </div>
  )
}

interface LoadingListViewProps {
  columns: Array<GridColDef>
  rowsAmount: number
  summary?: LoadingSummaryProps
}


export default function LoadingListView({columns, rowsAmount, summary}: LoadingListViewProps) {
  return (
    <>
      {summary && (
        <LoadingSummary {...summary} />
      )}
      <LoadingTable columns={columns} rowsAmount={rowsAmount} />
    </>
  )
}
