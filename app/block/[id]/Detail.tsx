import { getBlock, getRows } from '@/app/block/[id]/utils'
import EntityDetail from '@/app/components/EntityDetail'
import React from 'react'
import TitleEntity from '@/app/components/TitleEntity'
import NotFound from '@/app/not-found'

interface BlockDetailProps {
  id: string
}

export default async function BlockDetail({id}: BlockDetailProps) {
  const block = await getBlock(id)

  if (!block) {
    return <NotFound />
  }

  return (
    <>
      <TitleEntity title={'Block'} text={'#' + block.height.toString()} />
      <EntityDetail
        items={getRows(block)}
      />
    </>
  )
}
