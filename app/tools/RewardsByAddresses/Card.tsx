import React from 'react'
import { containerId, selectedTimeCookieKey } from '@/app/tools/RewardsByAddresses/constants'
import { Time } from '@/app/dashboards/services/constants'
import { TimeSelector } from '@/app/Charts/SelectedTime'

interface ProductivityCardProps {
  children: React.ReactNode
  actions?: React.ReactNode
  includeTimeSelector?: boolean
}

export default function RewardsByAddressCard({
  children,
  actions,
  includeTimeSelector,
}: ProductivityCardProps) {
  return (
    <div id={containerId} className={"h-[408px] w-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
      <div className={'flex flex-row px-4 pt-3 pb-1 items-start sm:items-center justify-between'}>
        <div className={'flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 sm:h-7'}>
          <p className={'text-lg font-semibold leading-7'}>
            Rewards
          </p>
          {includeTimeSelector && (
            <TimeSelector
              includeLabel={false}
              options={[
                Time.Last24h,
                Time.Last7d,
                Time.Last30d,
              ]}
              cookieKey={selectedTimeCookieKey}
            />
          )}
        </div>

        {actions}
      </div>

      {children}
    </div>
  )
}
