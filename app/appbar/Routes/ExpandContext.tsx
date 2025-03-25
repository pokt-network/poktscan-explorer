'use client'

import React, { createContext, useContext, useState } from 'react'

interface ExpandContext {
  isExpanded: boolean
  toggle: () => void
  expand: () => void
  collapse: () => void
}

const ExpandContext = createContext<ExpandContext>({
  isExpanded: false,
  toggle: () => {},
  expand: () => {},
  collapse: () => {},
})

export function useExpandContext() {
  const context = useContext(ExpandContext)

  if (!context) {
    throw new Error('You must wrap your component with ExpandContextProvider to use this hook')
  }

  return context
}

export default function ExpandContextProvider({children}: React.PropsWithChildren) {
  const [expanded, setExpanded] = useState(false)

  const toggle = () => setExpanded(prev => !prev)
  const expand = () => setExpanded(true)
  const collapse = () => setExpanded(false)

  return (
    <ExpandContext.Provider
      value={{
        isExpanded: expanded,
        toggle,
        expand,
        collapse,
      }}
    >
      {children}
    </ExpandContext.Provider>
  )
}
