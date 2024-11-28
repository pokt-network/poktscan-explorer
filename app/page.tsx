import Price from '@/app/components/Price'
import getPrice from '@/app/api/price'
import SearchInput from '@/app/Search/Search'
import ComputeUnitsLineChart from '@/app/(home)/ComputeUnitsLineChart'
import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import { fillMissingDays, formatTimeDifference } from '@/app/(home)/utils'
import EntityLink from '@/app/components/EntityLink'
import SupplierAndAppsEvolution from '@/app/(home)/SupplierAndAppsEvolution'
import ServicesCard from '@/app/(home)/ServicesCard'
import BoxLabel from '@/app/components/BoxLabel'
import { getLatestBlock } from '@/app/api/blocks'
import { formatAmount, formatUpokt } from '@/app/utils/format'
import PocketLogo from '@/app/assets/pocket_logo.svg'
import { Blend, Globe, Landmark } from 'lucide-react'
import SponsoredLabel from '@/app/components/SponsoredLabel'

export const dynamic = "force-dynamic";

const summaryDocument = graphql(`
  query summary($currentDate: Datetime!, $last24HourDate: Datetime!, $last7DaysDate: Datetime!) {
    lastBlock: blocks(orderBy: HEIGHT_DESC, first: 1) {
      nodes {
        height
        totalTxs
        timestamp
        totalRelays
        totalComputedUnits
        stakedApps
        stakedGateways
        stakedSuppliers
        timeToBlock
        stakedSuppliersTokens
        stakedAppsTokens
        stakedGatewaysTokens
        supplies {
          nodes {
            supply {
              denom
              amount
            }
          }
        }
        totalTxs
      }
    }
    blocks(filter: {timestamp: {greaterThanOrEqualTo: $last24HourDate, lessThanOrEqualTo: $currentDate}}) {
      aggregates {
        sum {
          totalRelays
          totalComputedUnits
        }
      }
    }
    groupByDay: blocks(filter: {timestamp: {greaterThanOrEqualTo: $last7DaysDate, lessThanOrEqualTo: $currentDate}}) {
      groupedAggregates(groupBy: TIMESTAMP_TRUNCATED_TO_DAY) {
        keys
        sum {
          totalRelays
          totalComputedUnits
        }
      }
    }
  }
`)

function Title({title}: {title: string}) {
  return (
    <p className={'text-xs tracking-tight text-[color:--secondary]'}>
      {title.toUpperCase()}
    </p>
  )
}

