'use client'

import Tabs from '@/app/components/Tabs'
import SuppliersTable from '@/app/components/SuppliersTable/SuppliersTable'
import AppsTable from '@/app/components/AppsTable/AppsTable'
import GatewaysTable from '@/app/components/GatewaysTable/GatewaysTable'
import RawEntity from '@/app/components/RawEntity/RawEntity'
import { useParams, useSearchParams } from 'next/navigation'

const tabs = [
  {
    label: 'Suppliers',
    tab: "suppliers"
  },
  {
    label: 'Apps',
    tab: "apps"
  },
  {
    label: 'Gateways',
    tab: "gateways"
  },
  {
    label: 'Raw Result',
    tab: "raw"
  }
]

interface ServiceTabsProps {
  rpcUrl?: string
}

export default function ServiceTabs({rpcUrl}: ServiceTabsProps) {
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
  let activeTab = tabParam || 'suppliers'

  if (!tabs.some(t => t.tab === activeTab)) {
    activeTab = 'suppliers'
  }

  let table: React.ReactNode

  const basePath = `/service/${idForUrl ||id}?tab=${activeTab}`

  switch (activeTab) {
    case 'apps':
      table = (
        <AppsTable
          service={id as string}
          page={page}
          itemsPerPage={itemsPerPage}
          basePath={basePath}
          activeFilter={activeFilter}
        />
      )
      break
    case 'gateways':
      table = (
        <GatewaysTable
          service={id as string}
          page={page}
          itemsPerPage={itemsPerPage}
          basePath={basePath}
          activeFilter={activeFilter}
        />
      )
      break
    case 'raw':
      table = (
        <RawEntity
          entity={'service'}
          id={id!.toString()}
          rpcUrl={rpcUrl}
        />
      )
      break
    default:
      table = (
        <SuppliersTable
          service={id as string}
          page={page}
          itemsPerPage={itemsPerPage}
          basePath={basePath}
          activeFilter={activeFilter}
        />
      )
      break
  }

  return (
    <>
      <Tabs
        basePath={`/service/${idForUrl ||id}`}
        activeTab={activeTab as string}
        tabs={tabs}
      />
      {table}
    </>
  )
}
