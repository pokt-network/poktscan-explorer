'use client'

import { useHeightContext } from '@/app/context/height'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { useEffect, useRef } from 'react'
import { useLazyQuery } from '@apollo/client'

export type DeepRequired<T> = NonNullable<{
  [K in keyof T]-?: T[K] extends object
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    ? T[K] extends Function
      ? T[K]
      : DeepRequired<NonNullable<T[K]>>
    : NonNullable<T[K]>;
}>;

export type DocumentNodeData<T extends TypedDocumentNode<any, any>> = T extends TypedDocumentNode<infer Data, any> ? Data : never;

export type ExtractVariables<T> = T extends TypedDocumentNode<any, infer Variables> ? Variables : never;

export interface FetchOnBlockOptions<
  T extends TypedDocumentNode<any, any>,
  R = DocumentNodeData<T>
> {
  query: T
  variables?:
    | ExtractVariables<T>
    | ((currentHeight: number, currentTime: string) => ExtractVariables<T>)
  resultParser?: (result: DeepRequired<DocumentNodeData<T>>) => R
  initialResult?: R
}

export default function useFetchOnBlock<
  T extends TypedDocumentNode<any, any>,
  R = DocumentNodeData<T>
>({
  query,
  variables,
  resultParser,
  initialResult,
}: FetchOnBlockOptions<T, R>): DeepRequired<R> {
  const {currentHeight, currentTime, firstHeight} = useHeightContext()
  const firstRenderRef = useRef(true)

  const [fetchData, result] = useLazyQuery(query, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }

    if (currentHeight !== firstHeight) {
      const variablesToUse = typeof variables === 'function' ? variables(currentHeight, currentTime) : variables
      fetchData({
        variables: variablesToUse,
      })
    }
    // eslint-disable-next-line
  }, [currentHeight, query, variables])

  return result?.data ? resultParser ? resultParser(result.data) : result.data :  initialResult
}