export default async function Home({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  const [search, latestBlock] = await Promise.all([
    searchParams,
    getLatestBlock()
  ])

  const currentDate = new Date(latestBlock.timestamp)
  const date24hBefore = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000)
  const date7DaysBefore = new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000)
  date7DaysBefore.setUTCHours(0, 0, 0, 0);

  const serviceContentType = search['dashboard_services_card']?.toString() || 'chart'

  const [price, { data }, supplierAndAppsEvolution, servicesCard] = await Promise.all([
    getPrice(),
    getClient().query({
      query: summaryDocument,
      variables: {
        last24HourDate: date24hBefore.toISOString(),
        last7DaysDate: date7DaysBefore.toISOString(),
        currentDate: currentDate.toISOString(),
      },
    }),
    <SupplierAndAppsEvolution
      key={'supplier-and-apps-evolution'}
      currentDate={currentDate}
    />,
    <ServicesCard
      defaultType={serviceContentType}
      key={'services-card'}
      currentDate={currentDate}
    />
  ])

  const currentSupply = latestBlock.supplies.nodes.at(0).supply
  const totalStaked = BigInt(latestBlock.stakedSuppliersTokens) + BigInt(latestBlock.stakedAppsTokens) + BigInt(latestBlock.stakedGatewaysTokens)
  const summary = data.blocks.aggregates.sum
  const groupByDay = fillMissingDays(data.groupByDay.groupedAggregates)

  const latestBlockItems = [
    {
      label: 'Height',
      value: (
        <div className={'text-sm mr-[-10px]'}>
          <EntityLink
            entity={'block'}
            entityId={latestBlock.height}
          />
        </div>
      )
    },
    {
      label: 'Timestamp',
      value: latestBlock.timestamp
    },
    {
      label: 'Took',
      value: formatTimeDifference(latestBlock.timeToBlock)
    },
    {
      label: 'Staked Apps',
      value: formatAmount({
        amount: latestBlock.stakedApps as string,
      })
    },
    {
      label: 'Staked Gateways',
      value: formatAmount({
        amount: latestBlock.stakedGateways as string,
      })
    },
    {
      label: 'Staked Suppliers',
      value: formatAmount({
        amount: latestBlock.stakedSuppliers as string,
      })
    },
  ]

  return (
    <>
      <section
        className='pt-7 relative md:pt-[56px] pb-[95px] px-4 md:px-5'
      >
        <h1 className='text-white text-lg font-bold leading-[24px] mb-3'>
          The Pocket Network Shannon Explorer
        </h1>
        <div className={'absolute z-[-1] w-[100vw] left-[calc((50%-50vw))] top-0 right-0 h-full bg-[color:#081d35] dark:bg-[color:rgb(10,10,10)]'}
             style={{ backgroundImage: 'url(/waves-light.svg)' }}
        />
        <div className={'w-full md:w-[480px] lg:w-[580px] mb-[12px]'}>
          <SearchInput zIndex={1} height={48} />
        </div>
        <SponsoredLabel />
      </section>
      <div className={'px-4 md:px-5 pb-4 mt-[-46px]'}>
        <div
          className={'bg-[color:--main-background] gap-y-[20px] p-5 min-h-[180px] lg:h-[180px] rounded-xl border border-[color:--divider] grid md:grid-cols-2 lg:grid-cols-3 base-shadow'}
      >
        <div className={'flex flex-col gap-y-5 pr-5'}>
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
                  usd={price?.usd || 0} usd_24h_change={price?.usd_24h_change || 0}
                  usd_market_cap={price?.usd_market_cap || 0}
                  showLabel={false}
                  priceColor={'--foreground'}
                  fontSize={'[15px]'}
                />
              </div>
            </div>
          </div>
          <hr className={'border-[color:--divider]'} />
          <div className={'flex grow flex-row h-full'}>
            <div className={'h-[41px] w-[24px] mr-2'}>
              <Globe className={'stroke-1 w-7 h-7 ml-[-3px] mt-[-5px]'}/>
            </div>
            <div className={'flex grow flex-col gap-0.5 h-full'}>
              <Title
                title={'Market Cap'}
              />
              <p className={'text-[15px]'}>
                ${formatAmount({
                amount: price?.usd_market_cap?.toFixed(2) || 0,
              })}
              </p>
            </div>
          </div>
        </div>

          <div
          className={'flex flex-col gap-y-5 border-t md:pt-0 pt-5 md:border-t-0 md:px-5 md:border-l border-[color:--divider]'}
        >
          <div className={'flex h-full justify-between'}>
            <div className={'flex grow flex-row h-full'}>
              <div className={'h-[41px] w-[24px] mr-2'}>
                <Blend className={'stroke-1 w-7 h-7 ml-[-3px] mt-[-5px]'}/>
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
                    amount: summary.totalComputedUnits,
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
                  amount: summary.totalRelays,
                })}
              </p>
            </div>
          </div>
          <hr className={'border-[color:--divider]'} />
          <div className={'flex h-full justify-between'}>
            <div className={'flex grow flex-row h-full'}>
              <div className={'h-[41px] w-[24px] mr-2'}>
                <Landmark className={'stroke-1 w-7 h-7 ml-[-3px] mt-[-5px]'}/>
              </div>

              <div className={'flex flex-col gap-0.5'}>
                <Title
                  title={'Total Supply'}
                />
                <p className={'text-[15px]'}>
                  {formatAmount({
                    amount: currentSupply.amount,
                    denom: currentSupply.denom,
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

          <div
            className={'flex md:col-span-2 lg:col-span-1 flex-col border-t lg:pt-0 pt-5 lg:border-t-0 gap-y-2.5 lg:pl-5 lg:border-l border-[color:--divider]'}>
            <div className={'flex grow'}>
              <Title
                title={'Computed Units Last 7 Days'}
              />
            </div>
            <div className={'h-[100px] w-[calc(100vw-90px)] md:w-full flex min-w-0'}>
              <ComputeUnitsLineChart data={groupByDay} />
            </div>
          </div>
        </div>
      </div>

      <div className={'px-4 md:px-5 pb-10 flex lg:flex-row flex-col gap-4'}>
        <div className={'w-full lg:w-[50%] flex flex-col gap-4'}>
          <div className={'bg-[color:--main-background]  pb-2 border-[color:--divider] border rounded-lg base-shadow'}>
            <div className={'h-[50px] p-4 flex items-center border-b border-[color:--divider]'}>
              <p className={'font-semibold text-[15px]'}>
                Latest Block
              </p>
            </div>
            <div className={'px-4'}>
              {
                latestBlockItems.map((item, index,) => (
                  <div key={index}
                       className={`flex items-center justify-between h-[40px] ${index !== latestBlockItems.length - 1 ? 'border-b' : ''} border-[color:--divider] px-2`}>
                    <p className={'text-sm text-neutral-700 dark:text-[color:--foreground]'}>
                      {item.label}
                    </p>
                    {typeof item.value === 'string' ? (
                      <p className={'text-sm'}>
                        {item.value}
                      </p>
                    ) : item.value}
                  </div>
                ))
              }
            </div>
          </div>
          {supplierAndAppsEvolution}
        </div>
        {servicesCard}
      </div>
    </>
  );
}
