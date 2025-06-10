'use client'

import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { accountByIdDocument } from '@/app/account/[id]/operations'
import React, { useMemo } from 'react'
import { isValidPoktAddress } from '@/app/utils/poktroll'
import NotFound from '@/app/not-found'
import EntityDetail from '@/app/components/EntityDetail'
import getRows from '@/app/account/[id]/rows'

interface AccountDetailProps {
  initialData: DocumentNodeData<typeof accountByIdDocument>
  id: string
}

export default function AccountDetail({id, initialData}: AccountDetailProps) {
  const variables = useMemo(() => ({id}), [id])

  const data = useFetchOnBlock({
    query: accountByIdDocument,
    variables,
    initialResult: initialData
  })

  if (!data.account && !isValidPoktAddress(id)) {
    return (
      <NotFound />
    )
  }

  const { account } = data || {}

  return (
    <EntityDetail
      items={getRows(account)}
    />
  )
}
