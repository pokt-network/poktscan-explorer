import { getPageAndItems } from '@/app/utils/pagination'
import { getClient } from '@/app/config/apollo/rsc'
import React, { Suspense } from 'react'
import ListTitle from '@/app/components/ListTitle'
import { applicationSummaryDocument } from '@/app/apps/operations'
import Summary from '@/app/apps/Summary'
import AppsTable, { columns } from '@/app/components/AppsTable/AppsTable'
import { LabelByIndex } from '@/app/components/FourCards/utils'
import { LoadingSummary, LoadingTable } from '@/app/components/LoadingListView'

export const dynamic = "force-dynamic";

const summaryLabels: LabelByIndex = {
  1: 'Staked Applications',
  2: 'Staked Tokens',
  3: 'Unstaking Applications',
  4: 'Unstaking Tokens',
}

async function AppsSummary() {
  let data, error = false

  try {
    const response = await getClient().query({
      query: applicationSummaryDocument,
    })

    data = response.data
  } catch {
    error = true
  }

  return (
    <Summary initialData={data} initialError={error} labels={summaryLabels} />
  )
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function ServerAppsTable({searchParams}: PageProps) {
  const [{page, itemsPerPage,}, sParams] = await Promise.all([getPageAndItems(searchParams), searchParams])

  const activeFilter = typeof sParams.filter === 'string' ? sParams.filter : undefined

  return (
    <AppsTable
      page={page}
      itemsPerPage={itemsPerPage}
      basePath={'/apps'}
      key={'apps'}
      activeFilter={activeFilter}
    />
  )
}

export default async function AppsPage({searchParams}: PageProps) {
  const pageInfo = await getPageAndItems(searchParams)

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Applications'} />
      <Suspense
        key={`apps-summary`}
        fallback={
          <LoadingSummary
            labels={summaryLabels}
          />
        }
      >
        <AppsSummary />
      </Suspense>
      <Suspense
        key={`apps-page-${pageInfo.page}-${pageInfo.itemsPerPage}-${new Date().toISOString()}`}
        fallback={
          <LoadingTable
            columns={columns}
            rowsAmount={pageInfo.itemsPerPage}
          />
        }
      >
        <ServerAppsTable searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
