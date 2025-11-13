'use client'

import TransferAndTxTabs from '@/app/(transactions)/TransferAndTxTabs'
import SuppliersTable from '@/app/components/SuppliersTable/SuppliersTable'
import { useParams, useSearchParams } from 'next/navigation'

interface AccountPageClientProps {
  rpcUrl?: string
}

export default function AccountPageClient({ rpcUrl }: AccountPageClientProps) {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string

  const pageParam = searchParams.get('p')
  const itemsParam = searchParams.get('ps')
  const activeFilter = searchParams.get('filter') || undefined

  const page = pageParam ? parseInt(pageParam, 10) : 1
  const itemsPerPage = itemsParam ? parseInt(itemsParam, 10) : 25

  return (
    <TransferAndTxTabs
      entity={'account'}
      supportMigrationTab={true}
      rpcUrl={rpcUrl}
      moreTabs={{
        position: 'beforeRaw',
        tabs: [
          {
            label: 'Suppliers',
            tab: 'suppliers'
          }
        ],
        getContent: (tab) => {
          if (tab === 'suppliers') {
            return (
              <SuppliersTable
                page={page}
                itemsPerPage={itemsPerPage}
                basePath={`/account/${id}?tab=suppliers`}
                owners={[id]}
                activeFilter={activeFilter}
              />
            )
          }
        }
      }}
    />
  )
}
