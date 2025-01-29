import { graphql } from '@/app/config/gql'
import {
  isValidEd25519Hash,
  isValidHash,
  isValidPoktAddress,
} from '@/app/utils/poktroll'
import { useSuspenseQuery } from '@apollo/client'
import { EntityLinkProps } from '@/app/components/EntityLink'
import React from 'react'
import { getStakeLabel } from '@/app/utils/stake'
import Link from 'next/link'
import { CircleAlert } from 'lucide-react'
import { formatAmount, truncateBothSides } from '@/app/utils/format'
import DateCellText from '@/app/dates/DateCellText'

const searchByAddressDocument = graphql(`
  query searchByAddress($address: String!) {
    account(id: $address) {
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
    supplier(id: $address) {
      id
      stakeStatus
      stakeAmount
      stakeDenom
    }
    application(id: $address) {
      id
      stakeStatus
      stakeAmount
      stakeDenom
    }
    gateway(id: $address) {
      id
      stakeStatus
      stakeAmount
      stakeDenom
    }
  }
`)

const searchValidatorByAddress = graphql(`
  query searchValidatorByAddress($address: String!) {
    validator(id: $address) {
      id
      stakeAmount
      stakeDenom
      stakeStatus
    }
  }
`)

const searchByHashDocument = graphql(`
  query searchByHash($hash: String!) {
    block(id: $hash) {
      id
      height
      timestamp
      totalTxs
    }
    transaction(id: $hash) {
      id
      code
      messages {
        nodes {
          typeUrl
          json
        }
      }
    }
  }
`)

const searchByHeightDocument = graphql(`
  query searchByHeight($height: BigFloat!) {
    blocks(filter: { height: { equalTo: $height } }, first: 1) {
      nodes {
        id
        height
        timestamp
        totalTxs
      }
    }
  }
`)

interface SearchContentProps {
  value: string;
  close: () => void;
}

