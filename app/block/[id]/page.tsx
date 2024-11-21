import { graphql } from '@/app/config/gql'
import { Block } from '@/app/config/gql/graphql'
import { getClient } from '@/app/config/apollo/rsc'
import EntityDetail from '@/app/components/EntityDetail'
import { formatTimeDifference } from '@/app/(home)/utils'
import { formatBalance } from '@/app/utils/balances'
import millify from 'millify'
import TextWithCopyButton from '@/app/components/TextWithCopyButton'

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
      <div>not found</div>
    )
  }

  return (
    <div className={"px-3 py-10 md:px-10 gap-5 flex flex-col"}>
      <h1 className={'text-2xl font-semibold'}>
        Block <TextWithCopyButton text={'#' + block.height.toString()} />
      </h1>
      <EntityDetail
        items={[
          {
            type: 'row',
            label: 'Timestamp',
            value: new Date(block.timestamp).toISOString()
          },
          {
            type: 'row',
            label: 'Took',
            value: formatTimeDifference(block.timeToBlock!)
          },
          {
            type: 'row',
            label: 'Transactions',
            value: block.totalTxs
          },
          {
            type: 'row',
            label: 'Proposer',
            value: block.proposerAddress
          },
          {
            type: 'row',
            label: 'Size',
            value: millify(block.size, {
              units: ["B", "KB", "MB", "GB", "TB"],
              space: true,
            })
          },
          {
            type: 'divider'
          },
          {
            type: 'row',
            label: 'Total Supply',
            value: formatBalance(block.supplies.nodes.find((item) => item?.supply?.denom === 'upokt')?.supply || {
              amount: '0',
              denom: 'upokt'
            })
          },
          {
            type: 'row',
            label: 'Apps Staked Tokens',
            value: formatBalance({
              amount: block.stakedAppsTokens,
              denom: 'upokt'
            })
          },
          {
            type: 'row',
            label: 'Apps Staked',
            value: block.stakedApps
          },
          {
            type: 'row',
            label: 'Suppliers Staked Tokens',
            value: formatBalance({
              amount: block.stakedSuppliersTokens,
              denom: 'upokt'
            })
          },
          {
            type: 'row',
            label: 'Suppliers Staked',
            value: block.stakedSuppliers
          },
          {
            type: 'row',
            label: 'Gateways Staked Tokens',
            value: formatBalance({
              amount: block.stakedGatewaysTokens,
              denom: 'upokt'
            })
          },
          {
            type: 'row',
            label: 'Gateways Staked',
            value: block.stakedGateways
          },
          {
            type: 'row',
            label: 'Relays',
            value: block.totalRelays
          },
          {
            type: 'row',
            label: 'Computed Units',
            value: block.totalComputedUnits
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
            value: block.metadata?.header?.lastBlockId?.hash
          },
          {
            type: 'row',
            label: 'Last Block Id Parts',
            value: block.metadata?.header?.lastBlockId?.parts?.hash
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
    </div>
  )

}
