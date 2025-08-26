import React from 'react'
import BoxLabel from '@/app/components/BoxLabel'
import { formatSimpleAmount } from '@/app/utils/format'

interface UptimeCardProps {
  children: React.ReactNode
  from: string
  to: string
  percent?: string
}

export default function UptimeCard({children, to, from, percent}: UptimeCardProps) {
  const boxLabel = !to && !from ? '' : `${formatSimpleAmount(from)} - ${formatSimpleAmount(to)}`
  return (
    <div className={"w-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
      <div className={'flex mb-2 flex-row px-4 pt-3 pb-1 items-center justify-between'}>
        <div className={'flex flex-row items-center gap-2 h-7'}>
          <p className={'text-lg font-semibold leading-7'}>
            Uptime
          </p>
          {percent && (
            <span className={'text-sm leading-7 font-medium'}>({percent}%)</span>
          )}
          {boxLabel && (
            <div className={'-ml-1 mt-1'}>
              <BoxLabel label={boxLabel} />
            </div>
          )}
        </div>
      </div>

      {children}
    </div>
  )
}
