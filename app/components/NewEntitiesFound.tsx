'use client'

import React, { useState, useTransition } from 'react'
import { useSubscription } from '@apollo/client'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { DeepRequired, DocumentNodeData, ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import { useRouter } from 'next/navigation'

interface NewEntitiesFoundProps<T extends TypedDocumentNode<any, any>> {
  entity: string
  subscription: T
  variables?: ExtractVariables<T>
  addOnTrue?: (data: DeepRequired<DocumentNodeData<T>>) => boolean
}

export default function NewEntitiesFound<T extends TypedDocumentNode<any, any>>({entity, subscription, addOnTrue, variables}: NewEntitiesFoundProps<T>) {
  const router = useRouter()

  const [newEntities, setNewEntities] = useState(0)
  const [, startTransition] = useTransition()

  useSubscription(subscription, {
    variables, onData: ({data}) => {
      if (data.data) {
        if (!addOnTrue || addOnTrue(data.data)) {
          setNewEntities(prevState => prevState + 1)
        }
      }
    }
  })

  return newEntities > 0 ? (
    <p className={'text-xs text-[color:--secondary] mt-1'} key={entity + newEntities}>
      {newEntities.toLocaleString()} new {entity} found,{' '}
      <a
        onClick={(e) => {
          e.preventDefault()
          router.refresh()
          startTransition(() => setNewEntities(0))
        }}
        className={'text-[color:--primary] cursor-pointer hover:underline'}
      >
        click here to refresh
      </a>
    </p>
  ) : null
}
