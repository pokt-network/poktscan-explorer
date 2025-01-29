'use client'

import { graphql } from '@/app/config/gql'
import NewEntitiesFound from '@/app/components/NewEntitiesFound'
import React from 'react'

const appsSubscription = graphql(`
  subscription apps {
    applications {
      id
      _entity {
        applicationServices {
          nodes {
            serviceId
          }
        }
      }
    }
  }
`)

interface AppsSubscriptionProps {
  service?: string
}
export default function AppsSubscription({service}: AppsSubscriptionProps) {
  return (
    <NewEntitiesFound<typeof appsSubscription>
      subscription={appsSubscription}
      entity={'apps'}
      addOnTrue={(data) => {
        return !service ||  data?.data?.applications?._entity?.applicationServices?.nodes?.some(service => service.serviceId === service)
      }}
    />
  )
}
