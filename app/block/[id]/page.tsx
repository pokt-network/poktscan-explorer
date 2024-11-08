import { graphql } from '@/app/config/gql'
import { Block } from '@/app/config/gql/graphql'
import { getClient } from '@/app/config/apollo/rsc'
import EntityDetail from '@/app/components/EntityDetail'

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
        proposerId
        txAmount
        timestamp
      }
    }
  }
`)

const blockByIdDocument = graphql(`
  query blockById($id: String!) {
    block(id: $id) {
      id
      height
      proposerId
      txAmount
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
    <div className={"p-10 gap-5 flex flex-col"}>
      <h1 className={"text-2xl"}>
        Block <span className={"text-[color:--secondary] text-xl"}>#{block.height}</span>
      </h1>
      <EntityDetail
        items={[
          {
            type: 'row',
            label: 'Block Height',
            value: block.height,
            description: 'height of the block',
          },
          {
            type: 'row',
            label: 'Timestamp',
            value: new Date(block.timestamp).toISOString()
          },
          {
            type: 'row',
            label: 'Transactions',
            value: block.txAmount
          },
          {
            type: 'divider'
          },
          {
            type: 'row',
            label: 'Proposer',
            value: block.proposerId
          }
        ]}
      />
    </div>
  )

}
