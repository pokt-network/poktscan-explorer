import React from 'react'
import SupplierLayout from '@/app/tools/SupplierLayout'

export default function Layout({children}: React.PropsWithChildren) {
  return (
    <SupplierLayout
      isOwner={false}
      title={'Operator Staking'}
      pushOnAddressChange={true}
      description={'Dashboard intended for operators, like node runners.'}
    >
      {children}
    </SupplierLayout>
  )
}
