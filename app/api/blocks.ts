import { getClient } from '@/app/config/apollo/rsc'
import { cache } from 'react'
import { Block } from '@/app/config/gql/graphql'
import { latestBlockQuery, numBlocksPerSessionDocument } from '@/app/operations/block'
import { unstable_cache } from 'next/cache'

export const getLatestBlock = cache(
  unstable_cache(
    async (): Promise<Block> => {
      const {data} = await getClient().query({
        query: latestBlockQuery
      })

      return data.blocks.nodes.at(0)
    },
    ['latest_block'],
    { revalidate: 30}
  )
)

export const getNumBlocksPerSession = cache(
  unstable_cache(
    async (): Promise<number> => {
      const {data} = await getClient().query({
        query: numBlocksPerSessionDocument
      })

      return Number(data?.params?.nodes?.at(0)?.value || 0)
    },
    ['blocks_per_session'],
    { revalidate: 60}
  )
)
