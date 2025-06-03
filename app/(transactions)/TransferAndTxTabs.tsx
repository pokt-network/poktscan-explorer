import { getPageAndItems } from '@/app/utils/pagination'
import TransactionByAddressTable from '@/app/(transactions)/TransactionsByAddress'
import TransferTable from '@/app/(transactions)/TransferTable'
import Tabs from '@/app/components/Tabs'
import React from 'react'
import RawEntity from '@/app/components/RawEntity/RawEntity'
import { EntityLinkProps } from '@/app/components/EntityLink'
import MorseClaimableAccountTable from '@/app/migration/Table'

interface PageProps {
  params: Promise<{id: string, idForUrl?: string}>
  searchParams: Promise<Record<string, string | string[] | undefined>>
  entity: EntityLinkProps['entity']
  supportMigrationTab?: boolean
}

export default async function TransferAndTxTabs({params, searchParams, entity, supportMigrationTab = false}: PageProps) {
  const [{ id, idForUrl }, { page, itemsPerPage }, sParams] = await Promise.all([
    params,
    getPageAndItems(searchParams),
    searchParams,
  ])

  const activeTab = sParams.tab || 'txs'

  let element: React.ReactNode

  switch (activeTab) {
    case 'txs':
      element = (
        <TransactionByAddressTable
          address={id as string}
          page={page}
          itemsPerPage={itemsPerPage}
          basePath={`/${entity}/${idForUrl || id}?tab=txs`}
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
          <MorseClaimableAccountTable
            searchParams={searchParams}
            address={id as string}
            basePath={`/${entity}/${idForUrl || id}?tab=migration`}
          />
        ) : null
      break
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
    }
  ]

  if (supportMigrationTab) {
    tabs.splice(2, 0,{
      label: 'Migration',
      tab: "migration"
    })
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
