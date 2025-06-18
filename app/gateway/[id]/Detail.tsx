'use client'

import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { gatewayByIdDocument } from '@/app/gateway/[id]/operations'
import React, { useMemo } from 'react'
import NotFound from '@/app/not-found'
import EntityDetail from '@/app/components/EntityDetail'
import getRows from '@/app/gateway/[id]/rows'

interface GatewayDetailProps {
  initialData: DocumentNodeData<typeof gatewayByIdDocument>
  id: string
}

export default function GatewayDetail({id, initialData}: GatewayDetailProps) {
  const variables = useMemo(() => ({id}), [id])
  const data = useFetchOnBlock({
    query: gatewayByIdDocument,
    variables,
    initialResult: initialData
  })

  if (!data.gateway) {
    return (
      <NotFound />
    )
  }

  const { gateway } = data

  return (
    <EntityDetail
      items={getRows(gateway)}
    />
  )
}
