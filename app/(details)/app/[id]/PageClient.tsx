'use client'

import TransferAndTxTabs from '@/app/(transactions)/TransferAndTxTabs'
import DelegatedToTab from '@/app/(details)/app/[id]/DelegatedToTab'
import { useParams } from 'next/navigation'

interface AppPageClientProps {
  rpcUrl?: string
}

export default function AppPageClient({ rpcUrl }: AppPageClientProps) {
  const params = useParams()
  const id = params.id as string

  return (
    <TransferAndTxTabs
      entity={'app'}
      defaultTab={'delegated_to'}
      supportMigrationTab={true}
      rpcUrl={rpcUrl}
      moreTabs={{
        tabs: [
          {
            tab: 'delegated_to',
            label: 'Delegated To'
          }
        ],
        getContent: (tab: string) => {
          if (tab === 'delegated_to') {
            return <DelegatedToTab app={id} />
          }
        }
      }}
    />
  )
}
