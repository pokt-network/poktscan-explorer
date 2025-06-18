import type { ApolloClient } from '@apollo/client'
import { accountByIdDocument } from '@/app/(details)/account/[id]/operations'
import { fetchDataFromRpcOrIndexer } from '@/app/utils/fetch'
import { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'

interface Account {
  amount: string
  height: string | null
  timestamp: string | null
}

export async function getFromRpc(address: string, rpcUrl: string): Promise<Account> {
  const amount = await fetch(
    `${rpcUrl}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=upokt`
  ).then(res => res.json().then(data => {
    return data.balance.amount
  }))

  return {
    amount,
    height: null,
    timestamp: null,
  }
}

async function getFromIndexer(address: string, apolloClient: ApolloClient<any>): Promise<Account> {
  const {data} = await apolloClient.query({
    query: accountByIdDocument,
    variables: {
      id: address,
    }
  })

  return parseAccountFromIndexer(data)
}

export function parseAccountFromIndexer(data: DocumentNodeData<typeof accountByIdDocument>) {
  const balance = data.account?.balances?.nodes?.find(balance => balance.denom === 'upokt')

  return {
    amount: balance?.amount || '0',
    height: balance?.lastUpdatedBlock?.height,
    timestamp: balance?.lastUpdatedBlock?.timestamp,
  }
}

export type GetAccountResult = Awaited<ReturnType<typeof getAccount>>

export default async function getAccount(address: string, rpcUrl: string, apolloClient: ApolloClient<any>) {
  return await fetchDataFromRpcOrIndexer({
    getFromRpc,
    getFromIndexer,
    id: address,
    rpcUrl,
    apolloClient
  })
}
