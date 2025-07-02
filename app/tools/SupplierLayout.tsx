import { cookies, headers } from 'next/headers'
import { getValidTime } from '@/app/utils/dates'
import {
  chartTypeCookieKey,
} from '@/app/tools/RewardsByAddresses/constants'
import { getValidAddresses } from '@/app/tools/utils'
import { SelectedAddressesProvider } from '@/app/tools/SelectedAddresses'
import SummaryAndRewards from '@/app/tools/SummaryAndRewards'
import { maxAddresses } from '@/app/tools/operator/constants'
import React from 'react'
import { SelectedTimeProvider, TimeSelector } from '@/app/Charts/SelectedTime'
import { selectedTimeCookieKey, selectedTimeParamKey } from '@/app/tools/constants'

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

  const time = getValidTime(
    awaitedHeaders.get('time') || ''
  )

  const validAddresses = getValidAddresses(awaitedHeaders.get('addresses') as string)

  const chartType = cookiesAwaited.get(chartTypeCookieKey)?.value || 'line'

  return (
    <SelectedTimeProvider defaultTime={time}>
      <SelectedAddressesProvider addresses={validAddresses}>
        <div className={"px-3 py-5 md:px-4 gap-6 flex min-h-[calc(100dvh-53px-57px-70px)] flex-col"}>
          <div className={'flex flex-row items-center gap-4 justify-between'}>
            <h1 className={'text-lg font-medium'}>
              {title}
            </h1>

            <TimeSelector
              enablePush={false}
              includeLabel={true}
              cookieKey={selectedTimeCookieKey}
              paramKey={selectedTimeParamKey}
            />
          </div>
          <SummaryAndRewards
            validAddresses={validAddresses}
            rewardsChartTime={time}
            chartType={chartType}
            isOwner={isOwner}
            pushOnAddressChange={pushOnAddressChange}
            inputHelperText={`Enter a comma-separated list of ${isOwner ? 'Owner' : 'Delegator'} addresses to search for. Max addresses allowed: ${maxAddresses}.`}
          />

          {children}
        </div>
      </SelectedAddressesProvider>
    </SelectedTimeProvider>
  )
}
