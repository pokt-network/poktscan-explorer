import { getClient } from '@/app/config/apollo/rsc'
import { indexerMetadataDocument } from '@/app/operations/metadata'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'

const getMetadata = cache(
  unstable_cache(
    async () => {
      return await getClient().query({
        query: indexerMetadataDocument
      }).then((res) => res.data)
    },
    ['metadata'],
    { revalidate: 10}
  )
)


export default getMetadata
