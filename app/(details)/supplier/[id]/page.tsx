import TransferAndTxTabs from '@/app/(transactions)/TransferAndTxTabs'
import ServicesTab from '@/app/(details)/supplier/[id]/ServicesTab'

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{id: string}>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SupplierPage({params, searchParams}: PageProps) {
  const {id} = await params

  return (
    <TransferAndTxTabs
      searchParams={searchParams}
      params={params}
      entity={'supplier'}
      supportMigrationTab={true}
      defaultTab={'services'}
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
