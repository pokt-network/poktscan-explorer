import React from 'react'
import { containerId } from '@/app/tools/RewardsByAddresses/constants'
import TimeBoxLabel from '@/app/tools/TimeBoxLabel'
import GroupAllSwitch from '@/app/tools/RewardsByAddresses/GroupAllSwitch'

interface ProductivityCardProps {
  children: React.ReactNode
  actions?: React.ReactNode
  disabled?: boolean
}

export default function RewardsByAddressCard({
  children,
  actions,
  disabled,
}: ProductivityCardProps) {
  return (
    <div id={containerId} className={"h-[600px] md:h-[400px] w-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
      <div className={'flex flex-row px-4 pt-3 pb-1 items-start sm:items-center justify-between'}>
        <div className={'flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 sm:h-7'}>
          <div className={'flex flex-row items-center gap-0 sm:gap-2'}>
            <p className={'text-lg font-semibold leading-7'}>
              Rewards
            </p>
            <TimeBoxLabel />
          </div>
          <GroupAllSwitch disabled={disabled} />
        </div>

        {actions}
      </div>

      {children}
    </div>
  )
}
