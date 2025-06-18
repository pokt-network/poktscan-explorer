import React from 'react'
import BlockTabs from '@/app/(details)/block/[id]/Tabs'

export const dynamic = "force-dynamic";

export default async function BlockDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <BlockTabs params={params} searchParams={searchParams} />
  )
}
