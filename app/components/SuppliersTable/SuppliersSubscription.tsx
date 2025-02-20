'use client'

import { graphql } from '@/app/config/gql'
import NewEntitiesFound from '@/app/components/NewEntitiesFound'
import React from 'react'

const supplierSubscription = graphql(`
  subscription suppliers {
    suppliers {
      id
      _entity
    }
  }
`)

interface SuppliersSubscriptionProps {
  service?: string
}
export default function SuppliersSubscription({service}: SuppliersSubscriptionProps) {
  return (
    <NewEntitiesFound<typeof supplierSubscription>
      subscription={supplierSubscription}
      entity={'suppliers'}
      addOnTrue={(data) => {
        return !service ||  data?.data?.suppliers?._entity?.serviceConfigs?.nodes?.some(service => service.serviceId === service)
      }}
    />
  )
}
