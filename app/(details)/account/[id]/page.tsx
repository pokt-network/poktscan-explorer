import TransferAndTxTabs from '@/app/(transactions)/TransferAndTxTabs'
import { Suspense } from 'react'
import SuppliersTable, { columns } from '@/app/components/SuppliersTable/SuppliersTable'
import { getPageAndItems } from '@/app/utils/pagination'
import { LoadingTable } from '@/app/components/LoadingListView'

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{id: string}>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AccountDetailPage({params, searchParams}: PageProps) {
  return (
    <TransferAndTxTabs
      searchParams={searchParams}
      params={params}
      entity={'account'}
      supportMigrationTab={true}
      moreTabs={{
        position: 'beforeRaw',
        tabs: [
          {
            label: 'Suppliers',
            tab: 'suppliers'
          }
        ],
        getContent: async (tab) => {
          if (tab === 'suppliers') {
            const [{page, itemsPerPage}, {id}, sParams] = await Promise.all([
              getPageAndItems(searchParams),
              params,
              searchParams
            ])

            const activeFilter = typeof sParams.filter === 'string' ? sParams.filter : undefined

            return (
              <Suspense
                // we want the loading to appear always
                key={new Date().toISOString()}
                fallback={
                  <LoadingTable columns={columns} rowsAmount={itemsPerPage} />
                }
              >
                <SuppliersTable
                  page={page}
                  itemsPerPage={itemsPerPage}
                  basePath={`/account/${id}?tab=suppliers`}
                  owners={[id]}
                  activeFilter={activeFilter}
                />
              </Suspense>
            )
          }
        }
      }}
    />
  )
}
