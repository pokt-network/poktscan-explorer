import { formatAmount } from '@/app/utils/format'
import React from 'react'

export default function CoinsRow({ coins }: {
  coins: Array<{
  amount: string,
  denom: string,
}>}) {
  return (
    <div className={'text-sm flex flex-col gap-1.5'}>
      {coins.map((fee, index) => (
        <p key={fee.denom + index}>{formatAmount({
          ...fee,
          maxDecimals: 6
        })}</p>
      ))}
    </div>
  )
}
