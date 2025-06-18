import React from 'react'
import TransactionTabs from '@/app/(details)/tx/[id]/Tabs'

export const dynamic = "force-dynamic";

export default async function TransactionDetailPage({params, searchParams}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ id }, awaitedSearchParams] = await Promise.all([
    params,
    searchParams
  ])

  const tab = awaitedSearchParams['tab']?.toString() || 'messages'

  return (
    <TransactionTabs hash={id} tab={tab} />
  )
}
