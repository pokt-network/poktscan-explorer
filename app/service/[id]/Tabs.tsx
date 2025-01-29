import { getPageAndItems } from '@/app/utils/pagination'
import Tabs from '@/app/components/Tabs'
import SuppliersTable from '@/app/components/SuppliersTable/SuppliersTable'
import AppsTable from '@/app/components/AppsTable/AppsTable'
import GatewaysTable from '@/app/components/GatewaysTable/GatewaysTable'
import RawEntity from '@/app/components/RawEntity/RawEntity'

interface PageProps {
  params: Promise<{id: string, idForUrl?: string}>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

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

export default async function ServiceTabs({params, searchParams}: PageProps) {
  const [{ id, idForUrl }, { page, itemsPerPage }, sParams] = await Promise.all([
    params,
    getPageAndItems(searchParams),
    searchParams,
  ])

  let activeTab = sParams.tab || 'suppliers'

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
        />
      )
      break
    case 'raw':
      table = (
        <RawEntity
          entity={'service'}
          id={id!.toString()}
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
