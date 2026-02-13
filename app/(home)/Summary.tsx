'use client'

import useFetchOnBlock, { DocumentNodeData, ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import { summaryDocument } from '@/app/(home)/operations'
import React, { useCallback, useRef } from 'react'
import { getSummaryVariables } from '@/app/(home)/utils'
import PocketLogo from '@/app/assets/pocket_logo.svg'
import Price from '@/app/components/Price'
import { Blend, Box, Globe, Landmark, RefreshCcw } from 'lucide-react'
import { formatAmount, formatUpokt } from '@/app/utils/format'
import BoxLabel from '@/app/components/BoxLabel'
import MarketCap from '@/app/(home)/MarketCap'
import EntityLink from '@/app/components/EntityLink'
import DateCellText from '@/app/dates/DateCellText'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { ContentLoader } from '@/app/(home)/SummaryLoader'
import { clsx } from 'clsx'
import { useHeightContext } from '@/app/context/height'

function Title({title}: {title: string}) {
  return (
    <p className={'text-xs tracking-tight text-[color:--secondary]'}>
      {title.toUpperCase()}
    </p>
  )
}

interface SummaryProps {
  initialData: DocumentNodeData<typeof summaryDocument> | null
  initialError: boolean
  initialVariables?: ExtractVariables<typeof summaryDocument>
}

export default function Summary({initialData, initialError, initialVariables}: SummaryProps) {
  const lastVariablesRef = useRef<ExtractVariables<typeof summaryDocument>>(initialVariables!)
  const variables = useCallback((_: number, currentTime: string) => lastVariablesRef.current = getSummaryVariables(currentTime), [])
  const {currentHeight, currentTime, networkHeight} = useHeightContext()
  const { data, error, isLoading, refetch } = useFetchOnBlock({
    query: summaryDocument,
    variables,
    initialResult: initialData,
    initialError,
  })

  let content: React.ReactNode

  if (isLoading) {
    content = (
      <ContentLoader />
    )
  } else if (error) {
    content = (
      <BaseRetryError
        onRetry={refetch}
        errorMessage={'Oops. There was an error loading the summary data.'}
      />
    )
  } else {
    const latestBlock = data?.lastBlock?.nodes?.at(0)

    const currentSupply = data?.supply?.at(0)?.total_supply || latestBlock?.supplies?.nodes?.find((s) => s?.supply?.denom === 'upokt')?.supply?.amount
    const totalStaked = BigInt(latestBlock?.stakedSuppliersTokens || 0) + BigInt(latestBlock?.stakedAppsTokens || 0) + BigInt(latestBlock?.stakedGatewaysTokens || 0)
    const summary = data?.blocks?.aggregates?.sum

    content = (
      <>
        <div className={'flex flex-col gap-y-5 md:pr-5'}>
          <div className={'flex h-full justify-between'}>
            <div className={'flex grow flex-row h-full'}>
              <div className={'h-[41px] w-[24px] mr-2'}>
                <Box className={'stroke-1 w-7 h-7 ml-[-3px] mt-[-5px]'} />
              </div>
              <div className={'flex grow flex-col gap-0.5 h-full'}>
                <Title
                  title={'Latest Block'}
                />
                <div className={'text-[14px!important]'}>
                  <EntityLink entity={'block'} entityId={networkHeight || currentHeight || 0} copy={{enabled: false}} />
                </div>
              </div>
            </div>
            <div className={'flex flex-row items-end h-[51.5px] max-h-[51.5px]'}>
              <div className={'h-[41px] w-[24px] mr-2'}>
                <RefreshCcw className={'stroke-1 w-[26px] h-[26px] ml-[-1px] mt-[-17px]'} />
              </div>
              <div className={'flex grow flex-col items-end gap-0.5 h-full'}>
                <Title
                  title={'Indexer Block'}
                />
                <div className={'text-[14px!important] text-left'}>
                  <EntityLink entity={'block'} entityId={currentHeight || 0} copy={{enabled: false}} />
                </div>
                <p className={'text-[11px] text-left -mt-1'}>
                  <DateCellText value={currentTime} forceAge={true} />
                </p>
              </div>
            </div>

          </div>
          <hr className={'border-[color:--divider]'} />
          <div className={'flex h-full justify-between'}>
            <div className={'flex grow flex-row h-full'}>
              <div className={'h-[41px] w-[24px] mr-2'}>
                <PocketLogo className={'pocket_logo scale-[170%]'} />
              </div>
              <div className={'flex grow flex-col gap-0.5 h-full'}>
                <Title
                  title={'POKT Price'}
                />
                <div className={'text-[15px!important]'}>
                  <Price
                    showLabel={false}
                    priceColor={'--foreground'}
                    fontSize={'[15px]'}
                  />
                </div>
              </div>
            </div>
            <div className={'flex flex-row items-end'}>
              <div className={'h-[41px] w-[24px] mr-2'}>
                <Globe className={'stroke-1 w-7 h-7 ml-[-3px] mt-[-7px] lg:mt-[-14px]'} />
              </div>
              <div className={'flex grow flex-col gap-0.5 h-full'}>
                <Title
                  title={'Market Cap'}
                />
                <p className={'text-[15px]'}>
                  <MarketCap />
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className={'flex flex-col gap-y-5 border-t md:pt-0 pt-5 md:border-t-0 md:px-5 md:border-l border-[color:--divider]'}
        >
          <div className={'flex h-full justify-between'}>
            <div className={'flex grow flex-row h-full'}>
              <div className={'h-[41px] w-[24px] mr-2'}>
                <Blend className={'stroke-1 w-7 h-7 ml-[-3px] mt-[-5px]'} />
              </div>

              <div className={'flex flex-col gap-0.5'}>
                <div className={'flex'}>
                  <Title
                    title={'Computed Units'}
                  />
                  <BoxLabel label={'24H'} />
                </div>
                <p className={'text-[15px]'}>
                  {formatAmount({
                    amount: summary?.totalEstimatedComputedUnits,
                  })}
                </p>
              </div>
            </div>
            <div className={'flex flex-col items-end gap-0.5'}>
              <div className={'flex gap-2'}>
                <BoxLabel label={'24H'} />
                <Title
                  title={'Relays'}
                />
              </div>
              <p className={'text-[15px]'}>
                {formatAmount({
                  amount: summary?.totalEstimatedRelays,
                })}
              </p>
            </div>
          </div>
          <hr className={'border-[color:--divider]'} />
          <div className={'flex h-full justify-between'}>
            <div className={'flex grow flex-row h-full'}>
              <div className={'h-[41px] w-[24px] mr-2'}>
                <Landmark className={'stroke-1 w-7 h-7 ml-[-3px] mt-[-5px]'} />
              </div>

              <div className={'flex flex-col gap-0.5'}>
                <Title
                  title={'Total Supply'}
                />
                <p className={'text-[15px]'}>
                  {formatUpokt({
                    amount: currentSupply,
                  })}
                </p>
              </div>
            </div>
            <div className={'flex flex-col items-end gap-0.5'}>
              <div className={'flex'}>
                <p className={'text-xs tracking-tight text-[color:--secondary] text-right'}>
                  TOTAL STAKED
                </p>
              </div>
              <p className={'text-[15px]'}>
                {formatUpokt({
                  amount: totalStaked,
                  maxDecimals: 0
                })}
              </p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div
      className={
        clsx(
          'gap-y-[20px] min-h-[180px] lg:h-[180px] z-10 relative px-5 pt-5 lg:pb-5 bg-[color:--main-background] md:grid-cols-2 base-shadow rounded-xl border border-[color:--divider]',
          error && !isLoading ? 'flex' : 'grid',
        )
      }
    >
      {content}
    </div>
  )
}
