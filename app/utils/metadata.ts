import type { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { indexerMetadataDocument } from '@/app/operations/metadata'

export function getUseRpcData(metadata: DocumentNodeData<typeof indexerMetadataDocument>) {
  return metadata._metadata.lastProcessedHeight < metadata._metadata.targetHeight
}
