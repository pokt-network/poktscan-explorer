import Home from '@/app/(home)/Page'
import { cookies } from 'next/headers'
import { chartTypeCookieKey, timeCookieKey } from '@/app/(home)/CustomizableCompUnitsChart/constants'
import { getPublicRpcUrl } from '@/app/utils/rpcUrl'

export const dynamic = "force-dynamic";

const rpcUrl = getPublicRpcUrl()

export default async function HomePage({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  const [search, awaitedCookies] = await Promise.all([
    searchParams,
    cookies()
  ])

  return (
    <Home
      searchParams={search}
      rpcUrl={rpcUrl}
      computedUnitsSelectedTime={awaitedCookies.get(timeCookieKey)?.value}
      computedUnitsChartType={awaitedCookies.get(chartTypeCookieKey)?.value}
    />
  );
}
