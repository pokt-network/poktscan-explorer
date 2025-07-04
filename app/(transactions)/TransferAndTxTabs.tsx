import { getPageAndItems } from '@/app/utils/pagination'
import TransactionByAddressTable from '@/app/(transactions)/TransactionsByAddress'
import TransferTable from '@/app/(transactions)/TransferTable'
import Tabs from '@/app/components/Tabs'
import React, { Suspense } from 'react'
import RawEntity from '@/app/components/RawEntity/RawEntity'
import { EntityLinkProps } from '@/app/components/EntityLink'
import MorseClaimableAccountTable, { columns } from '@/app/migration/Table'
import LoadingListView from '@/app/components/LoadingListView'

interface PageProps {
  params: Promise<{id: string, idForUrl?: string}>
  searchParams: Promise<Record<string, string | string[] | undefined>>
  entity: EntityLinkProps['entity']
  supportMigrationTab?: boolean
  moreTabs?: {
    tabs: Array<{label: string, tab: string}>
    getContent: (tab: string) => React.ReactNode
  },
  defaultTab?: string
}

export default async function TransferAndTxTabs({params, searchParams, entity, supportMigrationTab = false, moreTabs, defaultTab}: PageProps) {
  const [{ id, idForUrl }, { page, itemsPerPage }, sParams] = await Promise.all([
    params,
    getPageAndItems(searchParams),
    searchParams,
  ])

  const activeTab = sParams.tab || defaultTab || 'txs'
  const activeFilter = typeof sParams?.['filter'] === 'string' ? sParams?.['filter'] : undefined

  let element: React.ReactNode

  switch (activeTab) {
    case 'txs':
      element = (
        <TransactionByAddressTable
          address={id as string}
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
          address={id as string}
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
        />
      )
      break
      case 'migration':
        element = supportMigrationTab ? (
          <Suspense
            key={`migration-table-${page}-${itemsPerPage}-${new Date().toISOString()}`}
            fallback={
              <LoadingListView
                rowsAmount={itemsPerPage}
                columns={columns}
              />
            }
          >
            <MorseClaimableAccountTable
              searchParams={searchParams}
              address={id as string}
              basePath={`/${entity}/${idForUrl || id}?tab=migration`}
            />
          </Suspense>
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
    tabs.unshift(
      ...moreTabs.tabs
    )
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
