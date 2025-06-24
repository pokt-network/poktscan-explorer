import { graphql } from '@/app/config/gql'
import {
  isValidHash,
  isValidPoktAddress, VALIDATOR_PREFIX,
} from '@/app/utils/poktroll'
import { useSuspenseQuery } from '@apollo/client'
import { EntityLinkProps } from '@/app/components/EntityLink'
import React, { useEffect, useState } from 'react'
import { getStakeLabel } from '@/app/utils/stake'
import Link from 'next/link'
import { CircleAlert, Loader2 } from 'lucide-react'
import { formatAmount, formatSimpleAmount, formatUpokt, truncateBothSides } from '@/app/utils/format'
import DateCellText from '@/app/dates/DateCellText'
import { getFromRpc as getAccountFromRpc } from '@/app/(details)/account/[id]/getAccount'
import { getSupplierFromRpc } from '@/app/(details)/supplier/[id]/getSupplier'
import { getAppDetailFromRcp } from '@/app/(details)/app/[id]/getApp'
import { getGatewayFromRpc } from '@/app/(details)/gateway/[id]/getGateway'
import { clsx } from 'clsx'
import { getTxFromRpc } from '@/app/(details)/tx/[id]/getTx'
import { getBlockFromRpc } from '@/app/(details)/block/[id]/getBlock'
import { getValidatorFromRpc } from '@/app/(details)/validator/[id]/getValidator'
import { getServiceFromRpc } from '@/app/(details)/service/[id]/getService'
import { Button } from '@/components/ui/button'
import { indexerMetadataDocument } from '@/app/operations/metadata'
import { getUseRpcData } from '@/app/utils/metadata'

const searchByAddressDocument = graphql(`
  query searchByAddress($address: String!) {
    account(id: $address) {
      id
      balances {
        nodes {
          amount
          denom
          lastUpdatedBlock {
            height: id
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
    blocks(filter: {hash: {equalTo: $hash}}, first: 1) {
      nodes {
        hash
        height: id
        timestamp
        totalTxs
      }
    }
    transaction(id: $hash) {
      id
      code
      amountOfMessages
    }
  }
`)

const searchByHeightDocument = graphql(`
  query searchByHeight($height: BigFloat!) {
    block(id: $height) {
      height: id
      hash
      timestamp
      totalTxs
    }
  }
`)

const searchServicesDocument = graphql(`
  query searchServices($text: String!) {
    services(
      filter: {
        or: [
          {
            id: {
              includesInsensitive: $text
            }
          },
          {
            name: {
              includesInsensitive: $text
            }
          }
        ]
      }
    ){
      nodes {
        id
        name
      }
    }
  }
`)

