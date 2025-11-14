import { getClient } from '@/app/config/apollo/rsc'
import { cache } from 'react'
import { summaryDocument } from '@/app/(home)/operations'
import { getSummaryVariables } from '@/app/(home)/utils'
import { unstable_cache } from 'next/cache'
import { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'

export const getSummaryData = cache(
  unstable_cache(
    async (): Promise<DocumentNodeData<typeof summaryDocument> | null> => {
      try {
        const currentTime = new Date().toISOString()
        const variables = getSummaryVariables(currentTime)

        const {data} = await getClient().query({
          query: summaryDocument,
          variables
        })

        return data
      } catch (error) {
        console.error('Error fetching summary data:', error)
        return null
      }
    },
    ['summary_data'],
    { revalidate: 15 } // Revalidate every 15 seconds to match polling interval
  )
)
