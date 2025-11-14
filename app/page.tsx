import Home from '@/app/(home)/Page'
import { cookies } from 'next/headers'
import { chartTypeCookieKey, timeCookieKey } from '@/app/(home)/CustomizableCompUnitsChart/constants'
import { getSummaryData } from '@/app/api/summary'
import { getEvolutionData } from '@/app/api/evolution'
import { getServicesData } from '@/app/api/services'
import { getCompUnitsData } from '@/app/api/compunits'

export const dynamic = "force-dynamic";

const rpcUrl = process.env.RPC_BASE_URL!

export default async function HomePage({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  const [search, awaitedCookies] = await Promise.all([
    searchParams,
    cookies(),
  ])

  const cookieTime = awaitedCookies.get(timeCookieKey)?.value

  // Fetch all data in parallel for fast initial render
  const [summaryData, evolutionData, servicesData, compUnitsData] = await Promise.all([
    getSummaryData().catch(() => null),
    getEvolutionData().catch(() => null),
    getServicesData().catch(() => null),
    getCompUnitsData(cookieTime).catch(() => null),
  ])

  return (
    <Home
      searchParams={search}
      rpcUrl={rpcUrl}
      computedUnitsSelectedTime={cookieTime}
      computedUnitsChartType={awaitedCookies.get(chartTypeCookieKey)?.value}
      initialSummaryData={summaryData}
      initialEvolutionData={evolutionData}
      initialServicesData={servicesData}
      initialCompUnitsData={compUnitsData}
    />
  );
}
