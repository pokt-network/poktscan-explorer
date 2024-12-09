'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { latestBlockQuery } from '@/app/operations/block'

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
  const [shouldFetch, setShouldFetch] = useState<boolean>(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldFetch(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const {data,} = useQuery(latestBlockQuery, {
    pollInterval: shouldFetch ? 30 * 1000 : undefined,
    fetchPolicy: 'network-only',
    skip: !shouldFetch
  })

  const lastBlock = data?.blocks?.nodes?.at(0)

  return (
    <HeightContext.Provider
      value={{
        currentHeight: lastBlock?.height || firstHeight,
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
