import React from 'react'
import TimeBoxLabel from '@/app/tools/TimeBoxLabel'

interface ByTimeTableCardProps {
  children: React.ReactNode
  actions?: React.ReactNode
}

export default function RewardsByServiceCard({
  children,
  actions,
}: ByTimeTableCardProps) {
  return (
    <div className={"md:min-h-[400px] md:max-h-[400px] h-full w-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
      <div className={'flex mb-2 flex-row px-4 pt-3 pb-1 items-center justify-between'}>
        <div className={'flex flex-row items-center gap-2 h-7'}>
          <p className={'text-lg font-semibold leading-7'}>
            Rewards By Service
          </p>
          <TimeBoxLabel />
        </div>

        {actions}
      </div>

      {children}
    </div>
  )
}
