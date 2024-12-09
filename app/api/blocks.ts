import { getClient } from '@/app/config/apollo/rsc'
import { cache } from 'react'
import { Block } from '@/app/config/gql/graphql'
import { latestBlockQuery } from '@/app/operations/block'

export const getLatestBlock = cache(async (): Promise<Block> => {
  const {data} = await getClient().query({
    query: latestBlockQuery
  })

  return data.blocks.nodes.at(0)
})
