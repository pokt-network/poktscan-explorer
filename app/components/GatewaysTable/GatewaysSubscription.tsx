'use client'

import { graphql } from '@/app/config/gql'
import NewEntitiesFound from '@/app/components/NewEntitiesFound'

const gatewaysSubscription = graphql(`
  subscription gateways {
    gateways {
      id
      _entity {
        id
        applicationGateways {
          nodes {
            application {
              id
              applicationServices {
                nodes {
                  serviceId
                }
              }
            }
          }
        }
      }
    }
  }
`)

interface GatewaysSubscriptionProps {
  service?: string
}

export const GatewaysSubscription = ({ service }: GatewaysSubscriptionProps) => {
  return (
    <NewEntitiesFound<typeof gatewaysSubscription>
      subscription={gatewaysSubscription}
      entity={'gateways'}
      addOnTrue={(data) => {
        return !service ||  data?.data?.gateways?._entity?.applicationGateways?.nodes?.some(gateway => gateway?.application?.applicationServices?.nodes?.some(service => service?.serviceId === service)) || false
      }}
    />
  )
}
