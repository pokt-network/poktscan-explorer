import { PageProps } from '@/app/types/pages'
import { Suspense } from 'react'
import { LoadingTable } from '@/app/components/LoadingListView'
import SuppliersTable, { columns as supplierColumns } from '@/app/components/SuppliersTable/SuppliersTable'
import { getPageAndItems } from '@/app/utils/pagination'
import { getValidAddresses } from '@/app/tools/utils'
import NoData from '@/app/components/NoData'

export default async function NodeRunningPage({searchParams}: PageProps) {
  const [searchParamsAwaited, {itemsPerPage, page}] = await Promise.all([
    searchParams,
    getPageAndItems(searchParams)
  ])

  const validAddresses = getValidAddresses(searchParamsAwaited?.addresses as string)

  if (!validAddresses.length) {
    return (
      <>
        <hr className={'border-[color:--divider] mb-4'} />
        <div className={"w-full h-[400px] flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
          <NoData label={'Please enter a comma-separated list of addresses to search for.'} />
        </div>
      </>
    )
  }

  return (
    <>
      <hr className={'border-[color:--divider] mb-4'} />
      <Suspense
        key={`${new Date().toISOString()}`}
        fallback={
          <LoadingTable
            columns={supplierColumns}
            rowsAmount={itemsPerPage}
          />
        }
      >
        <SuppliersTable
          page={page}
          itemsPerPage={itemsPerPage}
          basePath={`/tools/staking?addresses=${validAddresses.join(',')}`}
          owners={validAddresses}
        />
      </Suspense>
    </>
  )
}
