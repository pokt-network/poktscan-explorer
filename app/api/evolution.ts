import { getClient } from '@/app/config/apollo/rsc'
import { cache } from 'react'
import { newEvolutionDocument } from '@/app/(home)/operations'
import { getEvolutionVariables } from '@/app/(home)/utils'
import { unstable_cache } from 'next/cache'
import { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'

export const getEvolutionData = cache(
  unstable_cache(
    async (): Promise<DocumentNodeData<typeof newEvolutionDocument> | null> => {
      try {
        const currentTime = new Date().toISOString()
        const variables = getEvolutionVariables(currentTime)

        const {data} = await getClient().query({
          query: newEvolutionDocument,
          variables
        })

        return data
      } catch (error) {
        console.error('Error fetching evolution data:', error)
        return null
      }
    },
    ['evolution_data'],
    { revalidate: 15 }
  )
)
