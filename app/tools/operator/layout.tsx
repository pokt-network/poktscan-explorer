import React from 'react'
import SupplierLayout from '@/app/tools/SupplierLayout'
import { addressesCookieKey } from '@/app/tools/operator/constants'

export default function Layout({children}: React.PropsWithChildren) {
  return (
    <SupplierLayout
      isOwner={false}
      title={'Operator Staking'}
      pushOnAddressChange={true}
      description={'Dashboard intended for operators, like node runners.'}
      addressesCookieKey={addressesCookieKey}
    >
      {children}
    </SupplierLayout>
  )
}
