import React from 'react'
import BoxLabel from '@/app/components/BoxLabel'
import { containerId } from '@/app/dashboards/services/Productivity/constants'
import { getTimeBoxLabel } from '@/app/utils/dates'

interface ProductivityCardProps {
  timeSelected: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export default function ProductivityCard({
  children,
  timeSelected,
  actions,
}: ProductivityCardProps) {
  return (
    <div id={containerId} className={"h-[660px] md:h-[400px] w-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
      <div className={'flex flex-row px-4 pt-3 pb-1 items-center justify-between'}>
        <div className={'flex flex-row items-center gap-1 h-7'}>
          <p className={'text-lg font-semibold leading-7'}>
            Productivity
          </p>
          <BoxLabel label={getTimeBoxLabel(timeSelected)} />
        </div>

        {actions}
      </div>

      {children}
    </div>
  )
}
