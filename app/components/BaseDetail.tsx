'use client'

import React from 'react'
import { useApolloClient } from '@apollo/client'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import EntityDetail, { Item } from '@/app/components/EntityDetail'
import { getSourceChipsRow } from '@/app/components/SourceChips'
import EntityNotFound from '@/app/(details)/EntityNotFound'
import { useQuery } from '@tanstack/react-query'
import { FetchResult } from '@/app/utils/fetch'

interface DetailWrapperProps<T, TResult> {
  id: string
  rpcUrl: string
  entity: string
  fetchFunction: (id: string, rpcUrl: string, client: any) => Promise<TResult>
  // Rendering configuration
  getRows: (data: T | null, loading?: boolean) => Array<Item>
  showNotFoundForMissingData?: boolean
  pollInterval?: number
}

export default function BaseDetail<T, TResult>({
                                                    id,
                                                    rpcUrl,
  entity,
                                                    fetchFunction,
                                                    getRows,
                                                         pollInterval
                                                  }: DetailWrapperProps<T, TResult>) {
  const client = useApolloClient()
  const {isError, isLoading, data, refetch} = useQuery({
    queryKey: [entity, id],
    queryFn: () => fetchFunction(id, rpcUrl, client),
    refetchInterval: pollInterval,
  })

  if (isLoading) {
    return (
      <div className="w-full flex [&_div]:w-full">
        <EntityDetail items={getRows(null, true)} />
      </div>
    )
  } else if (isError) {
    return (
      <div className="h-[162px] w-full flex bg-[color:--main-background] rounded-lg border border-[color:--divider] base-shadow p-4">
        <BaseRetryError onRetry={refetch}/>
      </div>
    )
  } else if (data) {
    const {source, height, data: dataForRows} = data as unknown as FetchResult<T>

    if (!dataForRows) return <EntityNotFound id={id}/>

    return (
      <EntityDetail
        items={[
          ...(source ? [getSourceChipsRow(source, height)] : []),
          ...getRows(dataForRows)
        ]}
      />
    )
  } else {
    return <EntityNotFound id={id} />
  }
}
