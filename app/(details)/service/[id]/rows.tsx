import { Item } from '@/app/components/EntityDetail'
import { formatSimpleAmount } from '@/app/utils/format'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'
import { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { serviceByIdDocument } from '@/app/(details)/service/[id]/operations'
import { GetServiceResult } from '@/app/(details)/service/[id]/getService'

export function parseServiceFromIndexer(data: DocumentNodeData<typeof serviceByIdDocument>) {
  if (!data?.service) {
    return null
  }

  const service = data.service

  return {
    id: service.id,
    name: service.name,
    computeUnitsPerRelay: service.computeUnitsPerRelay,
    ownerAddress: service.ownerId,
    relayMiningDifficulty: service.relayMiningDifficultyUpdatedEvents?.nodes?.[0]?.newNumRelaysEma,
    applications: service.apps.totalCount,
    suppliers: service.suppliers.totalCount,
  }
}

export default function getRows(service: GetServiceResult['data'], isLoading = false) {
  const skeleton = isLoading ? (
    <Skeleton className={'w-[200px] h-5'} />
  ) : null

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'ID',
      value: skeleton || service!.id
    },
    {
      type: 'row',
      label: 'Label',
      value: skeleton || service!.name
    },
    {
      type: 'row',
      label: 'Compute Units Per Relay',
      value: skeleton || service!.computeUnitsPerRelay
    },
    {
      type: 'row',
      label: 'Relay Mining Difficulty',
      value: skeleton ? skeleton : service?.relayMiningDifficulty ? formatSimpleAmount(service?.relayMiningDifficulty) : '-'
    },
  ]

  if (typeof service?.suppliers === 'number') {
    rows.push(
      {
        type: 'row',
        label: 'Applications',
        value: skeleton || service.applications
      },
      {
        type: 'row',
        label: 'Suppliers',
        value: skeleton || service.suppliers
      }
    )
  }

  return rows
}