function EmptySearch() {
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

function RpcSearch({value, close, rpcUrl}: SearchContentProps) {
  const valueTrimmed = value.trim().toLowerCase()

  const [{loading, error, rows}, setState] = useState<{
    loading: boolean,
    rows: Array<{
      entity: EntityLinkProps['entity'];
      entityId: EntityLinkProps['entityId'];
      description: React.ReactNode;
    }>
    error: boolean,
  }>({
    loading: true,
    rows: [],
    error: false,
  })

  async function getRows() {
    if (!valueTrimmed)  {
      setState({
        loading: false,
        rows: [],
        error: false,
      })
      return
    }
    setState({
      loading: true,
      rows: [],
      error: false,
    })
    if (isValidPoktAddress(valueTrimmed) && !valueTrimmed.startsWith(VALIDATOR_PREFIX)) {
      Promise.all([
        getAccountFromRpc(valueTrimmed, rpcUrl),
        getSupplierFromRpc(valueTrimmed, rpcUrl),
        getAppDetailFromRcp(valueTrimmed, rpcUrl),
        getGatewayFromRpc(valueTrimmed, rpcUrl)
      ]).then(([account, supplier, app, gateway]) => {
        const rows: Array<{
          entity: EntityLinkProps['entity'];
          entityId: EntityLinkProps['entityId'];
          description: React.ReactNode;
        }> = []

        if (account) {
          rows.push({
            entity: 'account',
            entityId: valueTrimmed,
            description: formatUpokt({
              amount: account.amount
            })
          })
        }

        for (const { entity, type } of [
          { type: 'supplier' ,entity: supplier },
          {type: 'app', entity: app },
          {type: 'gateway', entity: gateway },
        ]) {
          if (!entity) {
            continue
          }

          rows.push({
            entity: type as EntityLinkProps['entity'],
            entityId: valueTrimmed,
            description: (<>
              <span
                className={
                  clsx(
                    entity.status === "Staked" && 'text-[color:--success]',
                    ['Unstaking','Unstaking/Unstaked',].includes(entity.status) && 'text-[color:--warning]',
                    entity.status === "Unstaked" && 'text-[color:-error]'
                  )
                }
              >
                {entity.status}
              </span> - {'stakeAmount' in entity ? entity.stakeAmount : formatUpokt({
              amount: entity.stake
            })}
            </>)
          })
        }

        setState({
          loading: false,
          rows,
          error: false
        })
      }).catch((e) => {
        console.error(e)
        setState({
          loading: false,
          rows: [],
          error: true
        })
      })
    } else if (isValidHash(valueTrimmed)) {
      getTxFromRpc(valueTrimmed, rpcUrl).then((tx) => {
        const rows: Array<{
          entity: EntityLinkProps['entity'];
          entityId: EntityLinkProps['entityId'];
          description: React.ReactNode;
        }> = []

        if (tx) {
          rows.push({
            entity: 'tx',
            entityId: valueTrimmed.toUpperCase(),
            description: (
              <>
              <span
                className={tx.code === 0 ? 'text-[color:--success]' : 'text-[color:--error]'}>
               {tx.code === 0 ? 'Success' : 'Failed'}
              </span>
                <span className={'inline-block bg-[color:--background] ml-2 mr-[2px] p-2 py-1 rounded-md border-[2px] border-[color:--divider]'}>
                {tx.messages.at(0)?.['@type']?.split('.')?.at(-1)?.replace('Msg', '') || 'Unknown'}
              </span>
                {tx.messages.length > 1 && (
                  <span className={"text-[color:--secondary] text-xs font-semibold"}>
                  +{formatSimpleAmount(tx.messages.length - 1)}
                </span>
                )}
              </>
            )
          })
        }

        setState({
          loading: false,
          rows,
          error: false
        })
      }).catch(() => {
        setState({
          loading: false,
          rows: [],
          error: true
        })
      })
    } else if (!isNaN(Number(valueTrimmed))) {
      getBlockFromRpc(valueTrimmed, rpcUrl).then((block) => {
        const rows: Array<{
          entity: EntityLinkProps['entity'];
          entityId: EntityLinkProps['entityId'];
          description: React.ReactNode;
        }> = []

        if (block) {
          rows.push({
            entity: 'block',
            entityId: block.height,
            description: (
              <>
                <DateCellText value={block.timestamp}/> - {block.transactions} Transactions
              </>
            )
          })
        }

        setState({
          loading: false,
          rows,
          error: false
        })
      }).catch(() => {
        setState({
          loading: false,
          rows: [],
          error: true
        })
      })
    } else if (isValidPoktAddress(valueTrimmed) && valueTrimmed.startsWith(VALIDATOR_PREFIX)) {
      getValidatorFromRpc(valueTrimmed, rpcUrl).then((validator) => {
        const rows: Array<{
          entity: EntityLinkProps['entity'];
          entityId: EntityLinkProps['entityId'];
          description: React.ReactNode;
        }> = []

        if (validator) {
          rows.push({
            entity: 'validator',
            entityId: valueTrimmed,
            description: (<>
              <span
                className={
                  clsx(
                    validator.status === "Staked" && 'text-[color:--success]',
                    ['Unstaking','Unstaking/Unstaked',].includes(validator.status) && 'text-[color:--warning]',
                    validator.status === "Unstaked" && 'text-[color:-error]'
                  )
                }
              >
                {validator.status}
              </span> - {formatUpokt({
              amount: validator.stakeAmount,
            })}
            </>)
          })
        }

        setState({
          loading: false,
          rows,
          error: false
        })
      }).catch(() => {
        setState({
          loading: false,
          rows: [],
          error: true
        })
      })
    } else {
      getServiceFromRpc(valueTrimmed, rpcUrl).then((service) => {
        const rows: Array<{
          entity: EntityLinkProps['entity'];
          entityId: EntityLinkProps['entityId'];
          description: React.ReactNode;
        }> = []

        if (service) {
          rows.push({
            entity: 'service',
            entityId: service.id,
            description: service.name!
          })
        }

        setState({
          loading: false,
          rows,
          error: false
        })
      }).catch(() => {
        setState({
          loading: false,
          rows: [],
          error: true
        })
      })
    }
  }

  useEffect(() => {
    getRows()
    // eslint-disable-next-line
  }, [valueTrimmed])

  if (error) {
    return (
      <div className={"flex flex-col h-[112px] items-center justify-center pt-2"}>
        <CircleAlert className={"h-8 w-8 text-[color:--warning]"}/>
        <p className={"text-sm font-semibold mt-2"}>
          There was an error fetching the data.
        </p>
        <Button onClick={getRows}>Retry</Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={"flex h-[112px] items-center justify-center p-4"}>
        <Loader2 className={"w-12 h-12 animate-spin stroke-[color:--primary]"}/>
      </div>
    )
  }

  if (!rows.length) {
    return <IndexerSearch value={value} close={close} rpcUrl={rpcUrl} />
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

function IndexerSearch({value, close}: SearchContentProps) {
  const valueTrimmed = value.trim()
  const rows: Array<{
    entity: EntityLinkProps['entity'];
    entityId: EntityLinkProps['entityId'];
    description: React.ReactNode;
  }> = []
  let error = false

  if (isValidPoktAddress(valueTrimmed) && !valueTrimmed.startsWith(VALIDATOR_PREFIX)) {
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
          entity: (entity === 'application' ? 'app' : entity) as EntityLinkProps['entity'],
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
      const block = data.blocks?.nodes?.at(0)
      if (block) {
        rows.push({
          entity: 'block',
          entityId: block.height,
          description: (
            <>
              <DateCellText value={block.timestamp}/> - {block.totalTxs} Transactions
            </>
          )
        })
      }

      if (data.transaction) {
        const amountOfMessages = data?.transaction?.amountOfMessages?.reduce((acc, curr) => acc + curr.amount, 0) || 0
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
                {data.transaction.amountOfMessages?.at(0)?.type?.split('.')?.at(-1)?.replace('Msg', '') || 'Unknown'}
              </span>
              {amountOfMessages > 1 && (
                <span className={"text-[color:--secondary] text-xs font-semibold"}>
                  +{amountOfMessages - 1}
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
    }
  } else if (isValidPoktAddress(valueTrimmed) && valueTrimmed.startsWith(VALIDATOR_PREFIX)) {
    // eslint-disable-next-line
    const {data, error: errorFromRequest} = useSuspenseQuery(searchValidatorByAddress, {
      variables: {
        address: valueTrimmed
      }
    })

    if (errorFromRequest) {
      error = true
    } else if (data?.validator) {
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
    // search for services
  } else {
    // eslint-disable-next-line
    const {data, error: errorFromRequest} = useSuspenseQuery(searchServicesDocument, {
      variables: {
        text: valueTrimmed
      }
    })

    if (errorFromRequest) {
      error = true
    } else {
      if (data?.services?.nodes?.length) {
        const newRows: typeof rows = data.services.nodes.map((service) => ({
          entity: 'service',
          entityId: service.id!,
          description: service.name!
        }))

        rows.push(...newRows)
      }
    }
  }

  if (error) {
    // todo: Add error handling
  }

  if (!rows.length) {
    return (
      <EmptySearch />
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

interface SearchContentProps {
  value: string;
  close: () => void;
  rpcUrl: string
}

export default function SearchContent({value, close, rpcUrl}: SearchContentProps) {
  const valueTrimmed = value.trim()

  if (!valueTrimmed) {
    return null
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {data, error: errorFromMetadata} = useSuspenseQuery(indexerMetadataDocument)

  if (errorFromMetadata) {
    return (
      <RpcSearch value={valueTrimmed} close={close} rpcUrl={rpcUrl} />
    )
  }

  if (isNaN(Number(valueTrimmed)) ? getUseRpcData(data) : data!._metadata!.lastProcessedHeight! < Number(valueTrimmed)) {
    return (
      <RpcSearch value={valueTrimmed} close={close} rpcUrl={rpcUrl} />
    )
  }

  return <IndexerSearch value={valueTrimmed} close={close} rpcUrl={rpcUrl} />
}
