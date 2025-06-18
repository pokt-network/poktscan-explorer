import type { ApolloClient } from '@apollo/client'
import { getUrl } from '@/app/components/RawEntity/utils'
import { appByIdDocument } from '@/app/(details)/app/[id]/operations'
import { cache } from 'react'
import { StakeStatus } from '@/app/config/gql/graphql'
import { fetchDataFromRpcOrIndexer } from '@/app/utils/fetch'
import { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'

export type ApplicationResponseFromRpc = {
  application: {
    address: string
    stake: {
      denom: string
      amount: string
    }
    service_configs: Array<{
      service_id: string
    }>
    delegatee_gateway_addresses: Array<string>
    pending_undelegations: object
    unstake_session_end_height: string
    pending_transfer: {
      destination_address?: string,
      session_end_height?: string
    }
  }
}

export const getRawAppFromRpc = cache(async (address: string, rpcUrl: string) => {
  return await fetch(getUrl(rpcUrl, 'app', address)).then(res => {
    if (res.status === 404) {
      return null
    } else {
      return res.json().then(res => res.application)
    }
  }) as Promise<ApplicationResponseFromRpc['application']>
})

export interface Application {
  balance: string
  status: string
  stake: string
  services: Array<string>,
  unstakingBeginAt: number | null,
  unstakingEndsAt: number | null,
  unstakedAt: number | null,
  transferredFrom: string | null,
  transferredAt: string | null,
  transferringTo: string | null,
  transferEndHeight: number | string | null,
  transferredTo: string | null,
  transferEndedAt: number | null
}

export async function getAppDetailFromRcp(address: string, rpcUrl: string): Promise<Application | null> {
  const [application, balance] = await Promise.all([
    getRawAppFromRpc(address, rpcUrl),
    fetch(
      `${rpcUrl}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=upokt`
    ).then(res => res.json().then(data => data.balance.amount))
  ])

  if (!application) {
    return null
  }

  return {
    balance: balance,
    status: application.unstake_session_end_height === '0' ? 'Staked' : 'Unstaking/Unstaked',
    stake: application.stake.amount,
    services: application.service_configs.map(service => service.service_id),
    unstakingBeginAt: null,
    unstakingEndsAt: null,
    unstakedAt: null,
    transferredFrom: null,
    transferredAt: null,
    transferringTo: application.pending_transfer?.destination_address || null,
    transferEndHeight: application.pending_transfer?.session_end_height || null,
    transferredTo: null,
    transferEndedAt: null
  }
}

async function getAppDetailFromIndexer(address: string, apolloClient: ApolloClient<any>): Promise<Application | null> {
  const {data} = await apolloClient.query({
    query: appByIdDocument,
    variables: {
      id: address
    }
  })

  if (!data.application) return null

  return parseAppFromIndexer(data)
}

export function parseAppFromIndexer(data: DocumentNodeData<typeof appByIdDocument>) {
  const application = data.application

  return {
    balance: application.account?.balances?.nodes?.find(balance => balance.denom === 'upokt')?.amount || '0',
    status: application.stakeStatus === StakeStatus.Staked ? 'Staked' : application.stakeStatus === StakeStatus.Unstaking ? 'Unstaking' : 'Unstaked',
    stake: application.stakeAmount,
    services: application.services?.nodes?.map(service => service.serviceId),
    unstakingBeginAt: application.unstakingBeginBlock?.height,
    unstakingEndsAt: application.unstakingEndHeight,
    unstakedAt: application.unstakingEndBlock?.height,
    transferredFrom: application.sourceApplicationId || null,
    transferredAt: application.transferredFromAt?.height,
    transferringTo: application.transferringToId || null,
    transferEndHeight: application.transferEndHeight,
    transferredTo: application.destinationApplicationId || null,
    transferEndedAt: application.transferEndBlock?.height
  }
}

export type GetAppResult = Awaited<ReturnType<typeof getApp>>

export default async function getApp(id: string, rpcUrl: string, apolloClient: ApolloClient<any>) {
  return await fetchDataFromRpcOrIndexer({
    getFromRpc: getAppDetailFromRcp,
    getFromIndexer: getAppDetailFromIndexer,
    id,
    rpcUrl,
    apolloClient,
  })
}
