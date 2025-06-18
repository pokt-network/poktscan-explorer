import { getUrl } from '@/app/components/RawEntity/utils'
import { gatewayByIdDocument } from '@/app/(details)/gateway/[id]/operations'
import { StakeStatus } from '@/app/config/gql/graphql'
import { ApolloClient } from '@apollo/client'
import { fetchDataFromRpcOrIndexer } from '@/app/utils/fetch'
import { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'

export type GatewayResponseFromRpc = {
  gateway: {
    address: string
    stake: {
      amount: string
      denom: string
    }
    unstake_session_end_height: string
  }
}

export async function getGatewayFromRpc(address: string, rpcUrl: string) {
  const [gateway, balance] = await Promise.all([
    fetch(getUrl(rpcUrl, 'gateway', address)).then(res => {
      if (res.status === 404) {
        return null
      } else {
        return res.json().then(res => res.gateway)
      }
    }) as Promise<GatewayResponseFromRpc['gateway']>,
    fetch(
      `${rpcUrl}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=upokt`
    ).then(res => res.json().then(data => data.balance.amount))
  ])

  if (!gateway) {
    return null
  }

  return {
    balance: balance,
    stake: gateway.stake.amount,
    status: gateway.unstake_session_end_height === '0' ? 'Staked' : 'Unstaking/Unstaked',
    unstakingBeginAt: null,
    unstakingEndsAt: null,
    unstakedAt: null,
  }
}

async function getGatewayFromIndexer(address: string, apolloClient: ApolloClient<any>) {
  const {data} = await apolloClient.query({
    query: gatewayByIdDocument,
    variables: {
      id: address,
    }
  })

  if (!data.gateway) {
    return null
  }

  return parseGatewayFromIndexer(data)
}


export function parseGatewayFromIndexer(data: DocumentNodeData<typeof gatewayByIdDocument>) {
  return {
    balance: data.gateway?.account?.balances?.nodes?.find(balance => balance.denom === 'upokt')?.amount || '0',
    stake: data!.gateway.stakeAmount,
    status: data!.gateway.stakeStatus === StakeStatus.Staked ? 'Staked' : data!.gateway.stakeStatus === StakeStatus.Unstaking ? 'Unstaking' : 'Unstaked',
    unstakingBeginAt: data!.gateway.unstakingBeginBlock?.height,
    unstakingEndsAt: data!.gateway.unstakingEndHeight,
    unstakedAt: data!.gateway.unstakingEndBlock?.height,
  }
}

export type GetGatewayResult = Awaited<ReturnType<typeof getGateway>>

export default async function getGateway(address: string, rpcUrl: string, apolloClient: ApolloClient<any>) {
  return await fetchDataFromRpcOrIndexer({
    id: address,
    rpcUrl,
    apolloClient,
    getFromRpc: getGatewayFromRpc,
    getFromIndexer: getGatewayFromIndexer,
  })
}
