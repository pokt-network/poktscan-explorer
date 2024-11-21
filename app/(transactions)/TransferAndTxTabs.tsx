import { getPageAndItems } from '@/app/utils/pagination'
import TransactionByAddressTable from '@/app/(transactions)/TransactionsByAddress'
import TransferTable from '@/app/(transactions)/TransferTable'
import Tabs from '@/app/components/Tabs'

interface PageProps {
  params: Promise<{id: string}>
  searchParams: Promise<Record<string, string | string[] | undefined>>
  entity: string
}

export default async function TransferAndTxTabs({params, searchParams, entity}: PageProps) {
  const [{ id }, { page, itemsPerPage }, sParams] = await Promise.all([
    params,
    getPageAndItems(searchParams),
    searchParams,
  ])

  const activeTab = sParams.tab || 'txs'

  const [transfers] = await Promise.all([
    activeTab === 'txs' ? (
      <TransactionByAddressTable
        address={id as string}
        page={page}
        itemsPerPage={itemsPerPage}
        basePath={`/${entity}/${id}?tab=txs`}
      />
    ) : (
      <TransferTable
        address={id as string}
        page={page}
        itemsPerPage={itemsPerPage}
        basePath={`/${entity}/${id}?tab=transfers`}
      />
    )
  ])

  return (
    <>
      <Tabs
        basePath={`/${entity}/${id}`}
        activeTab={activeTab}
        tabs={[
          {
            label: 'Transactions',
            tab: "txs"
          },
          {
            label: 'Transfers',
            tab: "transfers"
          }
        ]}
      />
      {transfers}
    </>
  )
}
