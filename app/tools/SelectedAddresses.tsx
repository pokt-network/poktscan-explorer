'use client'
import React, { useState } from 'react'

interface SelectedAddressesContext {
  addresses: Array<string>
  setAddresses: (addresses: Array<string>) => void
}

const SelectedAddressesContext = React.createContext<SelectedAddressesContext>({
  addresses: [],
  setAddresses: () => {}
})

interface SelectedAddressesProviderProps {
  addresses: Array<string>
  children: React.ReactNode
}

function SelectedAddressesProvider({addresses: addressesFromProps, children}: SelectedAddressesProviderProps) {
  const [addresses, setAddresses] = useState(addressesFromProps)

  return (
    <SelectedAddressesContext.Provider value={{addresses, setAddresses}}>
      {children}
    </SelectedAddressesContext.Provider>
  )
}

function useSelectedAddresses() {
  const context = React.useContext(SelectedAddressesContext)

  if (!context) {
    throw new Error('useSelectedAddresses must be used within a SelectedAddressesProvider')
  }

  return context
}

export {
  SelectedAddressesProvider,
  useSelectedAddresses
}
