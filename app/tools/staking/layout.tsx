import React from 'react'
import SupplierLayout from '@/app/tools/SupplierLayout'

export default function Layout({children}: React.PropsWithChildren) {
  return (
    <SupplierLayout
      isOwner={true}
      pushOnAddressChange={true}
      title={'Owner Staking'}
      description={'Dashboard intended for owners of suppliers, like customer of node runners.'}
    >
      {children}
    </SupplierLayout>
  )
}
