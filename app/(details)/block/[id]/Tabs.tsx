import { getPageAndItems } from '@/app/utils/pagination'
import React from 'react'
import TransactionByHeightTable from '@/app/(transactions)/TransactionByHeight'
import Metadata from '@/app/(details)/block/[id]/Metadata'
import RawEntity from '@/app/components/RawEntity/RawEntity'
import Tabs from '@/app/components/Tabs'

const validTabs = ['txs', 'metadata', 'raw']

interface PageProps {
  params: Promise<{id: string, idForUrl?: string}>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function BlockTabs({params, searchParams}: PageProps) {
  const [{ id, idForUrl }, { page, itemsPerPage }, sParams] = await Promise.all([
    params,
    getPageAndItems(searchParams),
    searchParams,
  ])

  const tab = sParams.tab as string || 'metadata'
  const activeTab = validTabs.includes(tab) ? tab : 'metadata'
  const activeFilter = typeof sParams.filter === 'string' ? sParams.filter : undefined

  let element: React.ReactNode

  switch (activeTab) {
    case 'txs':
      element = (
        <TransactionByHeightTable
          height={id as string}
          page={page}
          itemsPerPage={itemsPerPage}
          basePath={`/block/${idForUrl || id}?tab=txs`}
          filter={activeFilter}
        />
      )
      break
    case 'metadata':
      element = (
        <Metadata id={id as string} />
      )
      break
    case 'raw':
      element = (
        <RawEntity
          entity={'block'}
          id={id!.toString()}
        />
      )
      break
  }

  const tabs = [
    {
      label: 'Metadata',
      tab: "metadata"
    },
    {
      label: 'Transactions',
      tab: "txs"
    },
    {
      label: 'Raw Result',
      tab: "raw"
    }
  ]

  return (
    <>
      <Tabs tabs={tabs} basePath={`/block/${idForUrl || id}`} activeTab={activeTab} />
      {element}
    </>
  )
}
