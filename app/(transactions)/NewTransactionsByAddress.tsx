'use client'

import NewEntitiesFound from '@/app/components/NewEntitiesFound'
import React from 'react'
import { transactionsSubscription } from '@/app/(transactions)/TransactionTable'

export default function NewTransactionsByAddress({address}: {address: string}) {
  return (
    <NewEntitiesFound<typeof transactionsSubscription>
      entity={'transactions'}
      subscription={transactionsSubscription}
      addOnTrue={(data) => {
        // todo: uncomment this when fixed
        return data.transactions._entity.signerAddress === address //|| data.transactions._entity.messages.nodes.some((msg) => JSON.stringify(msg?.json).includes(address))
      }}
    />
  )
}
