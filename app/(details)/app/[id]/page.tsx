import TransferAndTxTabs from '@/app/(transactions)/TransferAndTxTabs'
import DelegatedToTab from '@/app/(details)/app/[id]/DelegatedToTab'

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{id: string}>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AppPage({params, searchParams}: PageProps) {
  const {id} = await params

  return (
    <TransferAndTxTabs
      searchParams={searchParams}
      params={params}
      entity={'app'}
      defaultTab={'delegated_to'}
      supportMigrationTab={true}
      moreTabs={{
        tabs: [
          {
            tab: 'delegated_to',
            label: 'Delegated To'
          }
        ],
        getContent: (tab: string) => {
          if (tab === 'delegated_to') {
            return <DelegatedToTab app={id} searchParams={searchParams} />
          }
        }
      }}
    />
  )
}
