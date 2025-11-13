'use client'

import TransferAndTxTabs from '@/app/(transactions)/TransferAndTxTabs'
import ServicesTab from '@/app/(details)/supplier/[id]/ServicesTab'
import { useParams } from 'next/navigation'

interface SupplierPageClientProps {
  rpcUrl?: string
}

export default function SupplierPageClient({ rpcUrl }: SupplierPageClientProps) {
  const params = useParams()
  const id = params.id as string

  return (
    <TransferAndTxTabs
      entity={'supplier'}
      supportMigrationTab={true}
      defaultTab={'services'}
      rpcUrl={rpcUrl}
      moreTabs={{
        tabs: [
          {
            tab: 'services',
            label: 'Services'
          }
        ],
        getContent: (tab: string) => {
          if (tab === 'services') {
            return <ServicesTab id={id} />
          }
        }
      }}
    />
  )
}
