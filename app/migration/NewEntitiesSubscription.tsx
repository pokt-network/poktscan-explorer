'use client'

import NewEntitiesFound from '@/app/components/NewEntitiesFound'
import React from 'react'
import { isValidMorseAddress, isValidPoktAddress } from '@/app/utils/poktroll'
import { graphql } from '@/app/config/gql'

interface NewEntitiesSubscriptionProps {
  address?: string
}

const morseClaimableAccountsSubscription = graphql(`
  subscription morseClaimableAccounts {
    morseClaimableAccounts {
      id
      _entity {
        id
        shannonDestAddress
      }
    }
  }
`)


export default function NewEntitiesSubscription({address}: NewEntitiesSubscriptionProps) {
  return (
    <NewEntitiesFound<typeof morseClaimableAccountsSubscription>
      entity={'morse claimable accounts'}
      subscription={morseClaimableAccountsSubscription}
      addOnTrue={(data) => {
        if (!address) return true

        if (isValidPoktAddress(address) && data?.morseClaimableAccounts?._entity?.shannonDestAddress === address) return true

        if (isValidMorseAddress(address) && data.morseClaimableAccounts.id === address) return true

        return false
      }}
    />
  )
}
