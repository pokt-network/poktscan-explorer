import TransferAndTxTabs from '@/app/(transactions)/TransferAndTxTabs'
import AppsDelegatedTabs from '@/app/(details)/gateway/[id]/AppsDelegatedTabs'

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{id: string}>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function GatewayDetailPage({params, searchParams}: PageProps) {
  const {id} = await params

  return (
    <TransferAndTxTabs
      searchParams={searchParams}
      params={params}
      entity={'gateway'}
      defaultTab={'apps_delegated'}
      moreTabs={{
        tabs: [
          {
            tab: 'apps_delegated',
            label: 'Apps Delegated'
          }
        ],
        getContent: (tab: string) => {
          if (tab === 'apps_delegated') {
            return <AppsDelegatedTabs gateway={id} searchParams={searchParams} />
          }
        }
      }}
    />
  )
}
