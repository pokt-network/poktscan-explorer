'use client'

import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import React, { useMemo } from 'react'
import NotFound from '@/app/not-found'
import EntityDetail from '@/app/components/EntityDetail'
import { serviceByIdDocument } from '@/app/service/[id]/operations'
import getRows from '@/app/service/[id]/rows'

interface ServiceDetailProps {
  initialData: DocumentNodeData<typeof serviceByIdDocument>
  id: string
}

export default function ServiceDetail({id, initialData}: ServiceDetailProps) {
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

  return (
    <EntityDetail
      items={getRows(service)}
    />
  )
}
