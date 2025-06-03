import TransferAndTxTabs from '@/app/(transactions)/TransferAndTxTabs'

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{id: string}>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AppPage({params, searchParams}: PageProps) {
  return (
    <TransferAndTxTabs
      searchParams={searchParams}
      params={params}
      entity={'app'}
      supportMigrationTab={true}
    />
  )
}
