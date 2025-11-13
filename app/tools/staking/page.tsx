import { PageProps } from '@/app/types/pages'
import { cookies } from 'next/headers'
import SuppliersTable from '@/app/components/SuppliersTable/SuppliersTable'
import { addressesCookieKey } from '@/app/tools/staking/constants'
import { getPageAndItems } from '@/app/utils/pagination'
import { getValidAddresses } from '@/app/tools/utils'
import NoData from '@/app/components/NoData'

export default async function NodeRunningPage({searchParams}: PageProps) {
  const [searchParamsAwaited, {itemsPerPage, page}, cookiesAwaited] = await Promise.all([
    searchParams,
    getPageAndItems(searchParams),
    cookies()
  ])

  const activeFilter = typeof searchParamsAwaited.filter === 'string' ? searchParamsAwaited.filter : undefined
  let validAddresses = getValidAddresses(searchParamsAwaited?.addresses as string)

  if (!validAddresses.length) {
    validAddresses = getValidAddresses(cookiesAwaited.get(addressesCookieKey)?.value || '')
  }

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
      <SuppliersTable
        page={page}
        itemsPerPage={itemsPerPage}
        basePath={`/tools/staking?addresses=${validAddresses.join(',')}`}
        owners={validAddresses}
        activeFilter={activeFilter}
      />
    </>
  )
}
