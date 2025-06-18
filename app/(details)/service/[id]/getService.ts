import type { ApolloClient } from '@apollo/client'
import { getUrl } from '@/app/components/RawEntity/utils'
import { serviceByIdDocument } from '@/app/(details)/service/[id]/operations'
import { parseServiceFromIndexer } from '@/app/(details)/service/[id]/rows'
import { fetchDataFromRpcOrIndexer } from '@/app/utils/fetch'

export type RelayMiningDifficultyResponseFromRpc = {
  relayMiningDifficulty: {
    service_id: string
    block_height: string
    num_relays_ema: string
    target_hash: string
  }
}

export type ServiceResponseFromRpc = {
  service: {
    id: string
    name: string
    compute_units_per_relay: string
    owner_address: string
  }
}

export interface ServiceDetail {
  id: string
  name: string
  computeUnitsPerRelay: string
  ownerAddress: string
  relayMiningDifficulty: string | null
  applications: number | null
  suppliers: number | null
}

export async function getServiceFromRpc(serviceId: string, rpcUrl: string): Promise<ServiceDetail | null> {
  const [service, relayMiningDifficulty] = await Promise.all([
    fetch(getUrl(rpcUrl, 'service', serviceId)).then((res) => {
      if (res.status === 404) {
        return null
      }

      return res.json().then((data) => data.service as ServiceResponseFromRpc['service'])
    }),
    fetch(`${rpcUrl}/pokt-network/poktroll/service/relay_mining_difficulty/${serviceId}`).then((res) => {
      if (res.status === 404) {
        return null
      }

      return res.json().then((data) => data.relayMiningDifficulty as RelayMiningDifficultyResponseFromRpc['relayMiningDifficulty'])
    })
  ])

  if (!service) {
    return null
  }

  return {
    id: service.id,
    name: service.name,
    computeUnitsPerRelay: service.compute_units_per_relay,
    ownerAddress: service.owner_address,
    relayMiningDifficulty: relayMiningDifficulty?.num_relays_ema || null,
    applications: null,
    suppliers: null,
  }
}

async function getServiceFromIndexer(serviceId: string, apolloClient: ApolloClient<any>): Promise<ServiceDetail | null> {
  const { data } = await apolloClient.query({
    query: serviceByIdDocument,
    variables: {
      id: serviceId
    }
  })

  return parseServiceFromIndexer(data)
}

export type GetServiceResult = Awaited<ReturnType<typeof GetService>>

export default async function GetService(id: string, rpcUrl: string, apolloClient: ApolloClient<any>) {
  return await fetchDataFromRpcOrIndexer({
    getFromRpc: getServiceFromRpc,
    getFromIndexer: getServiceFromIndexer,
    id,
    rpcUrl,
    apolloClient,
  })
}
