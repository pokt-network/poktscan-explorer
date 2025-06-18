import { Suspense } from 'react'
import { LoadingTable } from '@/app/components/LoadingListView'
import AppsTable, { columns } from '@/app/components/AppsTable/AppsTable'
import { getPageAndItems } from '@/app/utils/pagination'

interface AppsDelegatedTabsProps {
  gateway: string
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function ServerAppsDelegatedTabs({gateway, searchParams}: AppsDelegatedTabsProps) {
  const pageInfo = await getPageAndItems(searchParams)

  return (
    <AppsTable
      page={pageInfo.page}
      itemsPerPage={pageInfo.itemsPerPage}
      basePath={`/gateway/${gateway}?tab=apps_delegated`}
    />
  )
}

export default async function AppsDelegatedTabs({gateway, searchParams}: AppsDelegatedTabsProps) {
  const pageInfo = await getPageAndItems(searchParams)

  return (
    <Suspense
      key={gateway}
      fallback={
        <LoadingTable columns={columns} rowsAmount={pageInfo.itemsPerPage} />
      }
    >
      <ServerAppsDelegatedTabs gateway={gateway} searchParams={searchParams} />
    </Suspense>
  )
}
