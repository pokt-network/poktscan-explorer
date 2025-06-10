import React from 'react'
import NotFound from '@/app/not-found'
import { getBlock } from '@/app/block/[id]/utils'
import BlockTabs from '@/app/block/[id]/Tabs'

export const dynamic = "force-dynamic";

export default async function BlockDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const {id} = await params

  const block = await getBlock(id)

  if (!block) {
    return (
      <NotFound />
    )
  }

  return (
    <BlockTabs params={params} searchParams={searchParams} />
  )

}
