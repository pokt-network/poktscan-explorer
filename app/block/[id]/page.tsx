import { graphql } from '@/app/config/gql'
import { Block } from '@/app/config/gql/graphql'
import { getClient } from '@/app/config/apollo/rsc'
import EntityDetail from '@/app/components/EntityDetail'
import { formatTimeDifference } from '@/app/(home)/utils'
import { formatAmount, formatSimpleAmount, formatSize } from '@/app/utils/format'
import TitleEntity from '@/app/components/TitleEntity'
import React from 'react'
import DateColumn from '@/app/dates/DateColumn'
import DateCellText from '@/app/dates/DateCellText'
import NotFound from '@/app/not-found'
import RawEntity from '@/app/components/RawEntity/RawEntity'

export const dynamic = "force-dynamic";

const blockByHeightDocument = graphql(`
  query blockByHeight($height: BigFloat!) {
    blocks(filter: {
      height: {
        equalTo: $height
      }
    }) {
      nodes {
        id
        height
        timestamp
        totalTxs
        timeToBlock
        successfulTxs
        stakedApps
        stakedSuppliers
        stakedGateways
        totalRelays
        totalComputedUnits
        proposerAddress
        stakedAppsTokens
        stakedSuppliersTokens
        stakedGatewaysTokens
        size
        supplies {
          nodes {
            supply {
              denom
              amount
            }
          }
        }
        metadata {
          header
          lastCommit
          blockId
        }
      }
    }
  }
`)

const blockByIdDocument = graphql(`
  query blockById($id: String!) {
    block(id: $id) {
      id
      height
      proposerAddress
      totalTxs
      timestamp
    }
  }
`)

