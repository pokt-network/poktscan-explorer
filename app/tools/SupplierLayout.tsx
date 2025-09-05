import { cookies, headers } from 'next/headers'
import { getValidTime } from '@/app/utils/dates'
import {
  chartTypeCookieKey,
} from '@/app/tools/RewardsByAddresses/constants'
import { getValidAddresses } from '@/app/tools/utils'
import { SelectedAddressesProvider } from '@/app/tools/SelectedAddresses'
import SummaryAndRewards from '@/app/tools/SummaryAndRewards'
import React from 'react'
import { SelectedTimeProvider, TimeSelector } from '@/app/Charts/SelectedTime'
import { selectedTimeCookieKey, selectedTimeParamKey } from '@/app/tools/constants'
import ResponsiveTooltip from '@/app/components/ResponsiveTooltip'
import { CircleHelp } from 'lucide-react'
import ManageAddresses from '@/app/tools/ManageAddresses/ManageAddresses'

interface SupplierLayoutProps {
  children: React.ReactNode
  isOwner: boolean
  pushOnAddressChange?: boolean
  title: string
  description: string
  addressesCookieKey?: string
}

export default async function SupplierLayout({
  children,
  isOwner,
  pushOnAddressChange,
  title,
  description,
  addressesCookieKey,
}: SupplierLayoutProps) {
  const [cookiesAwaited, awaitedHeaders] = await Promise.all([
    cookies(),
    headers()
  ])

  const time = getValidTime(
    awaitedHeaders.get('time') || ''
  )

  let validAddresses = getValidAddresses(awaitedHeaders.get('addresses') as string)

  if (!validAddresses.length && addressesCookieKey) {
    validAddresses = getValidAddresses(cookiesAwaited.get(addressesCookieKey)?.value || '')
  }

  const chartType = cookiesAwaited.get(chartTypeCookieKey)?.value || 'line'

  return (
    <SelectedTimeProvider defaultTime={time}>
      <SelectedAddressesProvider addresses={validAddresses}>
        <div className={"px-3 py-5 md:px-4 gap-2 flex min-h-[calc(100dvh-53px-57px-70px)] flex-col"}>
          <div className={'flex flex-row items-center gap-2 justify-between flex-wrap'}>
            <div className={'flex flex-row items-center gap-2 flex-wrap'}>
              <h1 className={'text-lg font-medium'}>
                {title}
              </h1>
              <ResponsiveTooltip
                trigger={(
                  <CircleHelp className={'w-4 h-4 text-[color:--secondary]'} />
                )}
                content={description}
              />
              <ManageAddresses
                pushOnChange={pushOnAddressChange}
                addressesCookieKey={addressesCookieKey}
              />

            </div>
            <div className={'flex flex-row items-center gap-3'}>
              <TimeSelector
                enablePush={false}
                includeLabel={true}
                cookieKey={selectedTimeCookieKey}
                paramKey={selectedTimeParamKey}
              />

            </div>
          </div>
          <hr className={'border-[color:--divider] my-2'} />

          <SummaryAndRewards
            validAddresses={validAddresses}
            rewardsChartTime={time}
            chartType={chartType}
            isOwner={isOwner}
          />

          {children}
        </div>
      </SelectedAddressesProvider>
    </SelectedTimeProvider>
  )
}
