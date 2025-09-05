import { Item } from '@/app/components/EntityDetail'
import { formatUpokt } from '@/app/utils/format'
import EntityLink from '@/app/components/EntityLink'
import DateColumn from '@/app/dates/DateColumn'
import DateCellText from '@/app/dates/DateCellText'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function getRows(account, isLoading = false) {
  const skeleton = isLoading ? (
    <Skeleton className={'w-[200px] h-5'} />
  ) : null

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Balance',
      value: skeleton || formatUpokt({
        amount: account.amount,
        abbreviateThreshold: Infinity,
        maxDecimals: 6
      })
    },
  ]

  if (account?.height) {
    rows.push({
        type: 'divider'
      },
      {
        type: 'row',
        label: 'Updated At Block',
        value: (
          <div className={"text-sm"}>
            <EntityLink entity={'block'} entityId={account.height} copy={{enabled: true}}/>
          </div>
        )
      },
      {
        type: 'row',
        label: <DateColumn />,
        value: (
          <div className={"text-sm"}>
            <DateCellText value={account.timestamp} />
          </div>
        )
      })
  }

  return rows
}
