'use client'

import EntityDetail from '@/app/components/EntityDetail'
import React, { useMemo } from 'react'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { appByIdDocument } from '@/app/app/[id]/operations'
import NotFound from '@/app/not-found'
import getRows from '@/app/app/[id]/rows'

interface AppDetailProps {
  initialData: DocumentNodeData<typeof appByIdDocument>
  id: string
}

export default function AppDetail({initialData, id}: AppDetailProps) {
  const variables = useMemo(() => ({id}), [id])

  const data = useFetchOnBlock({
    query: appByIdDocument,
    variables,
    initialResult: initialData
  })

  if (!data.application) {
    return (
      <NotFound />
    )
  }

  const app = data.application

  return (
    <EntityDetail
      items={getRows(app)}
    />
  )
}
