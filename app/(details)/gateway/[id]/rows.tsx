import type { Item } from '@/app/components/EntityDetail'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatUpokt } from '@/app/utils/format'

export default function getRows(gateway, isLoading = false) {
  const skeleton = isLoading ? (
    <Skeleton className={'w-[200px] h-5'} />
  ) : null

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Balance',
      value: skeleton || formatUpokt({
        amount: gateway.balance,
        abbreviateThreshold: Infinity,
        maxDecimals: 6
      })
    },
    {
      type: 'divider'
    },
    {
      type: 'row',
      label: 'Status',
      value: skeleton || gateway.status
    },
    {
      type: 'row',
      label: 'Stake Amount',
      value: skeleton || formatUpokt({
        amount: gateway.stake,
        abbreviateThreshold: Infinity,
        maxDecimals: 6
      })
    },
  ]

  if (!isLoading && gateway.status !== 'Staked' && gateway.unstakingBeginAt) {
    rows.push({
      type: 'divider'
    }, {
      type: 'row',
      label: 'Unstaking Begin At',
      value: gateway.unstakingBeginBlock!.height
    })

    if (gateway.unstakingEndBlock) {
      rows.push({
        type: 'row',
        label: 'Unstaked At Height',
        value: gateway.unstakingEndBlock!.height
      })
    }
  }

  return rows
}
