'use client'

import NewEntitiesFound from '@/app/components/NewEntitiesFound'
import React from 'react'
import { graphql } from '@/app/config/gql'

const transferSubscription = graphql(`
  subscription transfers {
    nativeTransfers {
      _entity {
        id
      }
    }
  }
`)

interface NewTransferByAddressProps {
  address: string
}

export default function NewTransferByAddress({address}: NewTransferByAddressProps) {
  return (
    // @ts-expect-error tbd
    <NewEntitiesFound<typeof transferSubscription>
      subscription={transferSubscription}
      entity={'transfers'}
      addOnTrue={(data) => {
        return data.nativeTransfers._entity.recipientId === address || data.nativeTransfers._entity.senderId === address
      }}
    />
  )
}
