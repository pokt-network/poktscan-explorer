'use client'

import React from 'react'
import TransactionByHeightTable from '@/app/(transactions)/TransactionByHeight'
import Metadata from '@/app/(details)/block/[id]/Metadata'
import RawEntity from '@/app/components/RawEntity/RawEntity'
import Tabs from '@/app/components/Tabs'
import { useParams, useSearchParams } from 'next/navigation'

const validTabs = ['txs', 'metadata', 'raw']

interface BlockTabsProps {
  rpcUrl?: string
}

export default function BlockTabs({rpcUrl}: BlockTabsProps) {
  const params = useParams()
  const searchParams = useSearchParams()

  const id = params.id as string
  const idForUrl = params.idForUrl as string | undefined

  const pageParam = searchParams.get('p')
  const itemsParam = searchParams.get('ps')
  const tabParam = searchParams.get('tab')
  const activeFilter = searchParams.get('filter') || undefined

  const page = pageParam ? parseInt(pageParam, 10) : 1
  const itemsPerPage = itemsParam ? parseInt(itemsParam, 10) : 25
  const tab = tabParam || 'metadata'
  const activeTab = validTabs.includes(tab) ? tab : 'metadata'

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
          rpcUrl={rpcUrl}
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
