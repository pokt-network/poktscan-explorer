import React from 'react'
import BoxLabel from '@/app/components/BoxLabel'
import { getTimeBoxLabel } from '@/app/dashboards/services/utils'

interface ByTimeTableCardProps {
  timeSelected: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export default function ByTimeTableCard({
  children,
  timeSelected,
  actions,
}: ByTimeTableCardProps) {
  return (
    <div className={"md:min-h-[400px] h-full w-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
      <div className={'flex mb-2 flex-row px-4 pt-3 pb-1 items-center justify-between'}>
        <div className={'flex flex-row items-center gap-1 h-7'}>
          <p className={'text-lg font-semibold leading-7'}>
            By Time
          </p>
          <BoxLabel label={getTimeBoxLabel(timeSelected)} />
        </div>

        {actions}
      </div>

      {children}
    </div>
  )
}
