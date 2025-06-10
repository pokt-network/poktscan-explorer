import { PageProps } from '@/app/types/pages'
import ListTitle from '@/app/components/ListTitle'
import React, { Suspense } from 'react'
import MorseClaimableAccountTable, { columns } from '@/app/migration/Table'
import SearchByAddress from '@/app/migration/SearchByAddress'
import { isValidMorseAddress, isValidPoktAddress } from '@/app/utils/poktroll'
import { getClient } from '@/app/config/apollo/rsc'
import { morseClaimableAccountsSummaryDocument } from '@/app/migration/operations'
import Summary from '@/app/migration/Summary'
import { getPageAndItems } from '@/app/utils/pagination'
import { LoadingSummary, LoadingTable } from '@/app/components/LoadingListView'
import { LabelByIndex } from '@/app/components/FourCards/utils'
import { Skeleton } from '@/components/ui/skeleton'

export const dynamic = "force-dynamic";

const summaryLabels: LabelByIndex = {
  1: 'Total Claimed',
  2: 'Claimed Liquid Balance',
  3: 'Claimed Supplier Stake',
  4: 'Claimed App Stake',
}

async function MigrationSummary() {
  const {data: summaryData} = await getClient().query({
    query: morseClaimableAccountsSummaryDocument,
  })

  return (
    <Summary initialData={summaryData} labels={summaryLabels} />
  )
}

async function MigrationTable({searchParams}: PageProps) {
  const awaitedSearchParams = await searchParams

  const addressFromSearch = awaitedSearchParams['address']

  let defaultValueOfSearch: string | undefined = undefined

  if (typeof addressFromSearch === 'string' && (isValidPoktAddress(addressFromSearch) || isValidMorseAddress(addressFromSearch))) {
    defaultValueOfSearch = addressFromSearch
  }

  return (
    <>
      <SearchByAddress defaultValue={defaultValueOfSearch} />
      <MorseClaimableAccountTable
        key={'morse-claimable-accounts-table'}
        searchParams={searchParams}
        address={defaultValueOfSearch}
        basePath={'/migration'}
      />
    </>
  )
}

export default async function MigrationPage({searchParams}: PageProps) {
  const pageInfo = await getPageAndItems(searchParams)
  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Morse Claimable Accounts'} />
      <div className={'-mt-6'}>
      </div>
      <Suspense
        key={`migration-summary`}
        fallback={
          <LoadingSummary
            labels={summaryLabels}
            defaultSkeleton={(
              <div className={'flex flex-col gap-1'}>
                <Skeleton className={'h-[19.5px] w-[120px] mt-2'} />
                <Skeleton className={'h-[19.5px] w-[170px]'} />
                <Skeleton className={'h-[11.5px] mt-2 w-full'} />
              </div>
            )}
          />
        }
      >
        <MigrationSummary />
      </Suspense>
      <Suspense
        key={`migration-page-${pageInfo.page}-${pageInfo.itemsPerPage}`}
        fallback={
          <LoadingTable
            columns={columns}
            rowsAmount={pageInfo.itemsPerPage}
          />
        }
      >
        <MigrationTable searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
