'use client'

import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { morseClaimableAccountsSummaryDocument } from '@/app/migration/operations'
import Big from 'big.js'
import FourCard from '@/app/components/FourCard'
import React from 'react'
import { calculatePercentage } from '@/app/utils/calculate'
import { formatUpokt } from '@/app/utils/format'
import { combineByIndex, LabelByIndex } from '@/app/components/FourCards/utils'
import { LoadingSummary } from '@/app/components/LoadingListView'
import { Skeleton } from '@/components/ui/skeleton'
import { BaseRetryError } from '@/app/components/ErrorBoundary'

export function SummarySkeleton() {
  return (
    <div className={'flex flex-col gap-1'}>
      <Skeleton className={'h-[19.5px] w-[120px] mt-2'} />
      <Skeleton className={'h-[19.5px] w-[170px]'} />
      <Skeleton className={'h-[11.5px] mt-2 w-full'} />
    </div>
  )
}

interface PercentProps {
  percentage: number
}

function Percent({percentage}: PercentProps) {
  return (
    <div className={'flex items-center gap-2 w-full'}>
      <div
        className={'w-full h-3 rounded-xl bg-[color:--highlight-option] dark:bg-[color:--background]'}
      >
        <div
          className={'h-full bg-[color:--primary] rounded-tl-xl rounded-bl-xl'}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
      <p className={'text-[13px] whitespace-nowrap'}>
        {percentage}%
      </p>
    </div>
  )
}

interface ValueProps {
  percentage: number,
  value: Big
  total: Big
}

function Value({percentage, value, total}: ValueProps) {
  return (
    <div className={'[&_p]:text-[13px] font-medium flex flex-col gap-1'}>
      <div className={'flex items-center gap-2 mt-2'}>
        <p>Claimed:</p>
        <p>
          {formatUpokt({
            amount: value.toString(),
            abbreviateThreshold: Number.MAX_SAFE_INTEGER
          })}
        </p>
      </div>
      <div className={'flex items-center gap-2'}>
        <p>Total:</p>
        <p>
          {formatUpokt({
            amount: total.toString(),
            abbreviateThreshold: Number.MAX_SAFE_INTEGER
          })}
        </p>
      </div>
      <Percent percentage={percentage} />
    </div>
  )
}

interface SummaryProps {
  initialData: DocumentNodeData<typeof morseClaimableAccountsSummaryDocument> | null
  labels: LabelByIndex
  initialError: boolean
}

export default function Summary({initialData, initialError, labels}: SummaryProps) {
  const { data, isLoading, error, refetch } = useFetchOnBlock({
    query: morseClaimableAccountsSummaryDocument,
    initialResult: initialData,
    initialError,
  })

  if (isLoading) {
    return (
      <div className={'-mt-0'}>
        <LoadingSummary labels={labels} defaultSkeleton={<SummarySkeleton />} />
        <hr className={'border-[color:--divider] mt-6 mb-4'} />
      </div>
    )
  } else if (error) {
    return (
      <div className={'-mt-0'}>
        <div className={"bg-[color:--main-background] pt-3 pb-1 gap-1 rounded-lg border border-[color:--divider] base-shadow"}>
          <BaseRetryError
            onRetry={refetch}
            errorMessage={'Oops. There was an error loading the summary data.'}
          />
        </div>
        <hr className={'border-[color:--divider] mt-6 mb-4'} />
      </div>
    )
  }

  const notClaimed = data?.morseClaimableAccounts?.groupedAggregates?.find(i => i.keys.at(0) === 'false')
  const claimed = data?.morseClaimableAccounts?.groupedAggregates?.find(i => i.keys.at(0) === 'true')

  const appStakedClaimed = new Big(claimed?.sum?.applicationStakeAmount || 0)
  const supplierStakedClaimed = new Big(claimed?.sum?.supplierStakeAmount || 0)
  const unstakedBalanceClaimed = new Big(claimed?.sum?.unstakedBalanceAmount || 0)

  const appStakedNotClaimed = new Big(notClaimed?.sum?.applicationStakeAmount || 0)
  const supplierStakedNotClaimed = new Big(notClaimed?.sum?.supplierStakeAmount || 0)
  const unstakedBalanceNotClaimed = new Big(notClaimed?.sum?.unstakedBalanceAmount || 0)

  const totalClaimed = appStakedClaimed.plus(supplierStakedClaimed).plus(unstakedBalanceClaimed)
  const totalNotClaimed = appStakedNotClaimed.plus(supplierStakedNotClaimed).plus(unstakedBalanceNotClaimed)
  const total = totalClaimed.plus(totalNotClaimed)

  const claimedPercentage = Number(calculatePercentage(totalClaimed, total).toFixed(2))

  const totalLiquidBalance = unstakedBalanceClaimed.plus(unstakedBalanceNotClaimed)
  const liquidBalancePercentage = Number(calculatePercentage(
    unstakedBalanceClaimed,
    totalLiquidBalance
  ).toFixed(2))

  const totalSupplierStake = supplierStakedClaimed.plus(supplierStakedNotClaimed)
  const supplierStakePercentage = Number(calculatePercentage(
    supplierStakedClaimed,
    totalSupplierStake
  ).toFixed(2))

  const totalAppStake = appStakedClaimed.plus(appStakedNotClaimed)
  const appStakePercentage = Number(calculatePercentage(
    appStakedClaimed,
    totalAppStake
  ).toFixed(2))

  return (
    <div className={'-mt-0'}>
      <FourCard
        items={
          combineByIndex(
            labels,
            {
              1: <Value percentage={claimedPercentage} value={totalClaimed} total={total} />,
              2: <Value percentage={liquidBalancePercentage} value={unstakedBalanceClaimed} total={totalLiquidBalance} />,
              3: <Value percentage={supplierStakePercentage} value={supplierStakedClaimed} total={totalSupplierStake} />,
              4: <Value percentage={appStakePercentage} value={appStakedClaimed} total={totalAppStake} />,
            }
          )
        }
      />
      <hr className={'border-[color:--divider] mt-6 mb-4'} />
    </div>
  )
}
