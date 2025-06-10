'use client'

import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { validatorByIdDocument } from '@/app/validator/[id]/operations'
import React, { useMemo } from 'react'
import NotFound from '@/app/not-found'
import EntityDetail from '@/app/components/EntityDetail'
import getRows from '@/app/validator/[id]/rows'

interface ValidatorDetailProps {
  initialData: DocumentNodeData<typeof validatorByIdDocument>
  id: string
}

export default function ValidatorDetail({ id, initialData }: ValidatorDetailProps) {
  const variables = useMemo(() => ({ id }), [id])
  const data = useFetchOnBlock({
    query: validatorByIdDocument,
    variables,
    initialResult: initialData,
  })

  if (!data.validator) {
    return (
      <NotFound/>
    )
  }

  const { validator } = data

  return (
    <EntityDetail
      items={getRows(validator)}
    />
  )
}