export default async function BlockDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const {id} = await params

  let block: Block | null = null

  if (isNaN(Number(id))) {
    const {data} = await getClient().query({
      query: blockByIdDocument,
      variables: {id: id.toUpperCase()}
    })


    if (data.block) {
      block = data.block as unknown as Block
    }
  } else {
    const {data} = await getClient().query({
      query: blockByHeightDocument,
      variables: {height: id}
    })

    block = data.blocks?.nodes?.at(0) as unknown as Block
  }

  if (!block) {
    return (
      <NotFound />
    )
  }

  return (
    <div className={'px-3 py-5 md:px-4 gap-4 flex flex-col'}>
      <TitleEntity title={'Block'} text={'#' + block.height.toString()} />
      <EntityDetail
        items={[
          {
            type: 'row',
            label: <DateColumn />,
            value: (
              <div className={"text-sm"}>
                <DateCellText value={block.timestamp} />
              </div>
            )
          },
          {
            type: 'row',
            label: 'Took',
            value: formatTimeDifference(block.timeToBlock!)
          },
          {
            type: 'row',
            label: 'Transactions',
            value: formatSimpleAmount(block.totalTxs)
          },
          {
            type: 'row',
            label: 'Proposer',
            value: formatSimpleAmount(block.proposerAddress)
          },
          {
            type: 'row',
            label: 'Size',
            value: formatSize(block.size)
          },
          {
            type: 'divider'
          },
          {
            type: 'row',
            label: 'Total Supply',
            value: formatAmount(block.supplies.nodes.find((item) => item?.supply?.denom === 'upokt')?.supply || {
              amount: '0',
              denom: 'upokt'
            })
          },
          {
            type: 'row',
            label: 'Apps Staked Tokens',
            value: formatAmount({
              amount: block.stakedAppsTokens,
              denom: 'upokt'
            })
          },
          {
            type: 'row',
            label: 'Apps Staked',
            value: formatSimpleAmount(block.stakedApps)
          },
          {
            type: 'row',
            label: 'Suppliers Staked Tokens',
            value: formatAmount({
              amount: block.stakedSuppliersTokens,
              denom: 'upokt'
            })
          },
          {
            type: 'row',
            label: 'Suppliers Staked',
            value: formatSimpleAmount(block.stakedSuppliers)
          },
          {
            type: 'row',
            label: 'Gateways Staked Tokens',
            value: formatAmount({
              amount: block.stakedGatewaysTokens,
              denom: 'upokt'
            })
          },
          {
            type: 'row',
            label: 'Gateways Staked',
            value: formatSimpleAmount(block.stakedGateways)
          },
          {
            type: 'row',
            label: 'Relays',
            value: formatSimpleAmount(block.totalRelays)
          },
          {
            type: 'row',
            label: 'Computed Units',
            value: formatSimpleAmount(block.totalComputedUnits)
          },
        ]}
      />
      <h2 className={"text-xl font-semibold"}>
        Header
      </h2>
      <EntityDetail
        items={[
          {
            type: 'row',
            label: 'Version Block / App',
            value: `${block.metadata?.header?.version?.block} / ${block.metadata?.header?.version?.app}`
          },
          {
            type: 'row',
            label: 'Chain Id',
            value: block.metadata?.header?.chainId
          },
          {
            type: 'row',
            label: 'Last Block Id Hash',
            value: block.metadata?.header?.lastBlockId?.hash || '-'
          },
          {
            type: 'row',
            label: 'Last Block Id Parts',
            value: block.metadata?.header?.lastBlockId?.parts?.hash || '-'
          },
          {
            type: 'row',
            label: 'Last Commit Hash',
            value: block.metadata?.header?.lastCommitHash
          },
          {
            type: 'row',
            label: 'Data Hash',
            value: block.metadata?.header?.dataHash
          },
          {
            type: 'row',
            label: 'Validators Hash',
            value: block.metadata?.header?.validatorsHash
          },
          {
            type: 'row',
            label: 'Next Validators Hash',
            value: block.metadata?.header?.nextValidatorsHash
          },
          {
            type: 'row',
            label: 'App Hash',
            value: block.metadata?.header?.appHash
          },
          {
            type: 'row',
            label: 'Last Results Hash',
            value: block.metadata?.header?.lastResultsHash
          },
          {
            type: 'row',
            label: 'Evidence Hash',
            value: block.metadata?.header?.evidenceHash
          },
        ]}
      />
      {block?.height !== "1" && (
        <>
          <h2 className={"text-xl font-semibold"}>
            Last Commit
          </h2>
          <EntityDetail
            items={[
              {
                type: 'row',
                label: 'Round',
                value: block.metadata?.lastCommit?.round
              },
              {
                type: 'row',
                label: 'Height',
                value: block.metadata?.lastCommit?.height
              },
              {
                type: 'row',
                label: 'Block Id Hash',
                value: block.metadata?.lastCommit?.blockId?.hash
              },
              {
                type: 'row',
                label: 'Block Id Parts / Total',
                value: `${block.metadata?.lastCommit?.blockId?.parts?.hash} / ${block.metadata?.lastCommit?.blockId?.parts?.total}`
              },
            ]}
          />
          <h3 className={"text-lg font-semibold"}>
            Signatures
          </h3>
          {block.metadata?.lastCommit?.signatures.map((signature, index) => (
            <EntityDetail
              key={signature.signature}
              items={
                [
                  {
                    type: 'row',
                    label: `Signature #${index + 1}`,
                    value: signature.signature
                  },
                  {
                    type: 'row',
                    label: 'Timestamp',
                    value: signature.timestamp
                  },
                  {
                    type: 'row',
                    label: 'Validator Address',
                    value: signature.validatorAddress
                  },
                  {
                    type: 'row',
                    label: 'Block Id Flag',
                    value: signature.blockIdFlag
                  },
                ]
              }
            />)
          )}
          <h2 className={'text-xl font-semibold'}>
            Raw Result
          </h2>
          <div
            className={'bg-[color:--main-background] p-4 rounded-lg border border-[color:--divider] flex flex-col gap-4 base-shadow'}
          >
            <RawEntity
              entity={'block'}
              id={id}
              loadOnClick={true}
            />
          </div>
        </>
      )
      }
    </div>
  )

}
