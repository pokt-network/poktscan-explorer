'use client'

import { createContext, useContext } from 'react'
import { useSubscription } from '@apollo/client'
import { subscriptionQuery } from '@/app/operations/block'

interface HeightContext {
  currentHeight: number
  firstHeight: number
  currentTime: string
}

const HeightContext = createContext<HeightContext>({
  currentHeight: 0,
  firstHeight: 0,
  currentTime: '',
});

interface HeightContextProviderProps {
  children: React.ReactNode
  firstHeight: number
  firstTime: string
}

export default function HeightContextProvider({children, firstHeight, firstTime}: HeightContextProviderProps) {
  const {data: subscriptionData} = useSubscription(subscriptionQuery)

  const lastBlock = subscriptionData?.blocks?._entity

  return (
    <HeightContext.Provider
      value={{
        currentHeight: lastBlock?.id || firstHeight,
        currentTime: lastBlock ? `${lastBlock.timestamp}Z` : firstTime,
        firstHeight,
      }}
    >
      {children}
    </HeightContext.Provider>
  )
}

export function useHeightContext() {
  return useContext(HeightContext)
}
