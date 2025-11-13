'use client'

import TransactionByAddressTable from '@/app/(transactions)/TransactionsByAddress'
import TransferTable from '@/app/(transactions)/TransferTable'
import Tabs from '@/app/components/Tabs'
import React from 'react'
import RawEntity from '@/app/components/RawEntity/RawEntity'
import { EntityLinkProps } from '@/app/components/EntityLink'
import MorseClaimableAccountTable from '@/app/migration/Table'
import { useParams, useSearchParams } from 'next/navigation'

interface PageProps {
  entity: EntityLinkProps['entity']
  supportMigrationTab?: boolean
  moreTabs?: {
    position?: 'start' | 'end' | 'beforeRaw'
    tabs: Array<{label: string, tab: string}>
    getContent: (tab: string) => React.ReactNode
  },
  defaultTab?: string
  addressOverride?: string
  rpcUrl?: string
}

export default function TransferAndTxTabs({entity, supportMigrationTab = false, moreTabs, defaultTab, addressOverride, rpcUrl}: PageProps) {
  const params = useParams()
  const searchParams = useSearchParams()

  const id = params.id as string
  const idForUrl = params.idForUrl as string | undefined
  const address = addressOverride || id

  const pageParam = searchParams.get('p')
  const itemsParam = searchParams.get('ps')
  const activeTab = searchParams.get('tab') || defaultTab || 'txs'
  const activeFilter = searchParams.get('filter') || undefined

  const page = pageParam ? parseInt(pageParam, 10) : 1
  const itemsPerPage = itemsParam ? parseInt(itemsParam, 10) : 25

  let element: React.ReactNode

  switch (activeTab) {
    case 'txs':
      element = (
        <TransactionByAddressTable
          address={address as string}
          page={page}
          itemsPerPage={itemsPerPage}
          basePath={`/${entity}/${idForUrl || id}?tab=txs`}
          filter={activeFilter}
        />
      )
      break
    case 'transfers':
      element = (
        <TransferTable
          address={address as string}
          page={page}
          itemsPerPage={itemsPerPage}
          basePath={`/${entity}/${idForUrl || id}?tab=transfers`}
        />
      )
      break
    case 'raw':
      element = (
        <RawEntity
          entity={entity}
          id={id!.toString()}
          rpcUrl={rpcUrl}
        />
      )
      break
    case 'migration':
      element = supportMigrationTab ? (
        <MorseClaimableAccountTable
          basePath={`/${entity}/${idForUrl || id}?tab=migration`}
          address={address as string}
        />
      ) : null
      break
    default: {
      if (moreTabs) {
        const tab = moreTabs.tabs.find(t => t.tab === activeTab)

        if (tab) {
          element = moreTabs.getContent(tab.tab)
        }
      }
    }
  }

  const tabs = [
    {
      label: 'Transactions',
      tab: "txs"
    },
    {
      label: 'Transfers',
      tab: "transfers"
    },
    {
      label: 'Raw Result',
      tab: "raw"
    },
  ]

  if (supportMigrationTab) {
    tabs.splice(2, 0,{
      label: 'Migration',
      tab: "migration"
    })
  }

  if (moreTabs) {
    if (moreTabs.position === 'start' || !moreTabs.position) {
      tabs.unshift(
        ...moreTabs.tabs
      )
    } else if (moreTabs.position === 'end') {
      tabs.push(
        ...moreTabs.tabs
      )
    } else {
      const rawTab = tabs.pop()

      tabs.push(
        ...moreTabs.tabs,
        rawTab!
      )
    }
  }

  return (
    <>
      <Tabs
        basePath={`/${entity}/${idForUrl ||id}`}
        activeTab={activeTab as string}
        tabs={tabs}
      />
      {element}
    </>
  )
}
