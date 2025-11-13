'use client'

import TransferAndTxTabs from '@/app/(transactions)/TransferAndTxTabs'
import AppsDelegatedTabs from '@/app/(details)/gateway/[id]/AppsDelegatedTabs'
import { useParams } from 'next/navigation'

interface GatewayPageClientProps {
  rpcUrl?: string
}

export default function GatewayPageClient({ rpcUrl }: GatewayPageClientProps) {
  const params = useParams()
  const id = params.id as string

  return (
    <TransferAndTxTabs
      entity={'gateway'}
      defaultTab={'apps_delegated'}
      rpcUrl={rpcUrl}
      moreTabs={{
        tabs: [
          {
            tab: 'apps_delegated',
            label: 'Apps Delegated'
          }
        ],
        getContent: (tab: string) => {
          if (tab === 'apps_delegated') {
            return <AppsDelegatedTabs gateway={id} />
          }
        }
      }}
    />
  )
}
