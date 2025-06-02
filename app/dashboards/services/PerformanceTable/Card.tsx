import BoxLabel from '@/app/components/BoxLabel'
import { getTimeBoxLabel } from '@/app/dashboards/services/utils'
import React from 'react'

interface PerformanceTableCardProps {
  timeSelected: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export default function PerformanceTableCard({
  timeSelected,
  children,
  actions
}: PerformanceTableCardProps) {
  return (
    <div className={"h-[400px] w-full xl:w-[calc(100%-516px)] flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
      <div className={'flex flex-row px-4 pt-3 pb-2 items-center justify-between'}>
        <div className={'flex flex-row items-center gap-1 h-7'}>
          <h2 className={'text-lg font-semibold'}>
            Performance
          </h2>
          <BoxLabel label={getTimeBoxLabel(timeSelected)} />
        </div>

        {actions}
      </div>

      {children}
    </div>
  )
}
