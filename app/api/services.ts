import { getClient } from '@/app/config/apollo/rsc'
import { cache } from 'react'
import { servicesDocument } from '@/app/(home)/operations'
import { getServicesVariables } from '@/app/(home)/utils'
import { unstable_cache } from 'next/cache'
import { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'

export const getServicesData = cache(
  unstable_cache(
    async (): Promise<DocumentNodeData<typeof servicesDocument> | null> => {
      try {
        const currentTime = new Date().toISOString()
        const variables = getServicesVariables(currentTime)

        const {data} = await getClient().query({
          query: servicesDocument,
          variables
        })

        return data
      } catch (error) {
        console.error('Error fetching services data:', error)
        return null
      }
    },
    ['services_data'],
    { revalidate: 15 }
  )
)
