'use client'

import React, { useMemo } from 'react'
import { useApolloClient } from '@apollo/client'
import { DocumentNode } from 'graphql'
import useFetchOnBlock from '@/app/hooks/useFetchOnBlock'
import ErrorBoundary from '@/app/components/ErrorBoundary'
import EntityDetail, { Item } from '@/app/components/EntityDetail'
import { getSourceChipsRow } from '@/app/components/SourceChips'
import EntityNotFound from '@/app/(details)/EntityNotFound'

interface DetailWrapperProps<T, TProps, TResult> {
  id: string
  source: 'indexer' | 'rpc' | null
  rpcUrl: string
  height?: number | string
  initialData: T | null
  error?: true | null

  // Data fetching configuration
  graphqlDocument: DocumentNode
  resultParser?: (data: any) => T | null
  fetchFunction: (id: string, rpcUrl: string, client: any) => Promise<TResult>

  // Rendering configuration
  getRows: (data: T | null, loading?: boolean) => Array<Item>
  showNotFoundForMissingData?: boolean

  // Component self-reference for error retry
  SelfComponent: (props: TProps) => React.JSX.Element

  skipRefetch?: boolean
}

export default function BaseDetail<T, TProps, TResult>({
                                                    id,
                                                    source,
                                                    rpcUrl,
                                                    height,
                                                    initialData,
                                                    error,
                                                    graphqlDocument,
                                                    resultParser,
                                                    fetchFunction,
                                                    getRows,
                                                    showNotFoundForMissingData = false,
                                                    SelfComponent,
  skipRefetch = false
                                                  }: DetailWrapperProps<T, TProps, TResult>) {
  const variables = useMemo(() => ({ id }), [id])
  const client = useApolloClient()

  const data = useFetchOnBlock({
    query: graphqlDocument,
    variables,
    initialResult: initialData,
    skip: source !== 'indexer' || skipRefetch,
    resultParser
  })

  // Handle not found case (only for components that need it)
  if (showNotFoundForMissingData && !data && !error) {
    return <EntityNotFound id={id} />
  }

  // Handle error case with retry functionality
  if (error) {
    return (
      <div className="h-[200px] w-full flex">
        <ErrorBoundary
          getProps={async () => {
            const res = await fetchFunction(id, rpcUrl, client)
            return {
              id,
              rpcUrl,
              ...res,
            } as TProps
          }}
          RenderElement={SelfComponent}
          fallback={
            <EntityDetail items={getRows(null, true)} />
          }
        />
      </div>
    )
  }

  // Successful render
  return (
    <EntityDetail
      items={[
        ...(source ? [getSourceChipsRow(source, height)] : []),
        ...getRows(data)
      ]}
    />
  )
}
