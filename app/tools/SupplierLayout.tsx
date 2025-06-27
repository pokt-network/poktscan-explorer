import { cookies, headers } from 'next/headers'
import { Time } from '@/app/dashboards/services/constants'
import {
  chartTypeCookieKey,
  selectedTimeCookieKey as chartSelectedTimeCookieKey,
} from '@/app/tools/RewardsByAddresses/constants'
import { getValidAddresses } from '@/app/tools/utils'
import { SelectedAddressesProvider } from '@/app/tools/SelectedAddresses'
import SummaryAndRewards from '@/app/tools/SummaryAndRewards'
import { maxAddresses } from '@/app/tools/operator/constants'
import React from 'react'

interface SupplierLayoutProps {
  children: React.ReactNode
  isOwner: boolean
  pushOnAddressChange?: boolean
  title: string
}

export default async function SupplierLayout({children, isOwner, pushOnAddressChange, title}: SupplierLayoutProps) {
  const [cookiesAwaited, awaitedHeaders] = await Promise.all([
    cookies(),
    headers()
  ])

  let rewardsChartTime = Time.Last7d

  const chartTimeFromCookie = cookiesAwaited.get(chartSelectedTimeCookieKey)?.value

  if (chartTimeFromCookie && Object.values(Time).includes(chartTimeFromCookie as Time) && chartTimeFromCookie !== Time.Last90d) {
    rewardsChartTime = chartTimeFromCookie as Time
  }

  const validAddresses = getValidAddresses(awaitedHeaders.get('addresses') as string)

  const chartType = cookiesAwaited.get(chartTypeCookieKey)?.value || 'line'

  return (
    <SelectedAddressesProvider addresses={validAddresses}>
      <div className={"px-3 py-5 md:px-4 gap-6 flex min-h-[calc(100dvh-53px-57px-70px)] flex-col"}>
        <div className={'flex flex-row items-center gap-4 justify-between'}>
          <h1 className={'text-lg font-medium'}>
            {title}
          </h1>
        </div>
        <SummaryAndRewards
          validAddresses={validAddresses}
          rewardsChartTime={rewardsChartTime}
          chartType={chartType}
          isOwner={isOwner}
          pushOnAddressChange={pushOnAddressChange}
          inputHelperText={`Enter a comma-separated list of ${isOwner ? 'Owner' : 'Delegator'} addresses to search for. Max addresses allowed: ${maxAddresses}.`}
        />

        {children}
      </div>
    </SelectedAddressesProvider>
  )
}
