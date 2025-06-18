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
  }: FetchDataFromRpcOrIndexerOptions<T>
): Promise<FetchResult<T>> {
  try {
    let metadata: DocumentNodeData<typeof indexerMetadataDocument>
    try {
      metadata = await apolloClient.query({
        query: indexerMetadataDocument
      }).then((res) => res.data)
    } catch {
      return {
        data: await getFromRpc(id, rpcUrl),
        source: 'rpc'
      }
    }

    if (isBlock ? isNaN(Number(id)) || metadata!._metadata!.lastProcessedHeight! < Number(id) : getUseRpcData(metadata)) {
      try {
        return {
          data: await getFromRpc(id, rpcUrl),
          source: 'rpc',
          height: metadata?._metadata?.targetHeight || undefined
        }
      } catch {
        return {
          data: await getFromIndexer(id, apolloClient),
          source: 'indexer',
          height: metadata?._metadata?.lastProcessedHeight || undefined
        }
      }
    }

    try {
      return {
        data: await getFromIndexer(id, apolloClient),
        source: 'indexer',
        height: metadata?._metadata?.lastProcessedHeight || undefined
      }
    } catch {
      return {
        data: await getFromRpc(id, rpcUrl),
        source: 'rpc',
        height: metadata?._metadata?.targetHeight || undefined
      }
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
