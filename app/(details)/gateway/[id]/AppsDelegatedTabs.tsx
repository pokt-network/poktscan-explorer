'use client'

import AppsTable from '@/app/components/AppsTable/AppsTable'
import { useSearchParams } from 'next/navigation'

interface AppsDelegatedTabsProps {
  gateway: string
}

export default function AppsDelegatedTabs({gateway}: AppsDelegatedTabsProps) {
  const searchParams = useSearchParams()

  const pageParam = searchParams.get('p')
  const itemsParam = searchParams.get('ps')
  const activeFilter = searchParams.get('filter') || undefined

  const page = pageParam ? parseInt(pageParam, 10) : 1
  const itemsPerPage = itemsParam ? parseInt(itemsParam, 10) : 25

  return (
    <AppsTable
      gateway={gateway}
      page={page}
      itemsPerPage={itemsPerPage}
      basePath={`/gateway/${gateway}?tab=apps_delegated`}
      activeFilter={activeFilter}
    />
  )
}
