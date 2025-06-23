import type { ApolloClient } from '@apollo/client'
import { cache } from 'react'
import { getUrl } from '@/app/components/RawEntity/utils'
import { servicesOfSupplier, supplierByIdDocument } from './operations'
import { formatAmount } from '@/app/utils/format'
import { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { getStakeLabel, getStakeType } from '@/app/utils/stake'
import { fetchDataFromRpcOrIndexer } from '@/app/utils/fetch'

export interface SupplierResponseFromRpc {
  supplier: {
    owner_address: string
    operator_address: string
    stake: {
      denom: string
      amount: string
    }
    services: Array<{
      service_id: string
      endpoints: Array<{
        url: string
        rpc_type: string
        configs: Array<any>
      }>
      rev_share: Array<{
        address: string
        rev_share_percentage: string
      }>
    }>
    unstake_session_end_height: string
    service_config_history: Array<{
      operator_address: string
      service: {
        service_id: string
        endpoints: Array<{
          url: string
          rpc_type: string
          configs: Array<any>
        }>
        rev_share: Array<{
          address: string
          rev_share_percentage: string
        }>
      }
      activation_height: string
      deactivation_height: string
    }>
  }
}


export const getRawSupplierFromRpc = cache(async (id: string, rpcUrl: string) => {
  return fetch(
    getUrl(rpcUrl, 'supplier', id)
  ).then(res => {
    if (res.status === 404) {
      return null
    }

    return res.json().then(data => data.supplier) as SupplierResponseFromRpc['supplier']
  })
})

export interface Supplier {
  status: string
  stakeType: string
  stakeAmount: string
  operatorAddress: string
  balance: string
  ownerAddress: string
  ownerBalance: string | null,
  unstakingBeginAt: string | null,
  unstakingEndAt: string | null,
  unstakedAt: string | null,
}

export async function getSupplierFromRpc(id: string, rpcUrl: string): Promise<Supplier | null> {
  const [supplier, balance] = await Promise.all([
    getRawSupplierFromRpc(id, rpcUrl),
    fetch(
      `${rpcUrl}/cosmos/bank/v1beta1/balances/${id}/by_denom?denom=upokt`
    ).then(res => res.json().then(data => data.balance))
  ])

  if (!supplier) return null

  const isStaked = supplier.unstake_session_end_height === "0"
  return {
    status: isStaked ? "Staked" : "Unstaking",
    stakeType: isStaked ? supplier.operator_address !== supplier.owner_address ? "Non-Custodian" : 'Custodian' : '-',
    stakeAmount: formatAmount(supplier.stake),
    operatorAddress: supplier.operator_address,
    balance: formatAmount(balance),
    ownerAddress: supplier.owner_address,
    ownerBalance: null,
    unstakingBeginAt: null,
    unstakingEndAt: null,
    unstakedAt: null,
  }
}

async function getSupplierFromIndexer(id: string, apolloClient: ApolloClient<any>): Promise<Supplier | null> {
  const {data} = await apolloClient.query({
    query: supplierByIdDocument,
    variables: {
      id
    }
  })

  if (!data?.supplier) return null

  return parseSupplierFromIndexer(data)
}

export function parseSupplierFromIndexer(data: DocumentNodeData<typeof supplierByIdDocument>): Supplier {
  // eslint-disable-next-line
  // @ts-ignore
  if (!data?.supplier) return null

  const supplierFromIndexer = data.supplier!

  return {
    status: getStakeLabel(supplierFromIndexer!.stakeStatus),
    stakeType: getStakeType(supplierFromIndexer!.stakeStatus, supplierFromIndexer!.id, supplierFromIndexer!.owner?.id),
    stakeAmount: formatAmount({
      amount: supplierFromIndexer!.stakeAmount,
      denom: supplierFromIndexer!.stakeDenom
    }),
    operatorAddress: supplierFromIndexer.id,
    balance: formatAmount(supplierFromIndexer.operator?.balances?.nodes?.find(c => c!.denom === 'upokt') || {
      amount: '0',
      denom: 'upokt'
    }),
    ownerAddress: supplierFromIndexer.owner?.id || supplierFromIndexer.id,
    ownerBalance: formatAmount(supplierFromIndexer.owner?.balances?.nodes?.find(c => c!.denom === 'upokt') || {
      amount: '0',
      denom: 'upokt'
    }),
    unstakingBeginAt: supplierFromIndexer.unstakingBeginBlock?.height || null,
    unstakingEndAt: supplierFromIndexer.unstakingEndHeight,
    unstakedAt: supplierFromIndexer.unstakingEndBlock?.height || null,
  }
}

export type GetSupplierResult = Awaited<ReturnType<typeof getSupplier>>

export default async function getSupplier(id: string, rpcUrl: string, apolloClient: ApolloClient<any>) {
  return await fetchDataFromRpcOrIndexer({
    getFromIndexer: getSupplierFromIndexer,
    getFromRpc: getSupplierFromRpc,
    id,
    rpcUrl,
    apolloClient,
  })
}

export async function getServicesOfSupplier(id: string, apolloClient: ApolloClient<any>) {
  const services: Array<SupplierResponseFromRpc['supplier']['services'][number] & {activatedAt: string}> = []
  let cursor: string | null = null

  while (true) {
    const {data} = await apolloClient.query({
      query: servicesOfSupplier,
      variables: {
        address: id,
        cursor,
      }
    })

    services.push(
      ...data.supplierServiceConfigs.nodes.map(service => ({
        service_id: service.serviceId,
        endpoints: service.endpoints.map(endpoint => ({
          url: endpoint.url,
          rpc_type: endpoint.rpcType,
          configs: endpoint.configs.map(config => ({
            key: config.key,
            value: config.value,
          }))
        })),
        rev_share: service.revShare.map(revShare => ({
          address: revShare.address,
          rev_share_percentage: revShare.revSharePercentage,
        })),
        activatedAt: service.activatedAtId,
      }))
    )

    cursor = data.supplierServiceConfigs.pageInfo.endCursor

    if (data.supplierServiceConfigs.nodes.length < 100) {
      break
    }

  }


  return services
}
