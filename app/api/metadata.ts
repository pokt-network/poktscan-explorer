import { getClient } from '@/app/config/apollo/rsc'
import { indexerMetadataDocument } from '@/app/operations/metadata'
import { cache } from 'react'

const getMetadata = cache(async () => {
  return await getClient().query({
    query: indexerMetadataDocument
  }).then((res) => res.data)
})


export default getMetadata
