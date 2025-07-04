import { Suspense } from 'react'
import { LoadingTable } from '@/app/components/LoadingListView'
import AppsTable, { columns } from '@/app/components/AppsTable/AppsTable'
import { getPageAndItems } from '@/app/utils/pagination'

interface AppsDelegatedTabsProps {
  gateway: string
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function ServerAppsDelegatedTabs({gateway, searchParams}: AppsDelegatedTabsProps) {
  const [pageInfo, sParams] = await Promise.all([
    getPageAndItems(searchParams),
    searchParams
  ])

  const activeFilter = typeof sParams.filter === 'string' ? sParams.filter : undefined

  return (
    <AppsTable
      gateway={gateway}
      page={pageInfo.page}
      itemsPerPage={pageInfo.itemsPerPage}
      basePath={`/gateway/${gateway}?tab=apps_delegated`}
      activeFilter={activeFilter}
    />
  )
}

export default async function AppsDelegatedTabs({gateway, searchParams}: AppsDelegatedTabsProps) {
  const pageInfo = await getPageAndItems(searchParams)

  return (
    <Suspense
      key={`${gateway}-${new Date().toISOString()}`}
      fallback={
        <LoadingTable columns={columns} rowsAmount={pageInfo.itemsPerPage} />
      }
    >
      <ServerAppsDelegatedTabs gateway={gateway} searchParams={searchParams} />
    </Suspense>
  )
}
