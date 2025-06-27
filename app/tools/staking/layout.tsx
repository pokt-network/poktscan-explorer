import React from 'react'
import SupplierLayout from '@/app/tools/SupplierLayout'

export default function Layout({children}: React.PropsWithChildren) {
  return (
    <SupplierLayout
      isOwner={true}
      pushOnAddressChange={true}
      title={'Owner Staking'}
    >
      {children}
    </SupplierLayout>
  )
}
