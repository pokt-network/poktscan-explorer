import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import EntityDetail, { Item } from '@/app/components/EntityDetail'
import { formatBalance } from '@/app/utils/balances'
import { getStakeLabel } from '@/app/utils/stake'
import EntityLink from '@/app/components/EntityLink'
import { getPageAndItems } from '@/app/utils/pagination'
import TransactionByAddressTable from '@/app/(transactions)/TransactionsByAddress'
import TransferTable from '@/app/(transactions)/TransferTable'
import Tabs from '@/app/components/Tabs'
import TextWithCopyButton from '@/app/components/TextWithCopyButton'

export const dynamic = "force-dynamic";

const gatewayByIdDocument = graphql(`
  query gatewayById($id: String!) {
    gateway(id: $id) {
      id
      account {
        id
        balances {
          nodes {
            amount
            denom
          }
        }
      }
      stakeAmount
      stakeDenom
      stakeStatus
      unstakingBeginBlock {
        height
      }
      unstakingEndBlock {
        height
      }
      applications: applicationGateways {
        nodes {
          application {
            id
            applicationServices {
              nodes {
                service {
                  id
                  name
                }
              }
            }
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

export default async function GatewayDetailPage({params, searchParams}: PageProps) {
  const [{ id }, { page, itemsPerPage }, sParams] = await Promise.all([
    params,
    getPageAndItems(searchParams),
    searchParams,
  ])

  const activeTab = sParams.tab || 'txs'

  const [{ data }, transactions] = await Promise.all([getClient().query({
    query: gatewayByIdDocument,
    variables: {
      id
    }
  }),
    activeTab === 'txs' ? (
      <TransactionByAddressTable
        address={id as string}
        page={page}
        itemsPerPage={itemsPerPage}
        basePath={`/gateway/${id}?tab=txs`}
      />
    ) : (
      <TransferTable
        address={id as string}
        page={page}
        itemsPerPage={itemsPerPage}
        basePath={`/gateway/${id}?tab=transfers`}
      />
    )
  ])


  if (!data.gateway) {
    return (
      <div>not found</div>
    )
  }

  const { gateway } = data

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Balance',
      value: formatBalance(gateway.account.balances.nodes.at(0)!)
    },
    {
      type: 'divider'
    },
    {
      type: 'row',
      label: 'Status',
      value: getStakeLabel(gateway.stakeStatus)
    },
    {
      type: 'row',
      label: 'Stake Amount',
      value: formatBalance({
        amount: gateway.stakeAmount,
        denom: gateway.stakeDenom
      })
    },
    {
      type: 'row',
      label: 'Apps with Services',
      description: 'Applications that allows this gateway to send relays on their behalf',
      value: gateway.applications?.node?.length ? (
        <ul className={'pt-2 pl-1'}>
          {gateway.applications?.nodes.map(({ application }) => (
            <li key={application.id}>
              <p className={"text-sm"}>
                <EntityLink entity={'app'} entityId={application.id}/>
                <ul className={'pt-2 pl-1'}>
                  {application.applicationServices.nodes.map(({ service }) => (
                    <li key={service.id}>
                      <p className={"text-sm"}>
                        - {service.name}{service.id !== service.name && ` (${service.id})`}
                      </p>
                    </li>
                  ))}
                </ul>
              </p>
            </li>
          ))}
        </ul>
      ) : 'None'
    }
  ]

  if (gateway.stakeStatus !== 0) {
    rows.push({
        type: 'divider'
      }, {
        type: 'row',
        label: 'Unstaking Begin At',
        value: gateway.unstakingBeginBlock!.height
      })

    if (gateway.unstakingEndBlock) {
      rows.push({
        type: 'row',
        label: 'Unstaked At Height',
        value: gateway.unstakingEndBlock!.height
      })
    }
  }

  return (
    <div className={"px-3 py-10 md:px-10 gap-5 flex flex-col"}>
      <div className={"flex flex-row items-center gap-3"}>
        <h1 className={'text-2xl font-semibold'}>
          Gateway
        </h1>
        <TextWithCopyButton text={gateway.id} />
      </div>
      <EntityDetail
        items={rows}
      />
      <Tabs
        basePath={`/gateway/${id}`}
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
      {transactions}
    </div>
  )
}
