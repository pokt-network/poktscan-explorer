'use client'

import { graphql } from '@/app/config/gql'
import NewEntitiesFound from '@/app/components/NewEntitiesFound'
import React from 'react'

const supplierSubscription = graphql(`
  subscription suppliers {
    suppliers {
      id
      _entity {
        id
        ownerId
        serviceConfigs {
          nodes {
            serviceId
          }
        }
      }
    }
  }
`)

interface SuppliersSubscriptionProps {
  service?: string
  owners?: Array<string>
}

export default function SuppliersSubscription({service, owners}: SuppliersSubscriptionProps) {
  return (
    <NewEntitiesFound<typeof supplierSubscription>
      subscription={supplierSubscription}
      entity={'suppliers'}
      addOnTrue={(data) => {
        if (!service && !owners) return true

        if (service) return data?.suppliers?._entity?.serviceConfigs?.nodes?.some(service => service?.serviceId === (service || '')) || false

        return owners ? owners.includes(data?.suppliers?._entity?.ownerId || '') : true
      }}
    />
  )
}
