'use client'

import { useApolloClient } from '@apollo/client'
import { useEffect, useRef } from 'react'
import { summaryDocument, newEvolutionDocument, servicesDocument } from '@/app/(home)/operations'
import { customizableCompUnitsDocument } from '@/app/(home)/CustomizableCompUnitsChart/operations'
import { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { getSummaryVariables, getEvolutionVariables, getServicesVariables } from '@/app/(home)/utils'
import { customizableCompUnitsVariables } from '@/app/(home)/CustomizableCompUnitsChart/operations'
import { getValidTime, Time } from '@/app/utils/dates'

interface CacheHydrationProps {
  summaryData?: DocumentNodeData<typeof summaryDocument> | null
  evolutionData?: DocumentNodeData<typeof newEvolutionDocument> | null
  servicesData?: DocumentNodeData<typeof servicesDocument> | null
  compUnitsData?: DocumentNodeData<typeof customizableCompUnitsDocument> | null
  cookieTime?: string
}

/**
 * Hydrates Apollo cache with server-fetched data to avoid duplicate network requests
 */
export function CacheHydration({
  summaryData,
  evolutionData,
  servicesData,
  compUnitsData,
  cookieTime
}: CacheHydrationProps) {
  const client = useApolloClient()
  const hydratedRef = useRef(false)

  useEffect(() => {
    // Only hydrate once
    if (hydratedRef.current) return
    hydratedRef.current = true

    const currentTime = new Date().toISOString()

    // Write summary data to cache
    if (summaryData) {
      const variables = getSummaryVariables(currentTime)
      client.writeQuery({
        query: summaryDocument,
        variables,
        data: summaryData,
      })
    }

    // Write evolution data to cache
    if (evolutionData) {
      const variables = getEvolutionVariables(currentTime)
      client.writeQuery({
        query: newEvolutionDocument,
        variables,
        data: evolutionData,
      })
    }

    // Write services data to cache
    if (servicesData) {
      const variables = getServicesVariables(currentTime)
      client.writeQuery({
        query: servicesDocument,
        variables,
        data: servicesData,
      })
    }

    // Write comp units data to cache
    if (compUnitsData) {
      const normalizedTime = getValidTime(cookieTime || '', Time.Last30d)
      const variables = customizableCompUnitsVariables(currentTime, normalizedTime)
      client.writeQuery({
        query: customizableCompUnitsDocument,
        variables,
        data: compUnitsData,
      })
    }
  }, [client, summaryData, evolutionData, servicesData, compUnitsData, cookieTime])

  return null
}
