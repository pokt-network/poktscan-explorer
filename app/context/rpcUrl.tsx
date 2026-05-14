'use client'

import React, { createContext, useContext } from 'react'

const RpcUrlContext = createContext<string>('')

interface RpcUrlProviderProps {
  rpcUrl: string
  children: React.ReactNode
}

export function RpcUrlProvider({rpcUrl, children}: RpcUrlProviderProps) {
  return (
    <RpcUrlContext.Provider value={rpcUrl}>
      {children}
    </RpcUrlContext.Provider>
  )
}

export function useRpcUrl(): string {
  return useContext(RpcUrlContext)
}