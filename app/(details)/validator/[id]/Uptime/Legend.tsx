import React from 'react'
import { Check } from 'lucide-react'
import { formatSimpleAmount } from '@/app/utils/format'

interface LegendProps {
  missed?: number
  signed?: number
  proposed?: number
}

export default function Legend({
  missed,
  signed,
  proposed,
}: LegendProps) {
  return (
    <div className={'px-4 mb-4 gap-3 flex flex-col'}>
      <div className={'flex flex-row items-center gap-2'}>
        <div className={'h-4 !w-4 bg-[color:--success-background] flex items-center justify-center'}>
          <Check className={'h-3.5 w-3.5 text-[color:--success] stroke-[4px]'} />
        </div>
        <p className={'text-xs font-medium w-14'}>
          Proposed
        </p>
        {typeof proposed === 'number' && (
          <p className={'text-xs font-bold'}>
            {formatSimpleAmount(proposed)}
          </p>
        )}
      </div>
      <div className={'flex flex-row items-center gap-2'}>
        <div className={'h-4 !w-4 bg-[color:--success]'}/>
        <p className={'text-xs font-medium w-14'}>
          Signed
        </p>
        {typeof signed === 'number' && (
          <p className={'text-xs font-bold'}>
            {formatSimpleAmount(signed)}
          </p>
        )}
      </div>
      <div className={'flex flex-row items-center gap-2'}>
        <div className={'h-4 !w-4 bg-[color:--error]'}/>
        <p className={'text-xs font-medium w-14'}>
          Missed
        </p>
        {typeof missed === 'number' && (
          <p className={'text-xs font-bold'}>
            {formatSimpleAmount(missed)}
          </p>
        )}
      </div>
    </div>
  )
}
