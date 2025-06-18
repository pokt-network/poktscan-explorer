import { Item } from '@/app/components/EntityDetail'
import { formatSimpleAmount } from '@/app/utils/format'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function getRows(service, isLoading = false) {
  const skeleton = isLoading ? (
    <Skeleton className={'w-[200px] h-5'} />
  ) : null

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'ID',
      value: skeleton || service.id
    },
    {
      type: 'row',
      label: 'Label',
      value: skeleton || service.name
    },
    {
      type: 'row',
      label: 'Compute Units Per Relay',
      value: skeleton || service.computeUnitsPerRelay
    },
    {
      type: 'row',
      label: 'Relay Mining Difficulty',
      value: skeleton ? skeleton : service?.newNumRelaysEma ? formatSimpleAmount(service?.newNumRelaysEma) : '-'
    },
    {
      type: 'row',
      label: 'Applications',
      value: skeleton || service.apps?.totalCount
    },
    {
      type: 'row',
      label: 'Suppliers',
      value: skeleton || service.suppliers?.totalCount
    }
  ]

  return rows
}
