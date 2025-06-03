import { PageProps } from '@/app/types/pages'
import ListTitle from '@/app/components/ListTitle'
import React from 'react'
import MorseClaimableAccountTable from '@/app/migration/Table'
import SearchByAddress from '@/app/migration/SearchByAddress'
import { isValidMorseAddress, isValidPoktAddress } from '@/app/utils/poktroll'
import { getClient } from '@/app/config/apollo/rsc'
import { morseClaimableAccountsSummaryDocument } from '@/app/migration/operations'
import Summary from '@/app/migration/Summary'

export const dynamic = "force-dynamic";

export default async function MigrationPage({searchParams}: PageProps) {
  const [awaitedSearchParams] = await Promise.all([
    searchParams
  ])

  const addressFromSearch = awaitedSearchParams['address']

  let defaultValueOfSearch: string | undefined = undefined

  if (typeof addressFromSearch === 'string' && (isValidPoktAddress(addressFromSearch) || isValidMorseAddress(addressFromSearch))) {
    defaultValueOfSearch = addressFromSearch
  }

  const [table, { data: summaryData }] = await Promise.all([
    <MorseClaimableAccountTable
      key={'morse-claimable-accounts-table'}
      searchParams={searchParams}
      address={defaultValueOfSearch}
      basePath={'/migration'}
    />,
    getClient().query({
      query: morseClaimableAccountsSummaryDocument,
    })
  ])

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Morse Claimable Accounts'} />
      <Summary initialData={summaryData} />
      <SearchByAddress defaultValue={defaultValueOfSearch} />
      {table}
    </div>
  )
}
