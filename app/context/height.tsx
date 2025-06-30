'use client'

import { createContext, useContext, useState } from 'react'
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
  const [{currentHeight, currentTime}, setState] = useState({
    currentHeight: Number(firstHeight),
    currentTime: firstTime,
  })

  useSubscription(subscriptionQuery, {
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

  return (
    <HeightContext.Provider
      value={{
        currentHeight,
        currentTime,
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
