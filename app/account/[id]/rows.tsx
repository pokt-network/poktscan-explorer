import { Item } from '@/app/components/EntityDetail'
import { formatAmount } from '@/app/utils/format'
import EntityLink from '@/app/components/EntityLink'
import DateColumn from '@/app/dates/DateColumn'
import DateCellText from '@/app/dates/DateCellText'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function getRows(account, isLoading = false) {
  const skeleton = isLoading ? (
    <Skeleton className={'w-[200px] h-5'} />
  ) : null

  const upoktBalance = account?.balances?.nodes?.find((item) => item?.denom === 'upokt')

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Balance',
      value: skeleton || formatAmount(upoktBalance || {amount: '0', denom: 'upokt'})
    },
    {
      type: 'divider'
    },
    {
      type: 'row',
      label: 'Updated At Block',
      value: skeleton ? skeleton : upoktBalance ? (
        <div className={"text-sm"}>
          <EntityLink entity={'block'} entityId={upoktBalance.lastUpdatedBlock!.height} copy={{enabled: true}}/>
        </div>
      ) : '-'
    },
    {
      type: 'row',
      label: <DateColumn />,
      value: skeleton ? skeleton : upoktBalance ? (
        <div className={"text-sm"}>
          <DateCellText value={upoktBalance.lastUpdatedBlock!.timestamp} />
        </div>
      ) : '-'
    },
  ]

  return rows
}
