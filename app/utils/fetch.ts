import type { ApolloClient } from '@apollo/client'
import { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { indexerMetadataDocument } from '@/app/operations/metadata'
import { getUseRpcData } from '@/app/utils/metadata'

interface FetchDataFromRpcOrIndexerOptions<T> {
  getFromRpc: (id: string, rpcUrl: string) => Promise<T>,
  getFromIndexer: (id: string, apolloClient: ApolloClient<any>) => Promise<T>,
  id: string,
  rpcUrl: string,
  apolloClient: ApolloClient<any>
  isBlock?: boolean
  fetchIndexerIfRpcNotFound?: boolean
}

export interface FetchResult<T> {
  data: T | null
  source: 'rpc' | 'indexer' | null
  error?: true
  height?: string | number
}

export async function fetchDataFromRpcOrIndexer<T>(
  {
    getFromRpc,
    getFromIndexer,
    id,
    rpcUrl,
    apolloClient,
    isBlock = false,
    fetchIndexerIfRpcNotFound = true,
  }: FetchDataFromRpcOrIndexerOptions<T>
): Promise<FetchResult<T>> {


  try {
    let metadata: DocumentNodeData<typeof indexerMetadataDocument>

    const fetchFromRpc = async () => {
      return {
        data: await getFromRpc(id, rpcUrl),
        source: 'rpc' as const,
        height: metadata?._metadata?.targetHeight || undefined
      }
    }

    const fetchFromIndexer = async () => {
      return {
        data: await getFromIndexer(id, apolloClient),
        source: 'indexer' as const,
        height: metadata?._metadata?.lastProcessedHeight || undefined
      }
    }

    try {
      metadata = await apolloClient.query({
        query: indexerMetadataDocument
      }).then((res) => res.data)
    } catch {
      return await fetchFromRpc()
    }

    if (isBlock ? isNaN(Number(id)) || metadata!._metadata!.lastProcessedHeight! < Number(id) : getUseRpcData(metadata)) {
      let dataFromRpc: T | null = null

      try {
        dataFromRpc = await getFromRpc(id, rpcUrl)
      } catch {
        return await fetchFromIndexer()
      }

      if (dataFromRpc || !fetchIndexerIfRpcNotFound) {
        return {
          data: dataFromRpc,
          source: 'rpc',
          height: metadata?._metadata?.targetHeight || undefined
        }
      }

      return await fetchFromIndexer()
    }

    try {
      return await fetchFromIndexer()
    } catch {
      return await fetchFromRpc()
    }
  } catch {
    return {
      data: null,
      source: null,
      error: true,
      height: undefined,
    }
  }
}
