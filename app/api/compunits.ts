import { getClient } from '@/app/config/apollo/rsc'
import { cache } from 'react'
import { customizableCompUnitsDocument, customizableCompUnitsVariables } from '@/app/(home)/CustomizableCompUnitsChart/operations'
import { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { getValidTime, Time } from '@/app/utils/dates'

export const getCompUnitsData = cache(
  async (cookieTime?: string): Promise<DocumentNodeData<typeof customizableCompUnitsDocument> | null> => {
    // Cannot use unstable_cache here because the time parameter can vary per request
    try {
      const currentTime = new Date().toISOString()
      const time = getValidTime(cookieTime || '', Time.Last30d)
      const variables = customizableCompUnitsVariables(currentTime, time)

      const {data} = await getClient().query({
        query: customizableCompUnitsDocument,
        variables
      })

      return data
    } catch (error) {
      console.error('Error fetching comp units data:', error)
      return null
    }
  }
)
