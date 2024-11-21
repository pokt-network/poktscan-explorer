import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import { formatBalance } from '@/app/utils/balances'
import EntityDetail, { Item } from '@/app/components/EntityDetail'
import EntityLink from '@/app/components/EntityLink'
import TransferTable from '@/app/(transactions)/TransferTable'
import { getPageAndItems } from '@/app/utils/pagination'
import TransactionByAddressTable from '@/app/(transactions)/TransactionsByAddress'
import Tabs from '@/app/components/Tabs'
import TextWithCopyButton from '@/app/components/TextWithCopyButton'

export const dynamic = "force-dynamic";

const accountByIdDocument = graphql(`
  query accountById($id: String!) {
    account(id: $id) {
      id
      balances {
        nodes {
          amount
          denom
          lastUpdatedBlock {
            height
            timestamp
          }
        }
      }
    }
  }
`)

interface PageProps {
  params: Promise<{id: string}>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AccountDetailPage({params, searchParams}: PageProps) {
  const [{ id }, { page, itemsPerPage }, sParams] = await Promise.all([
    params,
    getPageAndItems(searchParams),
    searchParams,
  ])

  const activeTab = sParams.tab as string || 'txs'

  const [{ data }, transfers] = await Promise.all([getClient().query({
    query: accountByIdDocument,
    variables: {
      id
    }
  }),
  activeTab === 'txs' ? (
      <TransactionByAddressTable
        address={id as string}
        page={page}
        itemsPerPage={itemsPerPage}
        basePath={`/account/${id}?tab=txs`}
      />
    ) : (
      <TransferTable
        address={id as string}
        page={page}
        itemsPerPage={itemsPerPage}
        basePath={`/account/${id}?tab=transfers`}
      />
    )
  ])

  if (!data.account) {
    return (
      <div>not found</div>
    )
  }

  const { account } = data

  const upoktBalance = account.balances.nodes.find((item) => item!.denom === 'upokt')!

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Balance',
      value: formatBalance(upoktBalance)
    },
    {
      type: 'divider'
    },
    {
      type: 'row',
      label: 'Updated At',
      value: upoktBalance.lastUpdatedBlock!.timestamp
    },
    {
      type: 'row',
      label: 'Updated At Block',
      value: (
        <div className={"text-sm"}>
          <EntityLink entity={'block'} entityId={upoktBalance.lastUpdatedBlock!.height} copy={{enabled: true}}/>
        </div>
      )
    },
  ]

  return (
    <div className={"px-3 py-10 md:px-10 gap-5 flex flex-col"}>
      <div className={"flex flex-row items-center gap-3"}>
        <h1 className={'text-2xl font-semibold'}>
          Account
        </h1>
        <TextWithCopyButton text={account.id} />
      </div>
      <EntityDetail
        items={rows}
      />
      <Tabs
        basePath={`/account/${id}`}
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
    </div>
  )
}
