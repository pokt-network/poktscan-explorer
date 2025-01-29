'use client'

import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import React, { useMemo } from 'react'
import NotFound from '@/app/not-found'
import EntityDetail, { Item } from '@/app/components/EntityDetail'
import TitleEntity from '@/app/components/TitleEntity'
import { serviceByIdDocument } from '@/app/service/[id]/operations'

interface ServiceDetailProps {
  initialData: DocumentNodeData<typeof serviceByIdDocument>
  id: string
  page: React.ReactNode
}

export default function ServiceDetail({id, initialData, page}: ServiceDetailProps) {
  const variables = useMemo(() => ({id}), [id])
  const data = useFetchOnBlock({
    query: serviceByIdDocument,
    variables,
    initialResult: initialData
  })

  if (!data.service) {
    return (
      <NotFound />
    )
  }

  const { service } = data

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'ID',
      value: service.id
    },
    {
      type: 'row',
      label: 'Label',
      value: service.name
    },
    {
      type: 'row',
      label: 'Compute Units Per Relay',
      value: service.computeUnitsPerRelay
    },
    {
      type: 'row',
      label: 'Applications',
      value: service.apps?.totalCount
    },
    {
      type: 'row',
      label: 'Suppliers',
      value: service.suppliers?.totalCount
    }
  ]

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <TitleEntity title={'Service'} text={service.id} />
      <EntityDetail
        items={rows}
      />
      {page}
    </div>
  )
}
