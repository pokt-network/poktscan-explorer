import { getPageAndItems } from '@/app/utils/pagination'
import { getClient } from '@/app/config/apollo/rsc'
import React from 'react'
import ListTitle from '@/app/components/ListTitle'
import { applicationSummaryDocument } from '@/app/apps/operations'
import Summary from '@/app/apps/Summary'
import AppsTable from '@/app/components/AppsTable/AppsTable'

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AppsPage({searchParams}: PageProps) {
  const client = getClient()

  const {page, itemsPerPage,} = await getPageAndItems(searchParams)
  const [appsTable, {data: summaryData}] = await Promise.all([
    <AppsTable page={page} itemsPerPage={itemsPerPage} basePath={'/apps'} key={'apps'} />,
    client.query({
      query: applicationSummaryDocument,
    })
  ])

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Applications'} />
      <Summary initialData={summaryData} />
      {appsTable}
    </div>
  )
}
