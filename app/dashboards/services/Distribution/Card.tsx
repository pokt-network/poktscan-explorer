import BoxLabel from '@/app/components/BoxLabel'
import { getTimeBoxLabel } from '@/app/dashboards/services/utils'
import React from 'react'
import { containerId } from '@/app/dashboards/services/Distribution/constants'

interface DistributionCardProps {
  timeSelected: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export default function Card({
  timeSelected,
  children: chart,
  actions,
}: DistributionCardProps) {
  return (
    <div id={containerId} className={"min-h-[400px] sm:h-[400px] w-full xl:w-[500px] xl:min-w-[500px] flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
      <div className={'flex flex-row px-4 pt-3 pb-1 items-center justify-between'}>
        <div className={'flex flex-row items-center gap-1 h-7'}>
          <p className={'text-lg font-semibold'}>
            Distribution
          </p>
          <BoxLabel label={getTimeBoxLabel(timeSelected)} />
        </div>

        {actions}
      </div>
      <div className={'sm:h-[calc(400px-44px)] grow flex items-center justify-center pb-8'}>
        <div className={'w-full sm:max-w-[500px] flex items-center justify-center'}>
          {chart}
        </div>
      </div>
    </div>
  )
}
