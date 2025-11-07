'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useLazyQuery, useSubscription } from '@apollo/client'
import { subscriptionQuery } from '@/app/operations/block'
import { indexerMetadataDocument } from '@/app/operations/metadata'

interface HeightContext {
  currentHeight: number
  networkHeight: number
  // first height or the latest height with relays
  sessionHeight: number
  updateNetworkHeight: () => void
  firstHeight: number
  currentTime: string
}

const HeightContext = createContext<HeightContext>({
  currentHeight: 0,
  networkHeight: 0,
  firstHeight: 0,
  sessionHeight: 0,
  currentTime: '',
  updateNetworkHeight: () => {}
});

interface HeightContextProviderProps {
  children: React.ReactNode
  firstHeight: number
  networkHeight: number
  firstTime: string
}

export default function HeightContextProvider({
  children,
  networkHeight: initialNetworkHeight,
  firstHeight,
  firstTime,
}: HeightContextProviderProps) {
  const [networkHeight, setNetworkHeight] = useState(initialNetworkHeight)
  const [sessionHeight, setSessionHeight] = useState(Number(firstHeight))
  const [{currentHeight, currentTime}, setState] = useState({
    currentHeight: Number(firstHeight),
    currentTime: firstTime,
  })

  useSubscription(subscriptionQuery, {
    ignoreResults: true,
    onError: (error) => {
      console.error('Block subscription error:', error);
    },
    onData: (data) => {
      const block = data?.data?.data?.blocks
      const newBlockId = Number(block?.id)
      if (block && newBlockId > currentHeight) {
        setState({
          currentHeight: newBlockId,
          currentTime: block._entity?.timestamp || currentTime,
        })

        if (newBlockId > networkHeight) {
          setNetworkHeight(newBlockId)
        }

        if (Number(block?._entity?.totalRelays) > 0) {
          setSessionHeight(newBlockId)
        }
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
        sessionHeight,
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
