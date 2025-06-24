import React, { Suspense } from 'react'
import ListTitle from '@/app/components/ListTitle'
import GatewaysTable, { columns } from '@/app/components/GatewaysTable/GatewaysTable'
import { getPageAndItems } from '@/app/utils/pagination'
import LoadingListView from '@/app/components/LoadingListView'

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function ServerGatewaysPage({searchParams}: PageProps) {
  const {page, itemsPerPage,} = await getPageAndItems(searchParams)
  return (
    <GatewaysTable
      page={page}
      itemsPerPage={itemsPerPage}
      basePath={'/apps'}
    />
  )
}

export default async function GatewaysPage({searchParams}: PageProps) {
  const pageInfo = await getPageAndItems(searchParams)

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Gateways'} />
      <Suspense
        key={`gateways-page-${pageInfo.page}-${pageInfo.itemsPerPage}-${new Date().toISOString()}`}
        fallback={
          <LoadingListView
            columns={columns}
            rowsAmount={pageInfo.itemsPerPage}
          />
        }
      >
        <ServerGatewaysPage searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
