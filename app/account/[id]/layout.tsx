import { graphql } from '@/app/config/gql'
import { ReactNode } from 'react'
import { getClient } from '@/app/config/apollo/rsc'
import EntityDetail, { Item } from '@/app/components/EntityDetail'
import EntityLink from '@/app/components/EntityLink'
import { formatAmount } from '@/app/utils/format'
import TitleEntity from '@/app/components/TitleEntity'

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

export default async function AccountLayout({children, params}: {
  children: ReactNode
  params: Promise<{id: string}>
}) {
  const {id} = await params

  const {data} = await getClient().query({
    query: accountByIdDocument,
    variables: {
      id
    }
  })

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
      value: formatAmount(upoktBalance)
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
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <TitleEntity title={'Account'} text={account.id} />
      <EntityDetail
        items={rows}
      />
      {children}
    </div>
  )
}