export default function SearchContent({value, close}: SearchContentProps) {
  const valueTrimmed = value.trim()
  if (!valueTrimmed) {
    return null
  }

  const rows: Array<{
    entity: EntityLinkProps['entity'];
    entityId: EntityLinkProps['entityId'];
    description: React.ReactNode;
  }> = []
  let error = false

  if (isValidPoktAddress(valueTrimmed)) {
    // eslint-disable-next-line
    const {data, error: errorFromRequest} = useSuspenseQuery(searchByAddressDocument, {
      variables: {
        address: valueTrimmed
      }
    })

    if (errorFromRequest) {
      error = true
    } else {
      if (data.account) {
        rows.push({
          entity: 'account',
          entityId: data.account.id,
          description: formatAmount(data.account.balances.nodes[0]!)
        })
      }

      for (const [entity, value] of Object.entries(data)) {
        if (entity === 'account' || !value) {
          continue
        }

        const {stakeStatus, stakeAmount, stakeDenom, id} = (value as typeof data.supplier)!

        rows.push({
          entity: entity as EntityLinkProps['entity'],
          entityId: id,
          description: <>
            <span
              className={stakeStatus === 0 ? 'text-[color:--success]' : stakeStatus === 1 ? 'text-[color:--warning]' : 'text-[color:-error]'}
            >
              {getStakeLabel(stakeStatus)}
            </span> - {formatAmount({
              amount: stakeAmount,
              denom: stakeDenom
            })}
          </>
        })
      }
    }
  } else if (isValidHash(valueTrimmed)) {
    // eslint-disable-next-line
    const {data, error: errorFromRequest} = useSuspenseQuery(searchByHashDocument, {
      variables: {
        hash: valueTrimmed.toUpperCase()
      }
    })
    if (errorFromRequest) {
      error = true
    } else {
      if (data.block) {
        rows.push({
          entity: 'block',
          entityId: data.block.height,
          description: (
            <>
              <DateCellText value={data.block.timestamp}/> - {data.block.totalTxs} Transactions
            </>
          )
        })
      }

      if (data.transaction) {
        rows.push({
          entity: 'tx',
          entityId: data.transaction.id,
          description: (
            <>
              <span
                className={data.transaction.code === 0 ? 'text-[color:--success]' : 'text-[color:--error]'}>
               {data.transaction.code === 0 ? 'Success' : 'Failed'}
              </span>
              <span className={'inline-block bg-[color:--background] ml-2 mr-[2px] p-2 py-1 rounded-md border-[2px] border border-[color:--divider]'}>
                {data.transaction.messages.nodes.at(0)?.typeUrl?.split('.')?.at(-1)?.replace('Msg', '') || 'Unknown'}
              </span>
              {data.transaction.messages.nodes.length > 1 && (
                <span className={"text-[color:--secondary] text-xs font-semibold"}>
                  +{data.transaction.messages.nodes.length - 1}
                </span>
              )}
            </>

          )
        })
      }
    }
  } else if (!isNaN(Number(valueTrimmed))) {
    // eslint-disable-next-line
    const {data, error: errorFromRequest} = useSuspenseQuery(searchByHeightDocument, {
      variables: {
        height: valueTrimmed
      }
    })

    if (errorFromRequest) {
      error = true
    } else {
      if (data.blocks?.nodes.length) {
        rows.push({
          entity: 'block',
          entityId: data.blocks.nodes[0]!.height,
          description: (
            <>
              <DateCellText value={data.blocks.nodes[0]!.timestamp}/> - {data.blocks.nodes[0]!.totalTxs} Transactions
            </>
          )
        })
      }
    }
  } else if (isValidEd25519Hash(valueTrimmed)) {
    // eslint-disable-next-line
    const {data, error: errorFromRequest} = useSuspenseQuery(searchValidatorByAddress, {
      variables: {
        address: valueTrimmed
      }
    })

    if (errorFromRequest) {
      error = true
    } else {
      const {stakeStatus, stakeAmount, stakeDenom, id} = (data.validator as typeof data.validator)!
      rows.push({
        entity: 'validator',
        entityId: id,
        description: <>
            <span
              className={stakeStatus === 0 ? 'text-[color:--success]' : stakeStatus === 1 ? 'text-[color:--warning]' : 'text-[color:-error]'}
            >
              {getStakeLabel(stakeStatus)}
            </span> - {formatAmount({
          amount: stakeAmount,
          denom: stakeDenom
        })}
        </>
      })
    }
  }

  if (error) {
    // todo: Add error handling
  }

  if (!rows.length) {
    return (
      <div className={'flex flex-col items-center justify-center p-4'}>
        <CircleAlert className={"h-8 w-8 text-[color:--warning]"}/>
        <p className={"text-sm font-semibold mt-2 mb-1"}>
          There are no matching results
        </p>
        <p className={"text-xs text-[color:--secondary]"}>
          Please try another search
        </p>
      </div>
    )
  }

  return (
    <div className={"flex flex-col"}>
      {rows.map((row, index) => (
        <Link
          key={index}
          prefetch={true}
          className={`flex px-2 mx-2 py-3 flex-col gap-2 hover:bg-[color:--highlight-option] ${index !== rows.length - 1 ? 'border-b border-[color:--divider]' : ''}`}
          href={`/${row.entity}/${row.entityId}`}
          onClick={close}
        >
          <p className={'text-[color:--primary] font-bold text-sm'}>
            {row.entity === 'tx' ? 'Transaction' : row.entity.at(0)!.toUpperCase() + row.entity.substring(1)}
          </p>
          <p className={'text-xs ml-2 whitespace-nowrap overflow-hidden overflow-ellipsis'}>
            {row.entity === 'tx' ? truncateBothSides(row.entityId as string, 15) : row.entity === 'block' ? `#${Number(row.entityId).toLocaleString()}` : row.entityId}
          </p>
          <p className={"text-[color:--secondary] text-xs ml-2 font-bold"}>
            {row.description}
          </p>
        </Link>
      ))}
    </div>
  )
}
