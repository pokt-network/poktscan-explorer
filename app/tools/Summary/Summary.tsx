'use client'

import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { summaryDocument, summaryVariables } from '@/app/tools/Summary/operations'
import { useSelectedAddresses } from '@/app/tools/SelectedAddresses'
import { LoadingSummary } from '@/app/components/LoadingListView'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import React, { useCallback } from 'react'
import FourCard from '@/app/components/FourCard'
import { combineByIndex } from '@/app/components/FourCards/utils'
import { formatSimpleAmount, formatUpokt } from '@/app/utils/format'
import { labels } from '@/app/tools/Summary/constants'
import NoData from '@/app/components/NoData'

function Value({value}: {value: string}) {
  return (
    <p className={'mt-1 sm:text-lg font-medium'}>
      {value}
    </p>
  )
}

interface SummaryProps {
  isOwners: boolean
  initialAddresses: Array<string>
  initialData: DocumentNodeData<typeof summaryDocument>
  initialError: boolean
}

export default function Summary({isOwners, initialAddresses, initialData, initialError}: SummaryProps) {
  const {addresses} = useSelectedAddresses()

  const variables = useCallback((_: number, currentTime: string) => {
    return summaryVariables(isOwners, addresses || initialAddresses, new Date(currentTime))
  }, [isOwners, addresses, initialAddresses])

  const { data, error, refetch, isLoading } = useFetchOnBlock({
    query: summaryDocument,
    variables,
    initialResult: initialData,
    initialError,
    skip: !addresses.length,
    updateOnNewSession: true,
  })

  if (isLoading) {
    return (
      <LoadingSummary
        labels={labels}
        containerClassName={'flex-col lg:!flex lg:[&_.card-container]:!h-[90px]'}
      />
    )
  } else if (error) {
    return (
      <div className={"bg-[color:--main-background] pt-3 pb-1 gap-1 rounded-lg border border-[color:--divider] base-shadow"}>
        <BaseRetryError
          onRetry={refetch}
          errorMessage={'Oops. There was an error loading the summary data.'}
        />
      </div>
    )
  }

  if (!addresses.length) {
    return (
      <div className={'rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow h-full flex w-full items-center justify-center'}>
        <NoData label={'Select addresses to see the data.'} />
      </div>
    )
  }

  return (
    <FourCard
      items={
        combineByIndex(
          labels,
          {
            1: (
              <Value
                value={formatSimpleAmount(
                  data?.suppliers?.totalCount,
                )}
              />
            ),
            2: (
              <Value
                value={formatUpokt({
                  amount: data?.suppliers?.aggregates?.sum?.stakeAmount,
                  maxDecimals: 2,
                })}
              />
            ),
            3: (
              <Value
                value={formatUpokt({
                  amount: data?.last24h,
                  maxDecimals: 4,
                })}
              />
            ),
            4: (
              <Value
                value={formatUpokt({
                  amount: data?.last48h,
                  maxDecimals: 4,
                })}
              />
            ),
          }
        )
      }
      containerClassName={
        'flex-col lg:!flex lg:[&_.card-container]:!h-[90px]'
      }
    />
  )
}
