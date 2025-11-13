'use client'

import { getRows } from '@/app/(details)/block/[id]/utils'
import React from 'react'
import TitleEntity from '@/app/components/TitleEntity'
import getBlock from '@/app/(details)/block/[id]/getBlock'
import { useApolloClient } from '@apollo/client'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import EntityDetail from '@/app/components/EntityDetail'
import { getSourceChipsRow } from '@/app/components/SourceChips'
import EntityNotFound from '@/app/(details)/EntityNotFound'
import { useQuery } from '@tanstack/react-query'

interface BlockDetailProps {
  id: string
  rpcUrl: string
}

export default function BlockDetail({id, rpcUrl, }: BlockDetailProps) {
  const client = useApolloClient()

  const {isError, isLoading, data, refetch} = useQuery({
    queryKey: ['block', id],
    queryFn: () => getBlock(id, rpcUrl, client)
  })

  let content: React.ReactNode

  if (isLoading) {
    content = (
      <div className="w-full flex [&_div]:w-full">
        <EntityDetail items={getRows(null, true)} />
      </div>
    )
  } else if (isError) {
    content = (
      <div className="h-[162px] w-full flex bg-[color:--main-background] rounded-lg border border-[color:--divider] base-shadow p-4">
        <BaseRetryError onRetry={refetch}/>
      </div>
    )
  } else if (!data) {
    content = (
      <EntityNotFound id={id} />
    )
  } else {
    content = (
      <EntityDetail
        items={[
          ...(data.source ? [getSourceChipsRow(data.source)] : []),
          ...getRows(data.data)
        ]}
      />
    )
  }

  return (
    <>
      <TitleEntity title={'Block'} text={'#' + id} />
      {content}
    </>
  )
}
