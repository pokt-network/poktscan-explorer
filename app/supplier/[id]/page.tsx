import { getClient } from '@/app/config/apollo/rsc'
import EntityDetail, { Item } from '@/app/components/EntityDetail'
import { graphql } from '@/app/config/gql'
import { formatBalance } from '@/app/utils/balances'
import { getStakeLabel, getStakeType } from '@/app/utils/stake'

const supplierByIdDocument = graphql(`
  query supplierById($id: String!) {
    supplier(id: $id) {
      id
      owner {
        id
        balances {
          nodes {
            amount
            denom
          }
        }
      }
      operator {
        id
        balances {
          nodes {
            amount
            denom
          }
        }
      }
      stake
      status
      unstakedAtBlock {
        height
      }
      unstakingStartBlock {
        height
      }
      unstakingHeight
      supplierServices {
        nodes {
          revShare
          endpoints
          service {
            id
            name
          }
        }
      }
    }
  }
`)

interface PageProps {
  params: Promise<{id: string}>
}

export default async function SupplierPage({params}: PageProps) {
  const {id} = await params

  const {data} = await getClient().query({
    query: supplierByIdDocument,
    variables: {
      id
    }
  })

  if (!data.supplier) {
    return (
      <div>not found</div>
    )
  }

  const {supplier} = data
console.log(JSON.stringify(supplier.supplierServices, null, 2))
  const stakeType = getStakeType(supplier.status, supplier.id, supplier.owner.id)

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Status',
      value: getStakeLabel(supplier.status)
    },
    {
      type: 'row',
      label: 'Stake Type',
      value: stakeType
    },
    {
      type: 'row',
      label: 'Stake Amount',
      value: formatBalance(supplier.stake)
    },
  ]

  if (stakeType === 'Non-Custodian') {
    rows.push({
      type: 'divider'
    }, {
      type: 'row',
      label: 'Operator Address',
      value: supplier.id,
    })
  }

  rows.push({
    type: 'row',
    label: 'Balance',
    value: formatBalance(supplier.operator.balances.nodes.at(0)!)
  })

  if (stakeType === 'Non-Custodian') {
    rows.push({
      type: 'divider'
    }, {
      type: 'row',
      label: 'Owner Address',
      value: supplier.owner!.id,
    },
    {
      type: 'row',
      label: 'Owner Balance',
      value: formatBalance(supplier.owner.balances.nodes.at(0)!)
    })
  }

  if (supplier.status !== 0) {
    rows.push({
      type: 'divider'
    }, {
      type: 'row',
      label: 'Unstaking Begin At',
      value: supplier.unstakingStartBlock!.height
    },
    {
      type: 'row',
      label: 'Unstaking End At',
      value: supplier.unstakingHeight
    })

    if (supplier.unstakedAtBlock) {
      rows.push({
        type: 'row',
        label: 'Unstaked At Height',
        value: supplier.unstakedAtBlock!.height
      })
    }
  }

  return (
    <div className={"p-10 gap-5 flex flex-col"}>
      <div className={"flex flex-row items-center gap-3"}>
        <h1 className={'text-2xl font-semibold'}>
          Supplier
        </h1>
        <p className={'text-lg text-[color:--secondary]'}>
          {supplier.id}
        </p>
      </div>
      <EntityDetail
        items={rows}
      />
      <h2 className={"text-xl font-semibold"}>
        Services
      </h2>
    </div>
  )
}
