'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useLazyQuery, useSubscription } from '@apollo/client'
import { subscriptionQuery } from '@/app/operations/block'
import { indexerMetadataDocument } from '@/app/operations/metadata'

interface HeightContext {
  currentHeight: number
  networkHeight: number
  updateNetworkHeight: () => void
  firstHeight: number
  blocksPerSession: number
  currentTime: string
}

const HeightContext = createContext<HeightContext>({
  currentHeight: 0,
  networkHeight: 0,
  firstHeight: 0,
  blocksPerSession: 0,
  currentTime: '',
  updateNetworkHeight: () => {}
});

interface HeightContextProviderProps {
  children: React.ReactNode
  firstHeight: number
  networkHeight: number
  firstTime: string
  blocksPerSession: number
}

export default function HeightContextProvider({
  children,
  networkHeight: initialNetworkHeight,
  firstHeight,
  firstTime,
  blocksPerSession
}: HeightContextProviderProps) {
  const [networkHeight, setNetworkHeight] = useState(initialNetworkHeight)
  const [{currentHeight, currentTime}, setState] = useState({
    currentHeight: Number(firstHeight),
    currentTime: firstTime,
  })

  useSubscription(subscriptionQuery, {
    ignoreResults: true,
    onData: (data) => {
      const block = data?.data?.data?.blocks
      if (block && Number(block.id) > currentHeight) {
        setState({
          currentHeight: Number(block.id),
          currentTime: block._entity?.timestamp || currentTime,
        })
      }
    }
  })

  const [fetchIndexerMetadata] = useLazyQuery(indexerMetadataDocument, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    pollInterval: 5 * 1000,
  })

  const updateNetworkHeight = useCallback(() => {
    fetchIndexerMetadata().then((res) => {
      const targetHeight = res?.data?._metadata?.targetHeight

      if (targetHeight) {
        setNetworkHeight(Number(targetHeight))
      }
    })
  }, [fetchIndexerMetadata])


  useEffect(() => {
    const interval = setInterval(updateNetworkHeight, 5 * 1000)

    return () => clearInterval(interval)
  }, [currentHeight, updateNetworkHeight])

  return (
    <HeightContext.Provider
      value={{
        currentHeight,
        currentTime,
        networkHeight,
        firstHeight,
        blocksPerSession,
        updateNetworkHeight,
      }}
    >
      {children}
    </HeightContext.Provider>
  )
}

export function useHeightContext() {
  return useContext(HeightContext)
}
