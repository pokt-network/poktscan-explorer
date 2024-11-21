import Price from '@/app/components/Price'
import getPrice from '@/app/api/price'
import SearchInput from '@/app/Search/Search'
import ComputeUnitsLineChart from '@/app/(home)/ComputeUnitsLineChart'
import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import { formatBalance } from '@/app/utils/balances'
import { fillMissingDays, formatTimeDifference } from '@/app/(home)/utils'
import EntityLink from '@/app/components/EntityLink'
import SupplierAndAppsEvolution from '@/app/(home)/SupplierAndAppsEvolution'
import ServicesCard from '@/app/(home)/ServicesCard'
import BoxLabel from '@/app/components/BoxLabel'
import { getLatestBlock } from '@/app/api/blocks'

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
    <p className={'text-sm font-bold text-neutral-700 dark:text-[color:--foreground]'}>
      {title}
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
        <div className={'text-sm font-bold mr-[-10px]'}>
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
      value: latestBlock.stakedApps.toLocaleString()
    },
    {
      label: 'Staked Gateways',
      value: latestBlock.stakedGateways.toLocaleString()
    },
    {
      label: 'Staked Suppliers',
      value: latestBlock.stakedSuppliers.toLocaleString()
    },
  ]

  return (
    <>
      <section
        className='pt-7 md:pt-14 pb-20 px-4 md:px-10'
      >
        <h1 className='text-white text-lg font-bold mb-1'>
          The Pocket Network Shannon Explorer
        </h1>
        <div className={'absolute z-[-1] top-0 left-0 right-0 h-[330px] bg-sky-950 dark:bg-[color:--main-background]'}
             style={{ backgroundImage: 'url(/waves-light.svg)' }}
        />
        <div className={'w-full md:w-[480px] lg:w-[580px] base-shadow'}>
          <SearchInput zIndex={1} height={44} />
        </div>
      </section>
      <div className={'px-4 md:px-10 pb-4 lg:pb-10 mt-[-44px]'}>
        <div
          className={'bg-[color:--main-background] gap-y-[20px] p-5 min-h-[180px] lg:h-[180px] rounded-lg border border-[color:--divider] grid md:grid-cols-2 lg:grid-cols-3 base-shadow'}
      >
        <div className={'flex flex-col gap-y-5 pr-5'}>
          <div className={'flex grow flex-col gap-2 h-full'}>
            <Title
              title={'POKT Price'}
            />
            <Price usd={price.usd} usd_24h_change={price.usd_24h_change} usd_market_cap={price.usd_market_cap}
                   showLabel={false} priceColor={'--foreground'} />
          </div>
          <hr className={'border-[color:--divider]'} />
          <div className={'flex grow flex-col gap-2 h-full'}>
            <Title
              title={'Market Cap'}
            />
            <p className={'text-xs'}>
              ${Number(price.usd_market_cap.toFixed(2)).toLocaleString()}
            </p>
          </div>
        </div>

        <div
          className={'flex flex-col gap-y-5 border-t md:pt-0 pt-5 md:border-t-0 md:px-5 md:border-l border-[color:--divider]'}
        >
          <div className={'flex h-full justify-between'}>
            <div className={'flex flex-col gap-2'}>
              <div className={'flex'}>
                <Title
                  title={'Compute Units'}
                />
                <BoxLabel label={'24H'} />
              </div>
              <p className={'text-xs'}>{summary.totalComputedUnits.toLocaleString()}</p>
            </div>
            <div className={'flex flex-col items-end gap-2'}>
              <div className={'flex gap-2'}>
                <BoxLabel label={'24H'} />
                <Title
                  title={'Relays'}
                />
              </div>
              <p className={'text-xs'}>{summary.totalRelays.toLocaleString()}</p>
            </div>
          </div>
          <hr className={'border-[color:--divider]'} />
          <div className={'flex h-full justify-between'}>
            <div className={'flex flex-col gap-2'}>
              <Title
                title={'Total Supply'}
              />
              <p className={'text-xs'}>{formatBalance(currentSupply)}</p>
            </div>
            <div className={'flex flex-col items-end gap-2'}>
              <div className={'flex'}>
                <p className={'text-sm font-bold text-neutral-600 dark:text-[color:--foreground] text-right'}>
                  Total Staked
                </p>
              </div>
              <p className={'text-xs'}>{formatBalance({
                // todo remove number, this must accept BigInt
                amount: Number(totalStaked),
                denom: 'upokt',
              })}</p>
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
          <div className={'h-[100px] w-[calc(100vw-80px)] md:w-full flex min-w-0'}>
            <ComputeUnitsLineChart data={groupByDay} />
          </div>
        </div>
      </div>
      </div>

      <div className={'px-4 md:px-10 pb-10 flex lg:flex-row flex-col gap-4 lg:gap-10'}>
        <div className={'w-full lg:w-[50%] flex flex-col gap-4'}>
          <div className={'bg-[color:--main-background]  pb-2 border-[color:--divider] border rounded-lg base-shadow'}>
            <div className={'h-[50px] p-4 flex items-center border-b border-[color:--divider]'}>
              <p className={'font-bold'}>
                Latest Block
              </p>
            </div>
            <div className={'px-4'}>
              {
                latestBlockItems.map((item, index,) => (
                  <div key={index}
                       className={`flex items-center justify-between h-[40px] ${index !== latestBlockItems.length - 1 ? 'border-b' : ''} border-[color:--divider] px-2`}>
                    <p className={'text-sm font-bold text-neutral-700 dark:text-[color:--foreground]'}>
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
