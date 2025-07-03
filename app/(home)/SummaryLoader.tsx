import { Blend, Box, Globe, Landmark, RefreshCcw } from 'lucide-react'
import PocketLogo from '@/app/assets/pocket_logo.svg'
import Price from '@/app/components/Price'
import MarketCap from '@/app/(home)/MarketCap'
import BoxLabel from '@/app/components/BoxLabel'
import { Skeleton } from '@/components/ui/skeleton'
import LineChartLoader from '@/app/(home)/LineChartLoader'
import React from 'react'

function Title({title}: {title: string}) {
  return (
    <p className={'text-xs tracking-tight text-[color:--secondary]'}>
      {title.toUpperCase()}
    </p>
  )
}

export function ContentLoader() {
  return (
    <>
      <div className={'flex flex-col gap-y-5 pr-5'}>
        <div className={'flex h-full justify-between'}>
          <div className={'flex grow flex-row h-full'}>
            <div className={'h-[41px] w-[24px] mr-2'}>
              <Box className={'stroke-1 w-7 h-7 ml-[-3px] mt-[-5px]'} />
            </div>
            <div className={'flex grow flex-col gap-0.5 h-full'}>
              <Title
                title={'Latest Block'}
              />
              <Skeleton className={'w-full max-w-24 h-[18px] mt-0.5'} />
            </div>
          </div>
          <div className={'flex flex-row items-end'}>
            <div className={'h-[41px] w-[24px] mr-2'}>
              <RefreshCcw className={'stroke-1 w-[26px] h-[26px] ml-[-1px] mt-[-7px] lg:mt-[-14px]'} />
            </div>
            <div className={'flex grow flex-col gap-0.5 h-full'}>
              <div className={'text-xs tracking-tight text-[color:--secondary] uppercase'}>
                <Title
                  title={'Indexer Block'}
                />
              </div>
              <Skeleton className={'w-full min-w-20 max-w-28 h-[18px] mt-0.5'} />
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
              <Skeleton className={'w-full max-w-32 h-[18px] mt-0.5'} />
            </div>
          </div>
          <div className={'flex flex-col items-end gap-0.5'}>
            <div className={'flex gap-2'}>
              <BoxLabel label={'24H'} />
              <Title
                title={'Relays'}
              />
            </div>
            <Skeleton className={'w-full min-w-20 max-w-32 h-[18px] mt-0.5'} />
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
              <Skeleton className={'w-full max-w-36 h-[18px] mt-0.5'} />
            </div>
          </div>
          <div className={'flex flex-col items-end gap-0.5'}>
            <div className={'flex'}>
              <p className={'text-xs tracking-tight text-[color:--secondary] text-right'}>
                TOTAL STAKED
              </p>
            </div>
            <Skeleton className={'w-full max-w-32 h-[18px] mt-0.5'} />
          </div>
        </div>
      </div>

      <div
        className={'flex md:col-span-2 lg:col-span-1 flex-col border-t lg:pt-0 pt-5 lg:border-t-0 gap-y-2.5 lg:pl-5 lg:border-l border-[color:--divider]'}>
        <div className={'flex grow'}>
          <Title
            title={'Computed Units Last 7 Days'}
          />
        </div>
        <div className={'h-[116px] lg:h-[100px] w-[calc(100vw-90px)] md:w-full flex min-w-0'}>
          <LineChartLoader />
        </div>
      </div>
    </>
  )
}

export default function SummaryLoader() {
  return (
    <div
      className={'bg-[color:--main-background] gap-y-[20px] p-5 min-h-[180px] lg:h-[180px] rounded-xl border border-[color:--divider] grid md:grid-cols-2 lg:grid-cols-3 base-shadow z-10 relative'}
    >
      <ContentLoader />
    </div>
  )
}
